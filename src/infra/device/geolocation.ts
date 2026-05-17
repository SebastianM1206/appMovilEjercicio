import { useCallback, useEffect, useRef, useState } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { getErrorMessage } from '../../shared/utils';

interface UseGeolocationOptions {
  minimumUpdateIntervalMs?: number;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const minimumUpdateIntervalMs = options.minimumUpdateIntervalMs ?? 3_000;
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<string | null>(null);
  const isStartingRef = useRef(false);

  const ensurePermissions = useCallback(async () => {
    let permissions = await Geolocation.checkPermissions();

    const needsPermissionRequest =
      permissions.location !== 'granted' || permissions.coarseLocation !== 'granted';

    if (needsPermissionRequest) {
      permissions = await Geolocation.requestPermissions();
    }

    const locationGranted = permissions.location === 'granted';
    const coarseGranted = permissions.coarseLocation === 'granted';

    if (!locationGranted && !coarseGranted) {
      throw new Error('Permiso de geolocalizacion denegado. Habilitalo en ajustes de la app.');
    }

    return permissions;
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const permissions = await ensurePermissions();
      const enableHighAccuracy = permissions.location === 'granted';

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout: 15_000,
        maximumAge: 3_000,
      });

      setCurrentPosition(position);
      return position;
    } catch (hookError: unknown) {
      const message = getErrorMessage(hookError, 'No fue posible obtener la ubicacion actual.');
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [ensurePermissions]);

  const startWatching = useCallback(async () => {
    setError(null);

    if (watchId || isStartingRef.current) {
      return Boolean(watchId);
    }

    isStartingRef.current = true;

    try {
      const permissions = await ensurePermissions();
      const enableHighAccuracy = permissions.location === 'granted';
      const watchOptions = {
        enableHighAccuracy,
        timeout: 15_000,
        maximumAge: 3_000,
        minimumUpdateInterval: minimumUpdateIntervalMs,
      } as Parameters<typeof Geolocation.watchPosition>[0];

      const id = await Geolocation.watchPosition(watchOptions, (position, watchError) => {
        if (watchError) {
          setError(getErrorMessage(watchError, 'Error durante el seguimiento de ubicacion.'));
          return;
        }

        if (position) {
          setCurrentPosition(position);
        }
      });

      setWatchId(id);
      setIsWatching(true);
      return true;
    } catch (hookError: unknown) {
      setError(getErrorMessage(hookError, 'No fue posible iniciar el seguimiento de ubicacion.'));
      return false;
    } finally {
      isStartingRef.current = false;
    }
  }, [ensurePermissions, minimumUpdateIntervalMs, watchId]);

  const stopWatching = useCallback(async () => {
    if (!watchId) {
      setIsWatching(false);
      return;
    }

    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (hookError: unknown) {
      setError(getErrorMessage(hookError, 'No fue posible detener el seguimiento de ubicacion.'));
    } finally {
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  useEffect(() => {
    return () => {
      void stopWatching();
    };
  }, [stopWatching]);

  return {
    currentPosition,
    isWatching,
    loading,
    error,
    getCurrentLocation,
    startWatching,
    stopWatching,
  };
};
