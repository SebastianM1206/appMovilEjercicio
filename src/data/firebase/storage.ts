import { gzip, ungzip } from 'pako';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  getMetadata,
  getBytes,
  type UploadMetadata,
} from 'firebase/storage';
import { getFirebaseApp } from './app';
import { MAX_ROUTE_SIZE_BYTES } from './integrity';
import type { RouteBlob } from './types';

export const GZIP_CONTENT_TYPE = 'application/gzip';

const canUseCompressionStream = (): boolean =>
  typeof CompressionStream !== 'undefined' &&
  typeof DecompressionStream !== 'undefined' &&
  typeof Blob.prototype.stream === 'function';

const gzipBytes = async (value: string): Promise<Uint8Array> => {
  if (canUseCompressionStream()) {
    const input = new Blob([value], { type: 'application/json' });
    const stream = input.stream().pipeThrough(new CompressionStream('gzip'));
    const compressed = await new Response(stream).arrayBuffer();
    return new Uint8Array(compressed);
  }

  return gzip(value);
};

const gunzipBytes = async (bytes: Uint8Array): Promise<string> => {
  if (canUseCompressionStream()) {
    const blob = new Blob([Uint8Array.from(bytes)], { type: GZIP_CONTENT_TYPE });
    const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  }

  return ungzip(bytes, { to: 'string' });
};

export const gzipString = async (value: string): Promise<Blob> => {
  const compressed = await gzipBytes(value);

  if (compressed.byteLength > MAX_ROUTE_SIZE_BYTES) {
    throw new Error('ROUTE_TOO_LARGE');
  }

  return new Blob([Uint8Array.from(compressed)], { type: GZIP_CONTENT_TYPE });
};

export const gunzipToString = async (blob: Blob): Promise<string> => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return gunzipBytes(bytes);
};

export const serializeRouteBlob = async (routeBlob: RouteBlob): Promise<Blob> => {
  return gzipString(JSON.stringify(routeBlob));
};

export const parseRouteBlob = async (blob: Blob): Promise<RouteBlob> => {
  const json = await gunzipToString(blob);
  return JSON.parse(json) as RouteBlob;
};

export const storage = {
  getClient() {
    return getStorage(getFirebaseApp());
  },
  upload: async (path: string, data: Blob, contentType?: string): Promise<string> => {
    const fileRef = ref(storage.getClient(), path);
    const metadata: UploadMetadata | undefined = contentType ? { contentType } : undefined;
    await uploadBytes(fileRef, data, metadata);
    return getDownloadURL(fileRef);
  },
  download: async (path: string): Promise<Blob> => {
    const fileRef = ref(storage.getClient(), path);
    const bytes = await getBytes(fileRef);
    return new Blob([bytes], { type: GZIP_CONTENT_TYPE });
  },
  exists: async (path: string): Promise<boolean> => {
    const fileRef = ref(storage.getClient(), path);
    try {
      await getMetadata(fileRef);
      return true;
    } catch {
      return false;
    }
  },
};
