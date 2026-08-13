export const prerender = false;

import type { APIContext } from 'astro';
import { isValidPositiveInt, checkRateLimit, getClientIP } from '../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../lib/session';
import { getRedis, ESTADOS_KEY } from '../../../lib/kv';

const ALLOWED_STATUSES = new Set(['pending', 'processing', 'on-hold', 'completed', 'cancelled']);

export async function POST({ request, cookies }: APIContext) {
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIP(request);
  const { allowed } = await checkRateLimit(ip, 'admin-quote-status');
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { id?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Datos inválidos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = body.id;
  const status = body.status;
  if (!isValidPositiveInt(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (typeof status !== 'string' || !ALLOWED_STATUSES.has(status)) {
    return new Response(JSON.stringify({ error: 'Estado inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const redis = getRedis();
  if (!redis) {
    return new Response(JSON.stringify({ error: 'Almacenamiento no disponible' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await redis.hset(ESTADOS_KEY, { [String(id)]: status });
    return new Response(JSON.stringify({ success: true, id, status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[update-status] Error guardando en KV:', e);
    return new Response(JSON.stringify({ error: 'No se pudo guardar el estado.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
