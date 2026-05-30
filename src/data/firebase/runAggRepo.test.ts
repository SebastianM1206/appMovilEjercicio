import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firebasePaths } from './paths';
import { runAggRepo } from './runAggRepo';

const transactionMock = vi.fn();
const readMock = vi.fn();

vi.mock('./rtdb', () => ({
  rtdb: {
    transaction: (...args: unknown[]) => transactionMock(...args),
    read: (...args: unknown[]) => readMock(...args),
  },
}));

describe('runAggRepo', () => {
  beforeEach(() => {
    transactionMock.mockReset();
    readMock.mockReset();
  });

  it('acquires counted lock on first attempt', async () => {
    transactionMock.mockResolvedValueOnce({
      committed: true,
      snapshot: { val: () => true },
    });

    const result = await runAggRepo.tryAcquireCountedLock('user-1', 'run-1');

    expect(result).toBe('locked_new');
    expect(transactionMock).toHaveBeenCalledWith(
      firebasePaths.counted('user-1', 'run-1'),
      expect.any(Function),
    );
  });

  it('returns already_counted when lock exists', async () => {
    transactionMock.mockResolvedValueOnce({
      committed: false,
      snapshot: { val: () => true },
    });

    const result = await runAggRepo.tryAcquireCountedLock('user-1', 'run-1');

    expect(result).toBe('already_counted');
  });

  it('aborts transaction updater when counted is already true', async () => {
    transactionMock.mockImplementationOnce(async (_path, updater) => {
      const nextValue = updater(true);
      expect(nextValue).toBeUndefined();
      return { committed: false, snapshot: { val: () => true } };
    });

    await runAggRepo.tryAcquireCountedLock('user-1', 'run-1');
  });

  it('increments weekly agg with score equal to distanceM', async () => {
    transactionMock.mockImplementationOnce(async (_path, updater) => {
      const nextValue = updater({ distanceM: 1000, runCount: 1, score: 1000, updatedAt: 1, lastRunId: 'old' });
      return { committed: true, snapshot: { val: () => nextValue } };
    });

    const result = await runAggRepo.incrementWeeklyAgg('user-1', '2026-22', 'run-2', 5000);

    expect(result).toEqual({
      distanceM: 6000,
      runCount: 2,
      score: 6000,
      updatedAt: expect.any(Number),
      lastRunId: 'run-2',
    });
  });

  it('detects existing run summary', async () => {
    readMock.mockResolvedValueOnce({ distanceM: 5000 });

    const exists = await runAggRepo.hasRunSummary('user-1', 'run-1');

    expect(exists).toBe(true);
    expect(readMock).toHaveBeenCalledWith(firebasePaths.runSummary('user-1', 'run-1'));
  });
});
