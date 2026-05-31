import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Position } from '@capacitor/geolocation';
import { createRunRepoDexie } from '../../../data/dexie/repos/runRepoDexie';
import { authService } from '../../auth/authService';
import { computeRunMetrics } from '../domain/metricsEngine';
import { checkMilestones } from '../domain/progressEngine';
import { createRunRecorder, type RunSample } from '../domain/runRecorder';
import { getErrorMessage } from '../../../shared/utils';
import type { RunPoint } from '../../../shared/types';
import { useGeolocation } from '../../../infra/device/geolocation';
import { useDeviceMotion, useMovementDetection } from '../../../infra/device/motion';
import { useHaptics } from '../../../infra/device/haptics';
import { useDevice } from '../../../infra/device/deviceInfo';
import { scheduleNotification } from '../../../infra/device/notifications';

const formatPaceNotif = (secPerKm: number): string | null => {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return null;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}'${String(s).padStart(2, '0')}"`;
};

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
  pause: (reason?: 'manual' | 'auto') => void;
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

const MOVEMENT_THRESHOLD = 1.1;
const AUTO_PAUSE_IDLE_MS = 15_000;

export const useRunSession = (): UseRunSession => {
  const repo = useMemo(() => createRunRepoDexie(), []);
  const recorder = useMemo(() => createRunRecorder(), []);
  const [state, setState] = useState<RunSessionState>(DEFAULT_STATE);

  const { currentPosition, error: geoError, startWatching, stopWatching } = useGeolocation({
    minimumUpdateIntervalMs: 3_000,
  });
  const { acceleration, error: motionError } = useDeviceMotion({
    enabled: state.status === 'recording' || state.status === 'paused',
  });
  const { isMoving, lastMovementAt } = useMovementDetection(acceleration, MOVEMENT_THRESHOLD);
  const { impact, notify } = useHaptics();
  const { deviceInfo, batteryInfo, reload, reloadBattery } = useDevice();

  const autoPauseRef = useRef(false);
  const tickRef = useRef<number | null>(null);
  const lowBatteryNotifiedRef = useRef(false);
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
      if (sessionIdRef.current) {
        void repo.addEvent({
          sessionId: sessionIdRef.current,
          ts: milestone.event.payload.timestamp,
          type: 'MILESTONE',
          payload: { km: milestone.event.payload.km },
        });
      }
      void notify('SUCCESS');
      const paceLabel = formatPaceNotif(pacePerKmSec);
      void scheduleNotification(
        {
          title: `¡Km ${milestone.event.payload.km} completado!`,
          body: paceLabel ? `Ritmo: ${paceLabel} /km · seguí así` : '¡Seguís avanzando!',
        },
        1,
      );
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
  }, [notify, recorder, repo]);

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

  useEffect(() => {
    if (currentPosition) {
      handlePosition(currentPosition);
    }
  }, [currentPosition, handlePosition]);

  useEffect(() => {
    if (!geoError) {
      return;
    }
    setState((prev) => ({
      ...prev,
      error: geoError,
      gpsReady: false,
    }));
  }, [geoError]);

  useEffect(() => {
    if (!motionError || state.status !== 'recording') {
      return;
    }
    setState((prev) => ({
      ...prev,
      error: motionError,
    }));
  }, [motionError, state.status]);

  useEffect(() => {
    if (!sessionIdRef.current || state.status === 'idle') {
      return;
    }
    if (!deviceInfo && !batteryInfo) {
      return;
    }

    void (async () => {
      const session = await repo.getSession(sessionIdRef.current!);
      if (!session) {
        return;
      }
      await repo.updateSession(sessionIdRef.current!, {
        stats: {
          ...session.stats,
          deviceModel: deviceInfo?.model,
          devicePlatform: deviceInfo?.platform,
          batteryLevel: batteryInfo?.batteryLevel,
        },
      });
    })();
  }, [batteryInfo, deviceInfo, repo, state.status]);

  // Refresca la batería cada 60 s mientras graba para que la advertencia sea oportuna
  useEffect(() => {
    if (state.status !== 'recording') return;
    const id = window.setInterval(() => void reloadBattery(), 60_000);
    return () => window.clearInterval(id);
  }, [state.status, reloadBattery]);

  // Advertencia de batería baja (una sola vez por corrida)
  useEffect(() => {
    const level = batteryInfo?.batteryLevel;
    if (
      typeof level !== 'number' ||
      level > 0.2 ||
      !sessionIdRef.current ||
      lowBatteryNotifiedRef.current
    ) return;
    lowBatteryNotifiedRef.current = true;
    void scheduleNotification(
      {
        title: 'Stride — Batería baja',
        body: `Batería al ${Math.round(level * 100)}%. Guardá tu corrida antes de que se apague.`,
      },
      1,
    );
  }, [batteryInfo]);

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
    void reload();
    void reloadBattery();
    recorder.reset();
    pendingPointsRef.current = [];
    lastMilestoneRef.current = 0;
    pausedAccumRef.current = 0;
    pausedAtRef.current = null;
    startedAtRef.current = Date.now();
    autoPauseRef.current = false;

    try {
      const session = await repo.createSession(user.id, startedAtRef.current);
      sessionIdRef.current = session.id;
      setState({
        ...DEFAULT_STATE,
        status: 'recording',
        sessionId: session.id,
      });
      await startWatching();
      void impact('HEAVY');
      startTicker();
    } catch (error) {
      setState((prev) => ({ ...prev, error: getErrorMessage(error, 'No se pudo iniciar la corrida.') }));
    }
  }, [impact, recorder, reload, reloadBattery, repo, startTicker, startWatching]);

  const pause = useCallback((reason: 'manual' | 'auto' = 'manual') => {
    if (state.status !== 'recording') return;
    pausedAtRef.current = Date.now();
    stopTicker();
    void stopWatching();
    if (sessionIdRef.current) {
      void repo.addEvent({
        sessionId: sessionIdRef.current,
        ts: Date.now(),
        type: 'PAUSE',
        payload: { reason },
      });
    }
    void impact('MEDIUM');
    setState((prev) => ({ ...prev, status: 'paused' }));
  }, [impact, repo, state.status, stopTicker, stopWatching]);

  const resume = useCallback(() => {
    if (state.status !== 'paused') return;
    if (pausedAtRef.current) {
      pausedAccumRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    autoPauseRef.current = false;
    if (sessionIdRef.current) {
      void repo.addEvent({
        sessionId: sessionIdRef.current,
        ts: Date.now(),
        type: 'RESUME',
      });
    }
    void impact('MEDIUM');
    startTicker();
    void startWatching();
    setState((prev) => ({ ...prev, status: 'recording' }));
  }, [impact, repo, startTicker, startWatching, state.status]);

  useEffect(() => {
    if (state.status !== 'recording') {
      return;
    }
    if (!acceleration) {
      return;
    }
    if (isMoving) {
      autoPauseRef.current = false;
      return;
    }
    if (Date.now() - lastMovementAt < AUTO_PAUSE_IDLE_MS) {
      return;
    }
    if (autoPauseRef.current) {
      return;
    }

    autoPauseRef.current = true;
    void scheduleNotification(
      {
        title: 'Stride',
        body: 'Pausamos la corrida por falta de movimiento.',
      },
      1,
    );
    pause('auto');
  }, [acceleration, isMoving, lastMovementAt, pause, state.status]);

  const stop = useCallback(async () => {
    stopTicker();
    await stopWatching();
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
        void notify('SUCCESS');
        const km = (finalMetrics.distanceMeters / 1000).toFixed(2);
        const totalMin = Math.floor(finalMetrics.durationSec / 60);
        const totalSec = Math.round(finalMetrics.durationSec % 60);
        const durationLabel = `${totalMin}:${String(totalSec).padStart(2, '0')}`;
        const paceLabel = formatPaceNotif(
          finalMetrics.distanceMeters > 0
            ? finalMetrics.durationSec / (finalMetrics.distanceMeters / 1000)
            : 0,
        );
        void scheduleNotification(
          {
            title: '¡Corrida finalizada!',
            body: paceLabel
              ? `${km} km en ${durationLabel} · ritmo ${paceLabel} /km`
              : `${km} km completados`,
          },
          1,
        );
      } catch (error) {
        console.error('finish run failed', error);
      }
    }
    setState((prev) => ({ ...prev, status: 'finished' }));
  }, [flushPoints, notify, recorder, repo, stopTicker, stopWatching]);

  const reset = useCallback(() => {
    sessionIdRef.current = null;
    lastMilestoneRef.current = 0;
    pendingPointsRef.current = [];
    pausedAccumRef.current = 0;
    pausedAtRef.current = null;
    startedAtRef.current = 0;
    autoPauseRef.current = false;
    lowBatteryNotifiedRef.current = false;
    recorder.reset();
    setState(DEFAULT_STATE);
  }, [recorder]);

  useEffect(() => {
    return () => {
      stopTicker();
      void stopWatching();
    };
  }, [stopTicker, stopWatching]);

  return {
    ...state,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};
