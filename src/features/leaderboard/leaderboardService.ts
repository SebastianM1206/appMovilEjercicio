import { rtdb } from '../../data/firebase/rtdb';
import { firebasePaths } from '../../data/firebase/paths';

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  distanceM: number;
  runCount: number;
};

export type UserPublicProfile = {
  displayName?: string;
};

export type AggEntry = {
  distanceM?: number;
  runCount?: number;
  updatedAt?: number;
  lastRunId?: string;
};

const fetchDisplayName = async (uid: string): Promise<string> => {
  const profile = await rtdb.read<UserPublicProfile>(firebasePaths.userPublic(uid));
  return profile?.displayName ?? 'Usuario';
};

export const leaderboardService = {
  async getTop(periodKey: string, limit: number): Promise<LeaderboardEntry[]> {
    const size = Math.max(0, limit);
    if (size === 0) {
      return [];
    }

    const path = firebasePaths.agg(periodKey, '');
    const aggMap = await rtdb.query<AggEntry>(path, 'distanceM', size);
    const entries = Object.entries(aggMap ?? {})
      .map(([userId, agg]) => ({
        userId,
        distanceM: agg.distanceM ?? 0,
        runCount: agg.runCount ?? 0,
      }))
      .sort((a, b) => b.distanceM - a.distanceM)
      .slice(0, size);

    const resolved = await Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        displayName: await fetchDisplayName(entry.userId),
      })),
    );

    return resolved;
  },
  async getMyAgg(periodKey: string, uid: string): Promise<LeaderboardEntry | null> {
    const agg = await rtdb.read<AggEntry>(firebasePaths.agg(periodKey, uid));
    if (!agg) {
      return null;
    }

    return {
      userId: uid,
      displayName: await fetchDisplayName(uid),
      distanceM: agg.distanceM ?? 0,
      runCount: agg.runCount ?? 0,
    };
  },
};
