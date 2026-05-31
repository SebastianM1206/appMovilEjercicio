import { env } from '../../app/env';

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  url: string;
  format: string;
  resourceType: string;
  version: number;
  bytes: number;
  width?: number;
  height?: number;
  originalFilename?: string;
};

export type CloudinaryUploadOptions = {
  /** Sub-folder inside the upload preset's base folder, e.g. `avatars/<uid>`. */
  folder?: string;
  /** Forces a specific public_id (only honored if the preset allows it). */
  publicId?: string;
  /** Comma-separated tags. */
  tags?: string[];
  /** Optional context metadata (key=value pairs). */
  context?: Record<string, string>;
  /** Override the preset (advanced). Defaults to env.cloudinary.uploadPreset. */
  uploadPreset?: string;
  /** image | video | raw (defaults to "image"). */
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const buildContextString = (context: Record<string, string>): string =>
  Object.entries(context)
    .map(([k, v]) => `${k}=${String(v).replace(/[|=]/g, '_')}`)
    .join('|');

/**
 * Unsigned upload to Cloudinary.
 *
 * Required env (Vite):
 *   VITE_CLOUDINARY_CLOUD_NAME=<your-cloud>
 *   VITE_CLOUDINARY_UPLOAD_PRESET=<unsigned-preset>
 *
 * The preset must be configured as "Unsigned" in the Cloudinary dashboard.
 * Docs: https://cloudinary.com/documentation/upload_images#unsigned_upload
 */
export const uploadToCloudinary = async (
  file: Blob,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult> => {
  // Parce, uso esta funcion para subir a Cloudinary sin enredos y devolver la URL lista.
  const cloudName = env.cloudinary.cloudName;
  const uploadPreset = options.uploadPreset ?? env.cloudinary.uploadPreset;

  if (!cloudName || !uploadPreset) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED');
  }

  const resourceType = options.resourceType ?? 'image';
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);

  if (options.folder) form.append('folder', options.folder);
  if (options.publicId) form.append('public_id', options.publicId);
  if (options.tags && options.tags.length > 0) form.append('tags', options.tags.join(','));
  if (options.context && Object.keys(options.context).length > 0) {
    form.append('context', buildContextString(options.context));
  }

  let response: Response;
  try {
    response = await fetch(endpoint, { method: 'POST', body: form });
  } catch (networkError) {
    const message = networkError instanceof Error ? networkError.message : 'network error';
    throw new Error(`CLOUDINARY_NETWORK_ERROR:${message}`);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // ignore — handled below
  }

  if (!response.ok) {
    const errMsg = isPlainObject(payload) && isPlainObject(payload.error)
      ? String(payload.error.message ?? '')
      : `HTTP ${response.status}`;
    throw new Error(`CLOUDINARY_UPLOAD_FAILED:${errMsg || response.status}`);
  }

  if (!isPlainObject(payload)) {
    throw new Error('CLOUDINARY_UPLOAD_FAILED:invalid_response');
  }

  const publicId = String(payload.public_id ?? '');
  const secureUrl = String(payload.secure_url ?? '');
  if (!publicId || !secureUrl) {
    throw new Error('CLOUDINARY_UPLOAD_FAILED:missing_url');
  }

  return {
    publicId,
    secureUrl,
    url: String(payload.url ?? secureUrl),
    format: String(payload.format ?? ''),
    resourceType: String(payload.resource_type ?? resourceType),
    version: typeof payload.version === 'number' ? payload.version : 0,
    bytes: typeof payload.bytes === 'number' ? payload.bytes : file.size,
    width: typeof payload.width === 'number' ? payload.width : undefined,
    height: typeof payload.height === 'number' ? payload.height : undefined,
    originalFilename:
      typeof payload.original_filename === 'string' ? payload.original_filename : undefined,
  };
};
