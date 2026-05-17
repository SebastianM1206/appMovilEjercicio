import { createSyncEngine } from './syncEngine';
import type { RunRepo } from '../run/data/runRepo';
import { firebaseAuth } from '../../data/firebase/auth';
import { createNetworkMonitor } from '../../infra/network/networkMonitor';

export type SyncServiceConfig = {
  runRepo: RunRepo;
};

export const createSyncService = ({ runRepo }: SyncServiceConfig) => {
  let running = false;
  const network = createNetworkMonitor();
  let unsubscribeNetwork: (() => void) | null = null;

  const process = async () => {
    const session = firebaseAuth.currentSession();
    if (!session) {
      return;
    }

    const engine = createSyncEngine({ runRepo, uid: session.uid });
    await engine.processOutbox();
  };

  const start = async () => {
    if (running) {
      return;
    }

    running = true;

    // Initial check
    const status = await network.getStatus();
    if (status === 'online') {
      void process();
    }

    // Active listening
    unsubscribeNetwork = network.listen((nextStatus) => {
      if (nextStatus === 'online') {
        void process();
      }
    });
  };

  const stop = () => {
    running = false;
    if (unsubscribeNetwork) {
      unsubscribeNetwork();
      unsubscribeNetwork = null;
    }
  };

  return { start, stop, process };
};
