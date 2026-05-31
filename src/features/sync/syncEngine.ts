import { firebasePaths } from '../../data/firebase/paths';
import { computeIntegrityFlags, hasFatalIntegrityFlags, MAX_ROUTE_SIZE_BYTES, MIN_POINT_COUNT } from '../../data/firebase/integrity';
import { rtdb } from '../../data/firebase/rtdb';
import { runRouteRepo } from '../../data/firebase/runRouteRepo';
import type { RouteBlob, RunSummary } from '../../data/firebase/types';
import { getSyncMetadata } from '../../infra/device/syncMetadata';
import type { OutboxOp, RunPoint, RunSession } from '../../shared/types';
import { runAggRepo } from '../../data/firebase/runAggRepo';
import { getIsoWeekPeriodKey } from '../../shared/utils';
import type { RunRepo } from '../run/data/runRepo';
import { FATAL_RETRY_AT, isFatalSyncError, SyncError } from './syncErrors';

export type SyncEngineConfig = {
  runRepo: RunRepo;
  uid: string;
  baseDelayMs?: number;
  maxDelayMs?: number;
  getMetadata?: () => Promise<{ appVersion: string; deviceModel: string }>;
};

const defaultBaseDelay = 5000;
const defaultMaxDelay = 60 * 60 * 1000;

const getNextRetryAt = (attempts: number, baseDelay: number, maxDelay: number) => {
  const delay = Math.min(baseDelay * Math.pow(2, attempts), maxDelay);
  return Date.now() + delay;
};

const assertSessionOwner = (session: RunSession, uid: string): void => {
  if (session.uid !== uid) {
    throw new SyncError('UID_MISMATCH', 'La sesion no pertenece al usuario autenticado.');
  }
};

const buildRouteBlob = (sessionId: string, uid: string, points: RunPoint[]): RouteBlob => ({
  version: 1,
  runId: sessionId,
  uid,
  pointCount: points.length,
  points: points.map((point) => ({
    ts: point.ts,
    lat: point.lat,
    lon: point.lon,
    ...(point.accuracyM !== undefined ? { accuracyM: point.accuracyM } : {}),
    ...(point.altitudeM !== undefined ? { altitudeM: point.altitudeM } : {}),
    ...(point.speedMps !== undefined ? { speedMps: point.speedMps } : {}),
    ...(point.bearing !== undefined ? { bearing: point.bearing } : {}),
  })),
});

const buildRunSummary = async (
  session: RunSession,
  uid: string,
  sessionId: string,
  getMetadata: SyncEngineConfig['getMetadata'],
): Promise<RunSummary> => {
  const integrityFlags = computeIntegrityFlags(session);
  if (hasFatalIntegrityFlags(integrityFlags)) {
    const fatalFlag = integrityFlags.find((flag) => flag !== 'OK') ?? 'DISTANCE_TOO_SHORT';
    throw new SyncError(fatalFlag, `Sync rechazado por integridad: ${fatalFlag}`);
  }

  const metadata = await (getMetadata?.() ?? getSyncMetadata());

  return {
    startedAt: session.startedAt,
    endedAt: session.endedAt ?? null,
    durationS: session.totals.durationS,
    distanceM: session.totals.distanceM,
    avgPaceSPerKm: session.totals.avgPaceSPerKm ?? null,
    calories: session.totals.calories ?? null,
    routePath: firebasePaths.runRoute(uid, sessionId),
    photoCount: 0,
    integrityFlags,
    appVersion: metadata.appVersion,
    deviceModel: metadata.deviceModel,
  };
};

export const createSyncEngine = ({
  runRepo,
  uid,
  baseDelayMs = defaultBaseDelay,
  maxDelayMs = defaultMaxDelay,
  getMetadata,
}: SyncEngineConfig) => {
  const executeUploadRoute = async (op: OutboxOp, session: RunSession): Promise<void> => {
    assertSessionOwner(session, uid);

    const alreadyUploaded = await runRouteRepo.exists(uid, op.sessionId);

    if (!alreadyUploaded) {
      const points = await runRepo.getPoints(op.sessionId);
      if (points.length < MIN_POINT_COUNT) {
        throw new SyncError('INSUFFICIENT_POINTS', 'Datos GPS insuficientes para sincronizar la ruta.');
      }

      const routeBlob = buildRouteBlob(op.sessionId, uid, points);
      const payload = JSON.stringify(routeBlob);
      if (new Blob([payload]).size > MAX_ROUTE_SIZE_BYTES) {
        throw new SyncError('ROUTE_TOO_LARGE', 'La ruta excede el limite permitido.');
      }
      await runRouteRepo.write(uid, op.sessionId, routeBlob);
    }

    await runRepo.updateSession(op.sessionId, {
      sync: { ...session.sync, routeUploaded: true },
    });
    await runRepo.markOutboxDone(op.opId);
  };

  const executeWriteSummary = async (op: OutboxOp, session: RunSession): Promise<void> => {
    assertSessionOwner(session, uid);

    const summary = await buildRunSummary(session, uid, op.sessionId, getMetadata);
    const summaryPath = firebasePaths.runSummary(uid, op.sessionId);
    await rtdb.write(summaryPath, summary);

    await runRepo.updateSession(op.sessionId, {
      sync: { ...session.sync, summaryUploaded: true },
    });
    await runRepo.markOutboxDone(op.opId);
  };

  const executeUpdateAgg = async (op: OutboxOp, session: RunSession): Promise<void> => {
    assertSessionOwner(session, uid);

    const summaryReady =
      session.sync.summaryUploaded === true ||
      (await runAggRepo.hasRunSummary(uid, op.sessionId));

    if (!summaryReady) {
      throw new SyncError(
        'SUMMARY_NOT_READY',
        'El resumen de la carrera debe sincronizarse antes del agregado semanal.',
      );
    }

    const lockResult = await runAggRepo.tryAcquireCountedLock(uid, op.sessionId);

    if (lockResult === 'already_counted') {
      await runRepo.updateSession(op.sessionId, {
        sync: { ...session.sync, aggUpdated: true },
        status: 'synced',
      });
      await runRepo.markOutboxDone(op.opId);
      return;
    }

    const periodKey = getIsoWeekPeriodKey(session.startedAt);
    await runAggRepo.incrementWeeklyAgg(uid, periodKey, op.sessionId, session.totals.distanceM);

    await runRepo.updateSession(op.sessionId, {
      sync: { ...session.sync, aggUpdated: true },
      status: 'synced',
    });
    await runRepo.markOutboxDone(op.opId);
  };

  const handleSyncFailure = async (
    op: OutboxOp,
    session: RunSession | undefined,
    error: unknown,
  ): Promise<void> => {
    const message = error instanceof Error ? error.message : 'Unknown sync error';

    if (isFatalSyncError(error)) {
      if (session) {
        await runRepo.updateSession(op.sessionId, {
          status: 'error',
          sync: { ...session.sync, lastError: message },
        });
      }
      await runRepo.markOutboxFailed(op.opId, message, FATAL_RETRY_AT);
      return;
    }

    const nextRetryAt = getNextRetryAt(op.attempts + 1, baseDelayMs, maxDelayMs);
    await runRepo.markOutboxFailed(op.opId, message, nextRetryAt);
  };

  const processOutbox = async (): Promise<void> => {
    const now = Date.now();
    const pending = await runRepo.listPendingOutbox(now);

    for (const op of pending) {
      let session: RunSession | undefined;

      try {
        session = await runRepo.getSession(op.sessionId);
        if (!session) {
          await runRepo.markOutboxDone(op.opId);
          continue;
        }

        if (op.type === 'UPLOAD_ROUTE') {
          await executeUploadRoute(op, session);
          continue;
        }

        if (op.type === 'WRITE_SUMMARY') {
          await executeWriteSummary(op, session);
          continue;
        }

        if (op.type === 'UPDATE_AGG') {
          await executeUpdateAgg(op, session);
        }
      } catch (error) {
        await handleSyncFailure(op, session, error);
      }
    }
  };

  return { processOutbox };
};
