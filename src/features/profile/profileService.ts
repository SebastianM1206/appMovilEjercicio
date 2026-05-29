import { authService } from '../auth/authService';
import { mediaRepo } from '../../data/firebase/mediaRepo';

const mapAvatarUploadError = (error: unknown): Error => {
  if (error instanceof Error) {
    if (error.message === 'AUTH_REQUIRED') {
      return new Error('Debes iniciar sesion para subir un avatar.');
    }
    if (error.message === 'INVALID_IMAGE_TYPE') {
      return new Error('Selecciona una imagen valida para el avatar.');
    }
    if (error.message === 'AVATAR_TOO_LARGE') {
      return new Error('El avatar excede el limite de 1 MB.');
    }
    if (error.message === 'PUBLIC_PROFILE_NOT_FOUND') {
      return new Error('No se encontro el perfil publico del usuario.');
    }
  }

  return new Error('No se pudo subir el avatar.');
};

export const profileService = {
  async uploadAvatar(avatar: Blob): Promise<string> {
    const user = authService.currentUser();
    if (!user) {
      throw new Error('AUTH_REQUIRED');
    }

    try {
      const result = await mediaRepo.uploadAvatar({
        uid: user.id,
        avatar,
      });

      return result.downloadUrl;
    } catch (error) {
      throw mapAvatarUploadError(error);
    }
  },
};
