import type { RunSample } from './runRecorder';

export type RawLocation = {
  lat: number;
  lon: number;
  speed: number;
  ts: number;
};

export const normalizeLocation = (location: RawLocation): RunSample => {
  return {
    ts: location.ts,
    lat: location.lat,
    lon: location.lon,
    speed: Math.max(0, location.speed)
  };
};
