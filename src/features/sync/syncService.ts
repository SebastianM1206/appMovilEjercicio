import { createSyncEngine } from './syncEngine';
import type { RunRepo } from '../run/data/runRepo';
import { authService } from '../auth/authService';
import { createNetworkMonitor } from '../../infra/network/networkMonitor';

export type SyncServiceConfig = {
  runRepo: RunRepo;
};

export type SyncService = {
  start: () => Promise<void>;
  stop: () => void;
  process: () => Promise<void>;
};

export const createSyncService = ({ runRepo }: SyncServiceConfig): SyncService => {
  let running = false;
  let processing = false;
  let processQueued = false;
  const network = createNetworkMonitor();
  let unsubscribeNetwork: (() => void) | null = null;

  const process = async (): Promise<void> => {
    if (processing) {
      processQueued = true;
      return;
    }

    processing = true;
    try {
      do {
        processQueued = false;

        const session = authService.currentUser();
        if (!session) {
          return;
        }

        const engine = createSyncEngine({ runRepo, uid: session.id });
        await engine.processOutbox();
      } while (processQueued);
    } finally {
      processing = false;
    }
  };

  const start = async (): Promise<void> => {
    if (running) {
      return;
    }

    running = true;

    const status = await network.getStatus();
    if (status === 'online') {
      void process();
    }

    unsubscribeNetwork = network.listen((nextStatus) => {
      if (nextStatus === 'online') {
        void process();
      }
    });
  };

  const stop = (): void => {
    running = false;
    if (unsubscribeNetwork) {
      unsubscribeNetwork();
      unsubscribeNetwork = null;
    }
  };

  return { start, stop, process };
};
