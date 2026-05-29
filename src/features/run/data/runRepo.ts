import type { OutboxOp, RunEvent, RunPoint, RunSession, RunTotals } from '../../../shared/types';

export type RunRecord = {
  id: string;
  startedAt: number;
  durationSec: number;
  distanceMeters: number;
};

export type OutboxInput = Omit<OutboxOp, 'id' | 'attempts' | 'nextRetryAt' | 'createdAt'> & {
  attempts?: number;
  nextRetryAt?: number;
  createdAt?: number;
};

export interface RunRepo {
  saveRun(run: RunRecord): Promise<void>;
  listRuns(): Promise<RunRecord[]>;
  createSession(uid: string, startedAt?: number): Promise<RunSession>;
  updateSessionTotals(sessionId: string, totals: RunTotals): Promise<void>;
  updateSession(sessionId: string, updates: Partial<RunSession>): Promise<void>;
  getSession(sessionId: string): Promise<RunSession | undefined>;
  listSessions(uid: string, limit?: number): Promise<RunSession[]>;
  appendPointsBatch(sessionId: string, points: RunPoint[]): Promise<void>;
  getPoints(sessionId: string): Promise<RunPoint[]>;
  addEvent(event: RunEvent): Promise<void>;
  enqueueOutbox(op: OutboxInput): Promise<OutboxOp>;
  listPendingOutbox(now: number): Promise<OutboxOp[]>;
  countOutbox(): Promise<number>;
  markOutboxDone(opId: string): Promise<void>;
  markOutboxFailed(opId: string, error: string, nextRetryAt: number): Promise<void>;
}

export const createInMemoryRunRepo = (): RunRepo => {
  const runs: RunRecord[] = [];

  return {
    async saveRun(run: RunRecord) {
      runs.push(run);
    },
    async listRuns() {
      return [...runs];
    },
    async createSession() {
      throw new Error('Not implemented');
    },
    async updateSessionTotals() {
      throw new Error('Not implemented');
    },
    async updateSession() {
      throw new Error('Not implemented');
    },
    async getSession() {
      return undefined;
    },
    async listSessions() {
      return [];
    },
    async appendPointsBatch() {
      return;
    },
    async getPoints() {
      return [];
    },
    async addEvent() {
      return;
    },
    async enqueueOutbox() {
      throw new Error('Not implemented');
    },
    async listPendingOutbox() {
      return [];
    },
    async countOutbox() {
      return 0;
    },
    async markOutboxDone() {
      return;
    },
    async markOutboxFailed() {
      return;
    },
  };
};
