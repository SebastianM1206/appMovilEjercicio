import { describe, expect, it } from 'vitest';
import { gzipString, gunzipToString, parseRouteBlob, serializeRouteBlob } from './storage';
import type { RouteBlob } from './types';

const sampleRouteBlob: RouteBlob = {
  version: 1,
  runId: '550e8400-e29b-41d4-a716-446655440000',
  uid: 'abc123uid',
  pointCount: 2,
  points: [
    { ts: 1716892800000, lat: 19.4326, lon: -99.1332, accuracyM: 8.5 },
    { ts: 1716892805000, lat: 19.4328, lon: -99.133, accuracyM: 7.2 },
  ],
};

describe('storage gzip helpers', () => {
  it('compresses and decompresses json', async () => {
    const payload = JSON.stringify(sampleRouteBlob);
    const compressed = await gzipString(payload);
    const restored = await gunzipToString(compressed);

    expect(restored).toBe(payload);
  });

  it('serializes and parses route blobs', async () => {
    const compressed = await serializeRouteBlob(sampleRouteBlob);
    const restored = await parseRouteBlob(compressed);

    expect(restored).toEqual(sampleRouteBlob);
  });
});
