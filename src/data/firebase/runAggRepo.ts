import { firebasePaths } from './paths';
import { rtdb } from './rtdb';
import type { AggEntry } from './types';

export type CountedLockResult = 'locked_new' | 'already_counted';

export const runAggRepo = {
  async tryAcquireCountedLock(uid: string, runId: string): Promise<CountedLockResult> {
    const countedPath = firebasePaths.counted(uid, runId);
    const result = await rtdb.transaction<boolean | null>(countedPath, (current) => {
      if (current === true) {
        return undefined;
      }
      return true;
    });

    if (result.committed && result.snapshot.val() === true) {
      return 'locked_new';
    }

    return 'already_counted';
  },

  async incrementWeeklyAgg(
    uid: string,
    periodKey: string,
    runId: string,
    distanceM: number,
  ): Promise<AggEntry> {
    const aggPath = firebasePaths.agg(periodKey, uid);
    const result = await rtdb.transaction<AggEntry | null>(aggPath, (current) => {
      const previous = current ?? { distanceM: 0, runCount: 0, score: 0, updatedAt: 0, lastRunId: '' };
      const newDistanceM = (previous.distanceM ?? 0) + distanceM;

      return {
        distanceM: newDistanceM,
        runCount: (previous.runCount ?? 0) + 1,
        score: newDistanceM,
        updatedAt: Date.now(),
        lastRunId: runId,
      };
    });

    return (result.snapshot.val() as AggEntry) ?? {
      distanceM,
      runCount: 1,
      score: distanceM,
      updatedAt: Date.now(),
      lastRunId: runId,
    };
  },

  async hasRunSummary(uid: string, runId: string): Promise<boolean> {
    const summary = await rtdb.read<Record<string, unknown>>(firebasePaths.runSummary(uid, runId));
    return summary !== null;
  },
};
