import type { RunSample } from './runRecorder';

export type RunMetrics = {
  distanceMeters: number;
  durationSec: number;
  avgSpeed: number;
};

export const computeRunMetrics = (samples: RunSample[]): RunMetrics => {
  if (samples.length === 0) {
    return { distanceMeters: 0, durationSec: 0, avgSpeed: 0 };
  }

  const durationSec = Math.max(0, (samples[samples.length - 1].ts - samples[0].ts) / 1000);
  const avgSpeed = samples.reduce((sum, sample) => sum + sample.speed, 0) / samples.length;
  const distanceMeters = avgSpeed * durationSec;

  return { distanceMeters, durationSec, avgSpeed };
};
