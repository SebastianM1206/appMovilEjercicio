export type MotionState = {
  isMoving: boolean;
  confidence: number;
};

export const getMotionState = async (): Promise<MotionState> => {
  return { isMoving: false, confidence: 0 };
};
