import { firebasePaths } from './paths';
import { rtdb } from './rtdb';
import { storage } from './storage';
import type { RunSummary } from './types';
import { userPublicRepo } from './userPublicRepo';

const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_AVATAR_SIZE_BYTES = 1 * 1024 * 1024;
const DEFAULT_IMAGE_CONTENT_TYPE = 'image/jpeg';

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

type UploadRunPhotoResult = {
  photoId: string;
  path: string;
  downloadUrl: string;
  photoCount: number;
};

type UploadAvatarInput = {
  uid: string;
  avatar: Blob;
};

type UploadAvatarResult = {
  path: string;
  downloadUrl: string;
};

export const mediaRepo = {
  async uploadRunPhoto(input: UploadRunPhotoInput): Promise<UploadRunPhotoResult> {
    ensureImageBlob(input.photo, MAX_PHOTO_SIZE_BYTES, 'PHOTO_TOO_LARGE');

    const photoId = input.photoId ?? createPhotoId();
    const path = firebasePaths.photoPath(input.uid, input.runId, photoId);
    const contentType = input.photo.type || DEFAULT_IMAGE_CONTENT_TYPE;

    const downloadUrl = await storage.upload(path, input.photo, contentType);

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
      path,
      downloadUrl,
      photoCount: updated?.photoCount ?? 0,
    };
  },

  async uploadAvatar(input: UploadAvatarInput): Promise<UploadAvatarResult> {
    ensureImageBlob(input.avatar, MAX_AVATAR_SIZE_BYTES, 'AVATAR_TOO_LARGE');

    const path = firebasePaths.avatarPath(input.uid);
    const contentType = input.avatar.type || DEFAULT_IMAGE_CONTENT_TYPE;
    const downloadUrl = await storage.upload(path, input.avatar, contentType);

    await userPublicRepo.updatePublicProfile(input.uid, {
      avatarUrl: downloadUrl,
    });

    return {
      path,
      downloadUrl,
    };
  },
};
