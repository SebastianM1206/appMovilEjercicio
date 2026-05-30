import { describe, expect, it } from 'vitest';
import { firebasePaths } from './paths';

describe('firebasePaths', () => {
  it('builds user public path', () => {
    expect(firebasePaths.userPublic('abc123')).toBe('users/abc123/public');
  });

  it('builds agg period path for leaderboard queries', () => {
    expect(firebasePaths.aggPeriod('2026-22')).toBe('agg/2026-22');
    expect(firebasePaths.agg('2026-22', 'abc123')).toBe('agg/2026-22/abc123');
  });

  it('builds route storage path with gzip extension', () => {
    expect(firebasePaths.routePath('abc123', 'run-1')).toBe('routes/abc123/run-1.json.gz');
  });
});
