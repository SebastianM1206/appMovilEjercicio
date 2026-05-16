import { firebasePaths } from '../../data/firebase/paths';
import { rtdb } from '../../data/firebase/rtdb';
import { storage } from '../../data/firebase/storage';
import type { RunRepo } from '../run/data/runRepo';
import { getIsoWeekPeriodKey } from '../../shared/utils';

export type SyncEngineConfig = {
  runRepo: RunRepo;
  uid: string;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

const defaultBaseDelay = 5000;
const defaultMaxDelay = 60 * 60 * 1000;

const getNextRetryAt = (attempts: number, baseDelay: number, maxDelay: number) => {
  const delay = Math.min(baseDelay * Math.pow(2, attempts), maxDelay);
  return Date.now() + delay;
};

const serializeRoute = async (points: Array<{ lat: number; lon: number; ts: number }>) => {
  const payload = JSON.stringify({ points });
  return new Blob([payload], { type: 'application/json' });
};

export const createSyncEngine = ({
  runRepo,
  uid,
  baseDelayMs = defaultBaseDelay,
  maxDelayMs = defaultMaxDelay,
}: SyncEngineConfig) => {
  const processOutbox = async (): Promise<void> => {
    const now = Date.now();
    const pending = await runRepo.listPendingOutbox(now);

    for (const op of pending) {
      try {
        if (op.type === 'UPLOAD_ROUTE') {
          const session = await runRepo.getSession(op.sessionId);
          if (!session) {
            await runRepo.markOutboxDone(op.opId);
            continue;
          }

          const routePath = firebasePaths.routePath(uid, op.sessionId);
          const alreadyUploaded = await storage.exists(routePath);
          if (!alreadyUploaded) {
            const points = await runRepo.getPoints(op.sessionId);
            const blob = await serializeRoute(points);
            await storage.upload(routePath, blob, 'application/json');
          }

          await runRepo.updateSession(op.sessionId, {
            sync: { ...session.sync, routeUploaded: true },
          });
          await runRepo.markOutboxDone(op.opId);
          continue;
        }

        if (op.type === 'WRITE_SUMMARY') {
          const session = await runRepo.getSession(op.sessionId);
          if (!session) {
            await runRepo.markOutboxDone(op.opId);
            continue;
          }

          const summaryPath = firebasePaths.runSummary(uid, op.sessionId);
          await rtdb.write(summaryPath, {
            startedAt: session.startedAt,
            endedAt: session.endedAt ?? null,
            durationS: session.totals.durationS,
            distanceM: session.totals.distanceM,
            avgPaceSPerKm: session.totals.avgPaceSPerKm ?? null,
            calories: session.totals.calories ?? null,
            routePath: firebasePaths.routePath(uid, op.sessionId),
          });

          await runRepo.updateSession(op.sessionId, {
            sync: { ...session.sync, summaryUploaded: true },
          });
          await runRepo.markOutboxDone(op.opId);
          continue;
        }

        if (op.type === 'UPDATE_AGG') {
          const session = await runRepo.getSession(op.sessionId);
          if (!session) {
            await runRepo.markOutboxDone(op.opId);
            continue;
          }

          const periodKey = getIsoWeekPeriodKey(session.startedAt);
          const countedPath = firebasePaths.counted(uid, op.sessionId);
          const aggPath = firebasePaths.agg(periodKey, uid);

          const countedResult = await rtdb.transaction(countedPath, (current) => {
            if (current === true) {
              return current;
            }
            return true;
          });

          if (!countedResult.committed) {
            await runRepo.markOutboxDone(op.opId);
            continue;
          }

          await rtdb.transaction(aggPath, (current) => {
            const currentValue = (current as { distanceM?: number; runCount?: number }) ?? {};
            return {
              distanceM: (currentValue.distanceM ?? 0) + session.totals.distanceM,
              runCount: (currentValue.runCount ?? 0) + 1,
              updatedAt: Date.now(),
              lastRunId: op.sessionId,
            };
          });

          await runRepo.updateSession(op.sessionId, {
            sync: { ...session.sync, aggUpdated: true },
            status: 'synced',
          });
          await runRepo.markOutboxDone(op.opId);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown sync error';
        const nextRetryAt = getNextRetryAt(op.attempts + 1, baseDelayMs, maxDelayMs);
        await runRepo.markOutboxFailed(op.opId, message, nextRetryAt);
      }
    }
  };

  return { processOutbox };
};
