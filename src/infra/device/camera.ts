import { useCallback, useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getErrorMessage } from '../../shared/utils';

export const useCamera = () => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensurePermissions = useCallback(async () => {
    let permissions = await Camera.checkPermissions();

    if (permissions.camera === 'prompt' || permissions.photos === 'prompt') {
      permissions = await Camera.requestPermissions();
    }

    const hasCameraPermission = permissions.camera === 'granted';
    const hasPhotosPermission = permissions.photos === 'granted';

    if (!hasCameraPermission && !hasPhotosPermission) {
      throw new Error('Permisos de camara o galeria denegados.');
    }
  }, []);

  const getPhoto = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await ensurePermissions();

      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        allowEditing: false,
      });

      if (!image.dataUrl) {
        throw new Error('No se pudo leer la imagen seleccionada.');
      }

      setPhotoDataUrl(image.dataUrl);
      return image.dataUrl;
    } catch (hookError: unknown) {
      const message = getErrorMessage(hookError, 'No fue posible obtener la foto.');
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [ensurePermissions]);

  return {
    photoDataUrl,
    loading,
    error,
    getPhoto,
  };
};
