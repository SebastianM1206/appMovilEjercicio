import { getDatabase, get, ref, set } from 'firebase/database';
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
};
