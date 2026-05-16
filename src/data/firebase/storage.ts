import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "./app";

export const storage = {
  getClient() {
    return getStorage(getFirebaseApp());
  },
  upload: async (path: string, data: Blob): Promise<string> => {
    const fileRef = ref(storage.getClient(), path);
    await uploadBytes(fileRef, data);
    return getDownloadURL(fileRef);
  },
};
