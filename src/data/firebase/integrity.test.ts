import { describe, expect, it } from 'vitest';
import {
  computeIntegrityFlags,
  hasFatalIntegrityFlags,
  MIN_DISTANCE_M_PER_RUN,
} from './integrity';
import type { RunSession } from '../../shared/types';

const buildSession = (overrides: Partial<RunSession> = {}): RunSession => ({
  id: 'run-1',
  uid: 'user-1',
  status: 'finished',
  startedAt: Date.now(),
  endedAt: Date.now(),
  totals: {
    distanceM: 5000,
    durationS: 1800,
    avgPaceSPerKm: 360,
  },
  stats: {
    pointCount: 120,
    maxSpeedMps: 4,
  },
  sync: {},
  ...overrides,
});

describe('integrity', () => {
  it('returns OK for a valid session', () => {
    expect(computeIntegrityFlags(buildSession())).toEqual(['OK']);
  });

  it('flags short distance as fatal', () => {
    const flags = computeIntegrityFlags(
      buildSession({
        totals: { distanceM: MIN_DISTANCE_M_PER_RUN - 1, durationS: 600 },
      }),
    );

    expect(flags).toContain('DISTANCE_TOO_SHORT');
    expect(hasFatalIntegrityFlags(flags)).toBe(true);
  });

  it('flags pace out of range without marking fatal', () => {
    const flags = computeIntegrityFlags(
      buildSession({
        totals: { distanceM: 5000, durationS: 1800, avgPaceSPerKm: 50 },
      }),
    );

    expect(flags).toContain('PACE_OUT_OF_RANGE');
    expect(hasFatalIntegrityFlags(flags)).toBe(false);
  });
});
