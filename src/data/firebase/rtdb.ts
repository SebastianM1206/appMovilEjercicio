import {
  getDatabase,
  get,
  ref,
  set,
  update,
  runTransaction,
  type TransactionResult,
} from 'firebase/database';
import { getFirebaseApp } from './app';

export const rtdb = {
  getClient() {
    return getDatabase(getFirebaseApp());
  },
  read: async <T>(path: string): Promise<T | null> => {
    const snapshot = await get(ref(rtdb.getClient(), path));
    return snapshot.exists() ? (snapshot.val() as T) : null;
  },
  write: async <T>(path: string, value: T): Promise<void> => {
    await set(ref(rtdb.getClient(), path), value);
  },
  update: async <T extends Record<string, unknown>>(path: string, value: T): Promise<void> => {
    await update(ref(rtdb.getClient(), path), value);
  },
  transaction: async <T>(
    path: string,
    updater: (currentValue: T | null) => T | null,
  ): Promise<TransactionResult> => {
    return runTransaction(ref(rtdb.getClient(), path), updater);
  },
};
