import { useCallback, useState } from 'react';
import { getErrorMessage } from '../../../shared/utils';
import { runMediaService, type UploadRunPhotoResult } from '../runMediaService';

export type UseRunMediaState = {
  isUploadingPhoto: boolean;
  lastUpload?: UploadRunPhotoResult;
  error?: string;
  uploadRunPhoto: (runId: string, photo: Blob) => Promise<UploadRunPhotoResult | null>;
};

export const useRunMedia = (): UseRunMediaState => {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [lastUpload, setLastUpload] = useState<UploadRunPhotoResult | undefined>();
  const [error, setError] = useState<string | undefined>();

  const uploadRunPhoto = useCallback(async (runId: string, photo: Blob) => {
    setError(undefined);
    setIsUploadingPhoto(true);

    try {
      const result = await runMediaService.uploadRunPhoto(runId, photo);
      setLastUpload(result);
      return result;
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, 'No se pudo subir la foto de la corrida.'));
      return null;
    } finally {
      setIsUploadingPhoto(false);
    }
  }, []);

  return {
    isUploadingPhoto,
    lastUpload,
    error,
    uploadRunPhoto,
  };
};
