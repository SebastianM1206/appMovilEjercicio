import { useEffect, useMemo, useState } from 'react';
import { leaderboardService } from '../leaderboardService';
import { firebaseAuth } from '../../../data/firebase/auth';
import { getIsoWeekPeriodKey } from '../../../shared/utils';

export type LeaderboardRow = {
  id: string;
  displayName: string;
  distanceM: number;
  runCount: number;
};

export type LeaderboardState = {
  rows: LeaderboardRow[];
  myEntry: LeaderboardRow | null;
  isLoading: boolean;
};

export const useLeaderboard = (periodKey?: string, limit = 50): LeaderboardState => {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolvedPeriod = useMemo(() => periodKey ?? getIsoWeekPeriodKey(Date.now()), [periodKey]);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setIsLoading(true);
      const uid = firebaseAuth.currentSession()?.uid;
      const [top, mine] = await Promise.all([
        leaderboardService.getTop(resolvedPeriod, limit),
        uid ? leaderboardService.getMyAgg(resolvedPeriod, uid) : Promise.resolve(null),
      ]);

      if (!active) {
        return;
      }

      setRows(
        top.map((entry) => ({
          id: entry.userId,
          displayName: entry.displayName,
          distanceM: entry.distanceM,
          runCount: entry.runCount,
        })),
      );
      setMyEntry(
        mine
          ? {
              id: mine.userId,
              displayName: mine.displayName,
              distanceM: mine.distanceM,
              runCount: mine.runCount,
            }
          : null,
      );
      setIsLoading(false);
    };

    void fetchData();

    return () => {
      active = false;
    };
  }, [resolvedPeriod, limit]);

  return { rows, myEntry, isLoading };
};
