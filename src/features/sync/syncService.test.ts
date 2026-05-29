import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSyncService } from './syncService';

const processOutboxMock = vi.fn();

vi.mock('./syncEngine', () => ({
  createSyncEngine: () => ({
    processOutbox: (...args: unknown[]) => processOutboxMock(...args),
  }),
}));

const currentUserMock = vi.fn();

vi.mock('../auth/authService', () => ({
  authService: {
    currentUser: () => currentUserMock(),
  },
}));

vi.mock('../../infra/network/networkMonitor', () => ({
  createNetworkMonitor: () => ({
    getStatus: vi.fn(async () => 'online'),
    listen: vi.fn(() => () => undefined),
  }),
}));

describe('createSyncService', () => {
  beforeEach(() => {
    processOutboxMock.mockReset();
    currentUserMock.mockReset();
    processOutboxMock.mockResolvedValue(undefined);
  });

  it('does not process outbox without authenticated user', async () => {
    currentUserMock.mockReturnValue(null);
    const runRepo = {
      countOutbox: vi.fn(),
      listPendingOutbox: vi.fn(),
    };

    const service = createSyncService({ runRepo: runRepo as never });
    await service.process();

    expect(processOutboxMock).not.toHaveBeenCalled();
  });

  it('processes outbox for authenticated user', async () => {
    currentUserMock.mockReturnValue({ id: 'user-1' });
    const runRepo = {
      countOutbox: vi.fn(),
      listPendingOutbox: vi.fn(),
    };

    const service = createSyncService({ runRepo: runRepo as never });
    await service.process();

    expect(processOutboxMock).toHaveBeenCalledOnce();
  });
});
