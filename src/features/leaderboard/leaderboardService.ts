import { firebasePaths } from '../../data/firebase/paths';
import { rtdb } from '../../data/firebase/rtdb';
import type { AggEntry, UserPublic } from '../../data/firebase/types';

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  distanceM: number;
  runCount: number;
  score: number;
};

const displayNameCache = new Map<string, string>();

const fetchDisplayName = async (uid: string): Promise<string> => {
  const cached = displayNameCache.get(uid);
  if (cached) {
    return cached;
  }

  const profile = await rtdb.read<UserPublic>(firebasePaths.userPublic(uid));
  const displayName = profile?.displayName ?? 'Usuario';
  displayNameCache.set(uid, displayName);
  return displayName;
};

const mapAggToEntry = async (userId: string, agg: AggEntry): Promise<LeaderboardEntry> => ({
  userId,
  displayName: await fetchDisplayName(userId),
  distanceM: agg.distanceM ?? 0,
  runCount: agg.runCount ?? 0,
  score: agg.score ?? agg.distanceM ?? 0,
});

export const leaderboardService = {
  async getTop(periodKey: string, limit: number): Promise<LeaderboardEntry[]> {
    const size = Math.max(0, limit);
    if (size === 0) {
      return [];
    }

    const path = firebasePaths.aggPeriod(periodKey);
    const aggMap = await rtdb.query<AggEntry>(path, 'score', size);

    const entries = Object.entries(aggMap ?? {})
      .map(([userId, agg]) => ({
        userId,
        distanceM: agg.distanceM ?? 0,
        runCount: agg.runCount ?? 0,
        score: agg.score ?? agg.distanceM ?? 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, size);

    return Promise.all(
      entries.map((entry) =>
        mapAggToEntry(entry.userId, {
          distanceM: entry.distanceM,
          runCount: entry.runCount,
          score: entry.score,
          updatedAt: 0,
          lastRunId: '',
        }),
      ),
    );
  },

  async getMyAgg(periodKey: string, uid: string): Promise<LeaderboardEntry | null> {
    const agg = await rtdb.read<AggEntry>(firebasePaths.agg(periodKey, uid));
    if (!agg) {
      return null;
    }

    return mapAggToEntry(uid, agg);
  },

  clearDisplayNameCache(): void {
    displayNameCache.clear();
  },
};
