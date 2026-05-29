export const FATAL_SYNC_ERROR_CODES = [
  'ROUTE_TOO_LARGE',
  'INSUFFICIENT_POINTS',
  'DISTANCE_TOO_SHORT',
  'UID_MISMATCH',
  'AUTH_EXPIRED',
] as const;

export type FatalSyncErrorCode = (typeof FATAL_SYNC_ERROR_CODES)[number];

export class SyncError extends Error {
  readonly code: FatalSyncErrorCode | string;

  constructor(code: FatalSyncErrorCode | string, message: string) {
    super(message);
    this.name = 'SyncError';
    this.code = code;
  }
}

export const FATAL_RETRY_AT = Number.MAX_SAFE_INTEGER;

export const isFatalSyncError = (error: unknown): boolean => {
  if (error instanceof SyncError) {
    return FATAL_SYNC_ERROR_CODES.includes(error.code as FatalSyncErrorCode);
  }

  if (error instanceof Error && error.message === 'ROUTE_TOO_LARGE') {
    return true;
  }

  return false;
};
