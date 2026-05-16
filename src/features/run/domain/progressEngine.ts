export type ProgressTarget = {
  distanceMeters?: number;
  durationSec?: number;
};

export const computeProgress = (
  target: ProgressTarget,
  metrics: { distanceMeters: number; durationSec: number }
) => {
  const distanceRatio = target.distanceMeters ? metrics.distanceMeters / target.distanceMeters : 0;
  const durationRatio = target.durationSec ? metrics.durationSec / target.durationSec : 0;
  const value = Math.max(distanceRatio, durationRatio);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
};
