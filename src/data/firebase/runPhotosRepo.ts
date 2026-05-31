import { firebasePaths } from './paths';
import { rtdb } from './rtdb';

export type RunPhotoRecord = {
  /** Internal id used as the RTDB key. */
  photoId: string;
  /** Cloudinary public_id (used to re-derive URLs / delete from Cloudinary later). */
  publicId: string;
  /** Cloudinary secure_url (https). */
  url: string;
  /** Bytes uploaded (informational). */
  bytes: number;
  width?: number;
  height?: number;
  uploadedAt: number;
};

/**
 * Catálogo de fotos por corrida.
 *
 * Path: `runs/{uid}/{runId}/photos/{photoId}` -> RunPhotoRecord
 *
 * Las imágenes en sí viven en Cloudinary. Aquí solo guardamos la URL y el publicId
 * para poder listarlas y, eventualmente, borrarlas.
 */
export const runPhotosRepo = {
  async write(uid: string, runId: string, record: RunPhotoRecord): Promise<void> {
    await rtdb.write(firebasePaths.runPhoto(uid, runId, record.photoId), record);
  },

  async list(uid: string, runId: string): Promise<RunPhotoRecord[]> {
    const map = (await rtdb.read<Record<string, RunPhotoRecord>>(
      firebasePaths.runPhotos(uid, runId),
    )) ?? {};

    return Object.values(map).sort((a, b) => b.uploadedAt - a.uploadedAt);
  },
};
