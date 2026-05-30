import { useCallback, useEffect, useMemo, useState } from 'react';
import { userPublicRepo } from '../../../data/firebase/userPublicRepo';
import { getErrorMessage } from '../../../shared/utils';
import { useAuth } from '../../auth/hooks/useAuth';
import { profileService } from '../profileService';

export type ProfileState = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
};

export type UseProfileResult = {
  profile: ProfileState;
  isLoading: boolean;
  error?: string;
  uploadAvatar: (avatar: Blob) => Promise<void>;
};

export const useProfile = (): UseProfileResult => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const profile = useMemo<ProfileState>(
    () => ({
      displayName: user?.displayName ?? 'Usuario',
      email: user?.email ?? 'Sin email',
      avatarUrl,
    }),
    [user?.displayName, user?.email, avatarUrl],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setAvatarUrl(null);
      return;
    }

    const publicProfile = await userPublicRepo.read(user.id);
    setAvatarUrl(publicProfile?.avatarUrl ?? null);
  }, [user]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!user) {
        setAvatarUrl(null);
        return;
      }

      setError(undefined);
      setIsLoading(true);
      try {
        const publicProfile = await userPublicRepo.read(user.id);
        if (!active) {
          return;
        }
        setAvatarUrl(publicProfile?.avatarUrl ?? null);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(getErrorMessage(loadError, 'No se pudo cargar el perfil.'));
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [user]);

  const uploadAvatar = useCallback(
    async (avatar: Blob) => {
      setError(undefined);
      setIsLoading(true);

      try {
        await profileService.uploadAvatar(avatar);
        await refreshProfile();
      } catch (uploadError) {
        setError(getErrorMessage(uploadError, 'No se pudo subir el avatar.'));
      } finally {
        setIsLoading(false);
      }
    },
    [refreshProfile],
  );

  return {
    profile,
    isLoading,
    error,
    uploadAvatar,
  };
};
