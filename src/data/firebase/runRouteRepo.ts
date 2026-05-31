import { firebasePaths } from './paths';
import { rtdb } from './rtdb';
import type { RouteBlob } from './types';

/**
 * Persiste la traza GPS de una corrida en Realtime Database.
 *
 * Path: `runs/{uid}/{runId}/route`
 *
 * Diseño:
 * - El blob es un JSON con todos los puntos. RTDB lo serializa nativamente, sin gzip.
 * - Es privado: las reglas exigen `auth.uid == uid` para lectura y escritura.
 * - El leaderboard y los summaries NO leen este nodo, solo el dueño y el mapa de detalle.
 */
export const runRouteRepo = {
  async write(uid: string, runId: string, blob: RouteBlob): Promise<void> {
    await rtdb.write(firebasePaths.runRoute(uid, runId), blob);
  },

  async read(uid: string, runId: string): Promise<RouteBlob | null> {
    return rtdb.read<RouteBlob>(firebasePaths.runRoute(uid, runId));
  },

  async exists(uid: string, runId: string): Promise<boolean> {
    const value = await rtdb.read<RouteBlob>(firebasePaths.runRoute(uid, runId));
    return value !== null;
  },
};
