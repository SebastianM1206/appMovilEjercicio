export const schemaV1 = {
  runs: 'id, startedAt, distanceMeters, durationSec',
};

export const schemaV2 = {
  runs: 'id, startedAt, distanceMeters, durationSec',
  sessions: 'id, uid, status, startedAt, endedAt',
  points: '++id, sessionId, ts',
  events: '++id, sessionId, ts, type',
  outbox: '++id, opId, sessionId, type, nextRetryAt, createdAt',
};
