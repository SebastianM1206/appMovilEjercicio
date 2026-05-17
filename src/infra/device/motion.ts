import { useEffect, useRef, useState } from 'react';

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
