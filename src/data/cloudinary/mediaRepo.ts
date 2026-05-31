import { env } from '../../app/env';
import { rtdb } from '../firebase/rtdb';
import { firebasePaths } from '../firebase/paths';
import { runPhotosRepo } from '../firebase/runPhotosRepo';
import { userPublicRepo } from '../firebase/userPublicRepo';
import type { RunSummary } from '../firebase/types';
import { uploadToCloudinary } from './cloudinaryUploader';

const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_AVATAR_SIZE_BYTES = 1 * 1024 * 1024;

const ensureImageBlob = (blob: Blob, maxBytes: number, tooLargeCode: string): void => {
  if (!blob.type || !blob.type.startsWith('image/')) {
    throw new Error('INVALID_IMAGE_TYPE');
  }

  if (blob.size > maxBytes) {
    throw new Error(tooLargeCode);
  }
};

const createPhotoId = (): string => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

type UploadRunPhotoInput = {
  uid: string;
  runId: string;
  photo: Blob;
  photoId?: string;
};

export type UploadRunPhotoResult = {
  photoId: string;
  publicId: string;
  downloadUrl: string;
  photoCount: number;
};

type UploadAvatarInput = {
  uid: string;
  avatar: Blob;
};

export type UploadAvatarResult = {
  publicId: string;
  downloadUrl: string;
};

export const mediaRepo = {
  async uploadRunPhoto(input: UploadRunPhotoInput): Promise<UploadRunPhotoResult> {
    // Uso cloudinary porque storage yo no iba a meter la tarjeta.
    if (!env.cloudinary.enabled) {
      throw new Error('CLOUDINARY_DISABLED');
    }

    ensureImageBlob(input.photo, MAX_PHOTO_SIZE_BYTES, 'PHOTO_TOO_LARGE');

    const photoId = input.photoId ?? createPhotoId();
    const folder = `${env.cloudinary.runPhotoFolder}/${input.uid}/${input.runId}`;

    const upload = await uploadToCloudinary(input.photo, {
      folder,
      publicId: photoId,
      tags: ['run-photo', `uid:${input.uid}`, `run:${input.runId}`],
      context: { uid: input.uid, runId: input.runId, photoId },
    });

    // Aqui se guarda la imagen de cloudinary (solo la metadata, la foto anda por alla).
    await runPhotosRepo.write(input.uid, input.runId, {
      photoId,
      publicId: upload.publicId,
      url: upload.secureUrl,
      bytes: upload.bytes,
      width: upload.width,
      height: upload.height,
      uploadedAt: Date.now(),
    });

    // Incrementar el contador en el summary (idempotente vía transacción).
    const summaryPath = firebasePaths.runSummary(input.uid, input.runId);
    const tx = await rtdb.transaction<RunSummary>(summaryPath, (current) => {
      if (!current) {
        return undefined;
      }
      return {
        ...current,
        photoCount: Math.max(0, (current.photoCount ?? 0) + 1),
      };
    });

    if (!tx.committed) {
      throw new Error('RUN_SUMMARY_NOT_FOUND');
    }

    const updated = tx.snapshot.val() as RunSummary | null;

    return {
      photoId,
      publicId: upload.publicId,
      downloadUrl: upload.secureUrl,
      photoCount: updated?.photoCount ?? 0,
    };
  },

  async uploadAvatar(input: UploadAvatarInput): Promise<UploadAvatarResult> {
    if (!env.cloudinary.enabled) {
      throw new Error('CLOUDINARY_DISABLED');
    }

    ensureImageBlob(input.avatar, MAX_AVATAR_SIZE_BYTES, 'AVATAR_TOO_LARGE');

    const folder = `${env.cloudinary.avatarFolder}`;
    const upload = await uploadToCloudinary(input.avatar, {
      folder,
      publicId: input.uid,
      tags: ['avatar', `uid:${input.uid}`],
      context: { uid: input.uid },
    });

    // Aqui se guarda la imagen de cloudinary en el perfil publico.
    await userPublicRepo.updatePublicProfile(input.uid, {
      avatarUrl: upload.secureUrl,
    });

    return {
      publicId: upload.publicId,
      downloadUrl: upload.secureUrl,
    };
  },
};
