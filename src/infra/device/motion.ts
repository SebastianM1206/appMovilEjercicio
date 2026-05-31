import { useCallback, useEffect, useRef, useState } from 'react';

type AccelerationState = {
  x: number;
  y: number;
  z: number;
};

export const useMovementDetection = (
  acceleration: AccelerationState | null,
  movementThreshold: number,
) => {
  const [isMoving, setIsMoving] = useState(false);
  const [movementDelta, setMovementDelta] = useState(0);
  const [lastMovementAt, setLastMovementAt] = useState<number>(Date.now());

  const prevMagnitudeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!acceleration) {
      return;
    }

    const magnitude = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);

    if (prevMagnitudeRef.current === null) {
      prevMagnitudeRef.current = magnitude;
      return;
    }

    const delta = Math.abs(magnitude - prevMagnitudeRef.current);
    prevMagnitudeRef.current = magnitude;

    setMovementDelta(delta);

    const movingNow = delta >= movementThreshold;
    setIsMoving(movingNow);

    if (movingNow) {
      setLastMovementAt(Date.now());
    }
  }, [acceleration, movementThreshold]);

  return {
    isMoving,
    movementDelta,
    lastMovementAt,
  };
};

type UseDeviceMotionOptions = {
  enabled?: boolean;
};

type MotionPermission = 'granted' | 'denied' | 'prompt';

const requestMotionPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }

  const deviceMotion = window.DeviceMotionEvent as unknown as {
    requestPermission?: () => Promise<MotionPermission>;
  };

  if (typeof deviceMotion?.requestPermission !== 'function') {
    return true;
  }

  const result = await deviceMotion.requestPermission();
  return result === 'granted';
};

export const useDeviceMotion = (options: UseDeviceMotionOptions = {}) => {
  const enabled = options.enabled ?? true;
  const [acceleration, setAcceleration] = useState<AccelerationState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity ?? event.acceleration;
    if (!acc) {
      return;
    }
    setAcceleration({
      x: acc.x ?? 0,
      y: acc.y ?? 0,
      z: acc.z ?? 0,
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;

    void (async () => {
      try {
        const granted = await requestMotionPermission();
        if (!granted || !active) {
          throw new Error('Permiso de movimiento denegado.');
        }
        window.addEventListener('devicemotion', handleMotion);
      } catch (hookError: unknown) {
        if (!active) {
          return;
        }
        const message = hookError instanceof Error ? hookError.message : 'No se pudo leer el movimiento.';
        setError(message);
      }
    })();

    return () => {
      active = false;
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [enabled, handleMotion]);

  return {
    acceleration,
    error,
  };
};
