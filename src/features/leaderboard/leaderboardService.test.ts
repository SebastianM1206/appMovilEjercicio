import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firebasePaths } from '../../data/firebase/paths';
import { leaderboardService } from './leaderboardService';

const queryMock = vi.fn();
const readMock = vi.fn();

vi.mock('../../data/firebase/rtdb', () => ({
  rtdb: {
    query: (...args: unknown[]) => queryMock(...args),
    read: (...args: unknown[]) => readMock(...args),
  },
}));

describe('leaderboardService', () => {
  beforeEach(() => {
    queryMock.mockReset();
    readMock.mockReset();
    leaderboardService.clearDisplayNameCache();
  });

  it('queries agg period path ordered by score', async () => {
    queryMock.mockResolvedValueOnce({
      userA: { distanceM: 3000, runCount: 1, score: 3000 },
      userB: { distanceM: 8000, runCount: 2, score: 8000 },
    });
    readMock.mockResolvedValueOnce({ displayName: 'Runner B' });
    readMock.mockResolvedValueOnce({ displayName: 'Runner A' });

    const result = await leaderboardService.getTop('2026-22', 50);

    expect(queryMock).toHaveBeenCalledWith(firebasePaths.aggPeriod('2026-22'), 'score', 50);
    expect(result[0]?.userId).toBe('userB');
    expect(result[0]?.score).toBe(8000);
    expect(result[1]?.userId).toBe('userA');
  });

  it('returns my weekly agg entry', async () => {
    readMock.mockResolvedValueOnce({ distanceM: 5200, runCount: 2, score: 5200 });
    readMock.mockResolvedValueOnce({ displayName: 'Angel Runner' });

    const result = await leaderboardService.getMyAgg('2026-22', 'user-1');

    expect(readMock).toHaveBeenCalledWith(firebasePaths.agg('2026-22', 'user-1'));
    expect(result).toEqual({
      userId: 'user-1',
      displayName: 'Angel Runner',
      distanceM: 5200,
      runCount: 2,
      score: 5200,
    });
  });

  it('returns null when user has no agg for period', async () => {
    readMock.mockResolvedValueOnce(null);

    const result = await leaderboardService.getMyAgg('2026-22', 'user-1');

    expect(result).toBeNull();
  });

  it('caches display names during session', async () => {
    queryMock.mockResolvedValueOnce({
      userA: { distanceM: 1000, runCount: 1, score: 1000 },
    });
    readMock.mockResolvedValueOnce({ displayName: 'Cached User' });

    await leaderboardService.getTop('2026-22', 10);
    await leaderboardService.getTop('2026-22', 10);

    expect(readMock).toHaveBeenCalledTimes(1);
  });
});
