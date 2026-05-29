import { firebasePaths } from './paths';
import { rtdb } from './rtdb';
import type { UserPublic } from './types';

const now = () => Date.now();

const buildNewProfile = (displayName: string): UserPublic => {
  const timestamp = now();
  return {
    displayName: displayName.trim(),
    avatarUrl: null,
    country: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const userPublicRepo = {
  async read(uid: string): Promise<UserPublic | null> {
    return rtdb.read<UserPublic>(firebasePaths.userPublic(uid));
  },

  async createPublicProfile(uid: string, displayName: string): Promise<void> {
    await rtdb.write(firebasePaths.userPublic(uid), buildNewProfile(displayName));
  },

  async ensurePublicProfile(uid: string, displayName: string): Promise<void> {
    const existing = await userPublicRepo.read(uid);
    if (existing) {
      return;
    }
    await userPublicRepo.createPublicProfile(uid, displayName);
  },
};
