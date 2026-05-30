import type { RunSession } from '../../shared/types';
import type { IntegrityFlag } from './types';

export const MIN_DISTANCE_M_PER_RUN = 50;
export const MAX_DISTANCE_M_PER_RUN = 100_000;
export const MAX_DURATION_S = 86_400;
export const MIN_PACE_S_PER_KM = 180;
export const MAX_PACE_S_PER_KM = 1200;
export const MAX_SPEED_MPS = 12;
export const MIN_POINT_COUNT = 2;
export const MAX_ROUTE_SIZE_BYTES = 5_242_880;
export const MAX_DISPLAY_NAME_LENGTH = 40;
export const MIN_PASSWORD_LENGTH = 8;

export const FATAL_INTEGRITY_FLAGS: IntegrityFlag[] = [
  'DISTANCE_TOO_SHORT',
  'INSUFFICIENT_POINTS',
];

export const computeIntegrityFlags = (session: RunSession): IntegrityFlag[] => {
  const flags: IntegrityFlag[] = [];

  if (session.totals.distanceM < MIN_DISTANCE_M_PER_RUN) {
    flags.push('DISTANCE_TOO_SHORT');
  }
  if (session.totals.distanceM > MAX_DISTANCE_M_PER_RUN) {
    flags.push('DISTANCE_TOO_LONG');
  }
  if (session.totals.durationS > MAX_DURATION_S) {
    flags.push('DURATION_TOO_LONG');
  }

  const pace = session.totals.avgPaceSPerKm;
  if (pace !== undefined && (pace < MIN_PACE_S_PER_KM || pace > MAX_PACE_S_PER_KM)) {
    flags.push('PACE_OUT_OF_RANGE');
  }

  if ((session.stats.pointCount ?? 0) < MIN_POINT_COUNT) {
    flags.push('INSUFFICIENT_POINTS');
  }

  if ((session.stats.maxSpeedMps ?? 0) > MAX_SPEED_MPS) {
    flags.push('SPEED_ANOMALY');
  }

  if (flags.length === 0) {
    return ['OK'];
  }

  return flags;
};

export const hasFatalIntegrityFlags = (flags: IntegrityFlag[]): boolean =>
  flags.some((flag) => FATAL_INTEGRITY_FLAGS.includes(flag));
