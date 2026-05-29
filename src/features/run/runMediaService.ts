import { mediaRepo } from '../../data/firebase/mediaRepo';
import { authService } from '../auth/authService';

const mapRunPhotoUploadError = (error: unknown): Error => {
  if (error instanceof Error) {
    if (error.message === 'AUTH_REQUIRED') {
      return new Error('Debes iniciar sesion para subir fotos.');
    }
    if (error.message === 'INVALID_IMAGE_TYPE') {
      return new Error('Selecciona una imagen valida para la corrida.');
    }
    if (error.message === 'PHOTO_TOO_LARGE') {
      return new Error('La foto excede el limite de 2 MB.');
    }
    if (error.message === 'RUN_SUMMARY_NOT_FOUND') {
      return new Error('La corrida aun no tiene resumen sincronizado.');
    }
  }

  return new Error('No se pudo subir la foto de la corrida.');
};

export type UploadRunPhotoResult = {
  photoId: string;
  path: string;
  downloadUrl: string;
  photoCount: number;
};

export const runMediaService = {
  async uploadRunPhoto(runId: string, photo: Blob): Promise<UploadRunPhotoResult> {
    const user = authService.currentUser();
    if (!user) {
      throw new Error('AUTH_REQUIRED');
    }

    try {
      return await mediaRepo.uploadRunPhoto({
        uid: user.id,
        runId,
        photo,
      });
    } catch (error) {
      throw mapRunPhotoUploadError(error);
    }
  },
};
