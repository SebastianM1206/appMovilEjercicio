import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  getMetadata,
  type UploadMetadata,
} from 'firebase/storage';
import { getFirebaseApp } from './app';

export const storage = {
  getClient() {
    return getStorage(getFirebaseApp());
  },
  upload: async (path: string, data: Blob, contentType?: string): Promise<string> => {
    const fileRef = ref(storage.getClient(), path);
    const metadata: UploadMetadata | undefined = contentType ? { contentType } : undefined;
    await uploadBytes(fileRef, data, metadata);
    return getDownloadURL(fileRef);
  },
  exists: async (path: string): Promise<boolean> => {
    const fileRef = ref(storage.getClient(), path);
    try {
      await getMetadata(fileRef);
      return true;
    } catch {
      return false;
    }
  },
};
