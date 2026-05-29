import { appDb } from '../db';
import type { OutboxOp, RunEvent, RunPoint, RunSession, RunTotals } from '../../../shared/types';
import type { OutboxInput, RunRecord, RunRepo } from '../../../features/run/data/runRepo';

const defaultTotals: RunTotals = {
  distanceM: 0,
  durationS: 0,
};

const defaultStats = {
  maxSpeedMps: 0,
  avgSpeedMps: 0,
  pointCount: 0,
  badPointCount: 0,
};

const now = () => Date.now();

export const saveRun = async (run: RunRecord): Promise<void> => {
  await appDb.runs.put(run);
};

export const listRuns = async (): Promise<RunRecord[]> => {
  return appDb.runs.toArray();
};

export const createRunRepoDexie = (): RunRepo => {
  return {
    saveRun,
    listRuns,
    async createSession(uid: string, startedAt = now()): Promise<RunSession> {
      const session: RunSession = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        uid,
        status: 'recording',
        startedAt,
        totals: { ...defaultTotals },
        stats: { ...defaultStats },
        sync: {},
      };
      await appDb.sessions.put(session);
      return session;
    },
    async updateSessionTotals(sessionId: string, totals: RunTotals): Promise<void> {
      await appDb.sessions.update(sessionId, { totals });
    },
    async updateSession(sessionId: string, updates: Partial<RunSession>): Promise<void> {
      await appDb.sessions.update(sessionId, updates);
    },
    async getSession(sessionId: string): Promise<RunSession | undefined> {
      return appDb.sessions.get(sessionId);
    },
    async listSessions(uid: string, limit = 50): Promise<RunSession[]> {
      return appDb.sessions.where('uid').equals(uid).reverse().limit(limit).toArray();
    },
    async appendPointsBatch(sessionId: string, points: RunPoint[]): Promise<void> {
      if (points.length === 0) {
        return;
      }

      const batch = points.map((point) => ({ ...point, sessionId }));
      await appDb.points.bulkAdd(batch);

      const session = await appDb.sessions.get(sessionId);
      if (session) {
        const currentStats = session.stats ?? { ...defaultStats };
        await appDb.sessions.update(sessionId, {
          stats: {
            ...currentStats,
            pointCount: (currentStats.pointCount ?? 0) + batch.length,
          },
        });
      }
    },
    async getPoints(sessionId: string): Promise<RunPoint[]> {
      return appDb.points.where('sessionId').equals(sessionId).sortBy('ts');
    },
    async addEvent(event: RunEvent): Promise<void> {
      await appDb.events.add(event);
    },
    async enqueueOutbox(op: OutboxInput): Promise<OutboxOp> {
      const entry: OutboxOp = {
        opId: op.opId,
        sessionId: op.sessionId,
        type: op.type,
        attempts: op.attempts ?? 0,
        nextRetryAt: op.nextRetryAt ?? now(),
        lastError: op.lastError,
        createdAt: op.createdAt ?? now(),
      };

      const id = await appDb.outbox.add(entry);
      return { ...entry, id };
    },
    async listPendingOutbox(referenceTime: number): Promise<OutboxOp[]> {
      return appDb.outbox.where('nextRetryAt').belowOrEqual(referenceTime).sortBy('createdAt');
    },
    async countOutbox(): Promise<number> {
      return appDb.outbox.count();
    },
    async markOutboxDone(opId: string): Promise<void> {
      await appDb.outbox.where('opId').equals(opId).delete();
    },
    async markOutboxFailed(opId: string, error: string, nextRetryAt: number): Promise<void> {
      const items = await appDb.outbox.where('opId').equals(opId).toArray();
      if (items.length === 0) {
        return;
      }

      const entry = items[0];
      if (entry.id === undefined) {
        return;
      }

      await appDb.outbox.update(entry.id, {
        attempts: entry.attempts + 1,
        nextRetryAt,
        lastError: error,
      });
    },
  };
};
