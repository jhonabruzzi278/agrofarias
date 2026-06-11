export const prerender = false;

import type { APIContext } from 'astro';
import { isValidPositiveInt } from '../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../lib/session';
import { getRedis, ESTADOS_KEY } from '../../../lib/kv';

const ALLOWED_STATUSES = new Set(['pending', 'processing', 'on-hold', 'completed', 'cancelled']);

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export async function POST({ request, cookies }: APIContext) {
  // Defensa en profundidad (además del middleware).
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) {
    return json({ error: 'No autorizado' }, 401);
  }

  let body: { id?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Datos inválidos' }, 400);
  }

  const id = body.id;
  const status = body.status;
  if (!isValidPositiveInt(id)) return json({ error: 'ID inválido' }, 400);
  if (typeof status !== 'string' || !ALLOWED_STATUSES.has(status)) {
    return json({ error: 'Estado inválido' }, 400);
  }

  // Estado SOLO interno: se guarda en Upstash, NO se modifica la orden en WooCommerce.
  const redis = getRedis();
  if (!redis) return json({ error: 'Almacenamiento no disponible' }, 503);

  try {
    await redis.hset(ESTADOS_KEY, { [String(id)]: status });
    return json({ success: true, id, status }, 200);
  } catch (e) {
    console.error('[update-status] Error guardando en KV:', e);
    return json({ error: 'No se pudo guardar el estado.' }, 502);
  }
}
