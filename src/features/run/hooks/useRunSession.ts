import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Geolocation, type Position } from '@capacitor/geolocation';
import { createRunRepoDexie } from '../../../data/dexie/repos/runRepoDexie';
import { authService } from '../../auth/authService';
import { computeRunMetrics } from '../domain/metricsEngine';
import { checkMilestones } from '../domain/progressEngine';
import { createRunRecorder, type RunSample } from '../domain/runRecorder';
import { getErrorMessage } from '../../../shared/utils';
import type { RunPoint } from '../../../shared/types';

export type RunStatus = 'idle' | 'recording' | 'paused' | 'finished';

export type RunSessionState = {
  status: RunStatus;
  sessionId: string | null;
  distanceMeters: number;
  durationSec: number;
  avgSpeed: number;
  pacePerKmSec: number;
  samples: RunSample[];
  milestoneKm: number | null;
  gpsReady: boolean;
  error?: string;
};

export type UseRunSession = RunSessionState & {
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  reset: () => void;
};

const DEFAULT_STATE: RunSessionState = {
  status: 'idle',
  sessionId: null,
  distanceMeters: 0,
  durationSec: 0,
  avgSpeed: 0,
  pacePerKmSec: 0,
  samples: [],
  milestoneKm: null,
  gpsReady: false,
};

export const useRunSession = (): UseRunSession => {
  const repo = useMemo(() => createRunRepoDexie(), []);
  const recorder = useMemo(() => createRunRecorder(), []);
  const [state, setState] = useState<RunSessionState>(DEFAULT_STATE);

  const watchIdRef = useRef<string | null>(null);
  const tickRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const pausedAccumRef = useRef<number>(0);
  const pausedAtRef = useRef<number | null>(null);
  const lastMilestoneRef = useRef<number>(0);
  const pendingPointsRef = useRef<RunPoint[]>([]);
  const sessionIdRef = useRef<string | null>(null);

  const flushPoints = useCallback(async () => {
    if (!sessionIdRef.current || pendingPointsRef.current.length === 0) {
      return;
    }
    const batch = pendingPointsRef.current;
    pendingPointsRef.current = [];
    try {
      await repo.appendPointsBatch(sessionIdRef.current, batch);
    } catch (error) {
      console.error('appendPointsBatch failed', error);
    }
  }, [repo]);

  const recomputeMetrics = useCallback(() => {
    const samples = recorder.getSamples();
    const metrics = computeRunMetrics(samples);
    const now = Date.now();
    const elapsedMs = pausedAtRef.current
      ? pausedAtRef.current - startedAtRef.current - pausedAccumRef.current
      : now - startedAtRef.current - pausedAccumRef.current;
    const durationSec = Math.max(metrics.durationSec, Math.max(0, elapsedMs / 1000));
    const pacePerKmSec =
      metrics.distanceMeters > 0 ? durationSec / (metrics.distanceMeters / 1000) : 0;

    const milestone = checkMilestones(metrics.distanceMeters, lastMilestoneRef.current);
    if (milestone.event) {
      lastMilestoneRef.current = milestone.nextMilestoneKm;
      setState((prev) => ({ ...prev, milestoneKm: milestone.event!.payload.km }));
      window.setTimeout(() => {
        setState((prev) => (prev.milestoneKm === milestone.event!.payload.km ? { ...prev, milestoneKm: null } : prev));
      }, 3200);
    }

    setState((prev) => ({
      ...prev,
      distanceMeters: metrics.distanceMeters,
      durationSec,
      avgSpeed: metrics.avgSpeed,
      pacePerKmSec,
      samples,
    }));
  }, [recorder]);

  const handlePosition = useCallback(
    (position: Position | null) => {
      if (!position) {
        return;
      }
      const sample: RunSample = {
        ts: position.timestamp ?? Date.now(),
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        speed: Math.max(0, position.coords.speed ?? 0),
      };
      recorder.addSample(sample);

      if (sessionIdRef.current) {
        pendingPointsRef.current.push({
          sessionId: sessionIdRef.current,
          ts: sample.ts,
          lat: sample.lat,
          lon: sample.lon,
          speedMps: sample.speed,
          accuracyM: position.coords.accuracy,
          altitudeM: position.coords.altitude ?? undefined,
          bearing: position.coords.heading ?? undefined,
        });
        if (pendingPointsRef.current.length >= 5) {
          void flushPoints();
        }
      }

      setState((prev) => ({ ...prev, gpsReady: true, error: undefined }));
      recomputeMetrics();
    },
    [flushPoints, recomputeMetrics, recorder],
  );

  const startWatch = useCallback(async () => {
    if (watchIdRef.current) {
      return;
    }
    try {
      const id = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 3_000 },
        (position, error) => {
          if (error) {
            setState((prev) => ({
              ...prev,
              error: getErrorMessage(error, 'Error de GPS'),
              gpsReady: false,
            }));
            return;
          }
          handlePosition(position);
        },
      );
      watchIdRef.current = id;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: getErrorMessage(error, 'No se pudo iniciar el GPS. Revisa los permisos.'),
        gpsReady: false,
      }));
    }
  }, [handlePosition]);

  const clearWatch = useCallback(async () => {
    if (!watchIdRef.current) return;
    try {
      await Geolocation.clearWatch({ id: watchIdRef.current });
    } catch {
      // ignore
    }
    watchIdRef.current = null;
  }, []);

  const stopTicker = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTicker = useCallback(() => {
    stopTicker();
    tickRef.current = window.setInterval(() => {
      recomputeMetrics();
    }, 1000);
  }, [recomputeMetrics, stopTicker]);

  const start = useCallback(async () => {
    const user = authService.currentUser();
    if (!user) {
      setState((prev) => ({ ...prev, error: 'Necesitas iniciar sesion para correr.' }));
      return;
    }
    recorder.reset();
    pendingPointsRef.current = [];
    lastMilestoneRef.current = 0;
    pausedAccumRef.current = 0;
    pausedAtRef.current = null;
    startedAtRef.current = Date.now();

    try {
      const session = await repo.createSession(user.id, startedAtRef.current);
      sessionIdRef.current = session.id;
      setState({
        ...DEFAULT_STATE,
        status: 'recording',
        sessionId: session.id,
      });
      await startWatch();
      startTicker();
    } catch (error) {
      setState((prev) => ({ ...prev, error: getErrorMessage(error, 'No se pudo iniciar la corrida.') }));
    }
  }, [recorder, repo, startTicker, startWatch]);

  const pause = useCallback(() => {
    if (state.status !== 'recording') return;
    pausedAtRef.current = Date.now();
    stopTicker();
    setState((prev) => ({ ...prev, status: 'paused' }));
  }, [state.status, stopTicker]);

  const resume = useCallback(() => {
    if (state.status !== 'paused') return;
    if (pausedAtRef.current) {
      pausedAccumRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    startTicker();
    setState((prev) => ({ ...prev, status: 'recording' }));
  }, [startTicker, state.status]);

  const stop = useCallback(async () => {
    stopTicker();
    await clearWatch();
    await flushPoints();
    if (sessionIdRef.current) {
      try {
        const finalMetrics = computeRunMetrics(recorder.getSamples());
        await repo.updateSession(sessionIdRef.current, {
          status: 'finished',
          endedAt: Date.now(),
          totals: {
            distanceM: finalMetrics.distanceMeters,
            durationS: finalMetrics.durationSec,
            avgPaceSPerKm:
              finalMetrics.distanceMeters > 0
                ? finalMetrics.durationSec / (finalMetrics.distanceMeters / 1000)
                : undefined,
          },
        });
        const summaryOpId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-write-summary`;
        const aggOpId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-update-agg`;

        const uploadRouteOpId =
          globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-upload-route`;
        await repo.enqueueOutbox({
          opId: uploadRouteOpId,
          sessionId: sessionIdRef.current,
          type: 'UPLOAD_ROUTE',
        });
        await repo.enqueueOutbox({
          opId: summaryOpId,
          sessionId: sessionIdRef.current,
          type: 'WRITE_SUMMARY',
        });
        await repo.enqueueOutbox({
          opId: aggOpId,
          sessionId: sessionIdRef.current,
          type: 'UPDATE_AGG',
        });
      } catch (error) {
        console.error('finish run failed', error);
      }
    }
    setState((prev) => ({ ...prev, status: 'finished' }));
  }, [clearWatch, flushPoints, recorder, repo, stopTicker]);

  const reset = useCallback(() => {
    sessionIdRef.current = null;
    lastMilestoneRef.current = 0;
    pendingPointsRef.current = [];
    pausedAccumRef.current = 0;
    pausedAtRef.current = null;
    startedAtRef.current = 0;
    recorder.reset();
    setState(DEFAULT_STATE);
  }, [recorder]);

  useEffect(() => {
    return () => {
      stopTicker();
      void clearWatch();
    };
  }, [clearWatch, stopTicker]);

  return {
    ...state,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};
