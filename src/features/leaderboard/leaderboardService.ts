import { firebasePaths } from '../../data/firebase/paths';
import { rtdb } from '../../data/firebase/rtdb';
import type { AggEntry, UserPublic } from '../../data/firebase/types';

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  distanceM: number;
  runCount: number;
  score: number;
};

type PublicProfileCacheValue = {
  displayName: string;
  avatarUrl: string | null;
};

const profileCache = new Map<string, PublicProfileCacheValue>();

const fetchPublicProfile = async (uid: string): Promise<PublicProfileCacheValue> => {
  const cached = profileCache.get(uid);
  if (cached) {
    return cached;
  }

  const profile = await rtdb.read<UserPublic>(firebasePaths.userPublic(uid));
  const value: PublicProfileCacheValue = {
    displayName: profile?.displayName ?? 'Usuario',
    avatarUrl: profile?.avatarUrl ?? null,
  };
  profileCache.set(uid, value);
  return value;
};

const mapAggToEntry = async (userId: string, agg: AggEntry): Promise<LeaderboardEntry> => {
  const publicProfile = await fetchPublicProfile(userId);

  return {
    userId,
    displayName: publicProfile.displayName,
    avatarUrl: publicProfile.avatarUrl,
    distanceM: agg.distanceM ?? 0,
    runCount: agg.runCount ?? 0,
    score: agg.score ?? agg.distanceM ?? 0,
  };
};

export const leaderboardService = {
  async getTop(periodKey: string, limit: number): Promise<LeaderboardEntry[]> {
    const records = await rtdb.query<AggEntry>(
      firebasePaths.aggPeriod(periodKey),
      'score',
      limit,
    );

    const entries = await Promise.all(
      Object.entries(records).map(([userId, agg]) => mapAggToEntry(userId, agg))
    );

    return entries.sort((a, b) => b.score - a.score);
  },

  async getMyAgg(periodKey: string, uid: string): Promise<LeaderboardEntry | null> {
    const agg = await rtdb.read<AggEntry>(firebasePaths.agg(periodKey, uid));
    if (!agg) {
      return null;
    }

    return mapAggToEntry(uid, agg);
  },

  clearDisplayNameCache(): void {
    profileCache.clear();
  },
};
