export type ProgressTarget = {
  distanceMeters?: number;
  durationSec?: number;
};

export type MilestoneEvent = {
  type: 'MILESTONE';
  payload: {
    km: number;
    timestamp: number;
  };
};

export const computeProgress = (
  target: ProgressTarget,
  metrics: { distanceMeters: number; durationSec: number },
) => {
  const distanceRatio = target.distanceMeters ? metrics.distanceMeters / target.distanceMeters : 0;
  const durationRatio = target.durationSec ? metrics.durationSec / target.durationSec : 0;
  const value = Math.max(distanceRatio, durationRatio);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
};

export const checkMilestones = (currentDistance: number, lastMilestoneKm: number) => {
  const currentKm = Math.floor(currentDistance / 1000);
  if (currentKm > lastMilestoneKm) {
    return {
      event: {
        type: 'MILESTONE' as const,
        payload: {
          km: currentKm,
          timestamp: Date.now(),
        },
      },
      nextMilestoneKm: currentKm,
    };
  }
  return { event: null, nextMilestoneKm: lastMilestoneKm };
};
