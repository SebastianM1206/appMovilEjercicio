import { createSyncEngine } from './syncEngine';
import type { RunRepo } from '../run/data/runRepo';
import { firebaseAuth } from '../../data/firebase/auth';

export type SyncServiceConfig = {
  runRepo: RunRepo;
};

export const createSyncService = ({ runRepo }: SyncServiceConfig) => {
  let running = false;

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
    await process();
  };

  const stop = () => {
    running = false;
  };

  return { start, stop, process };
};
