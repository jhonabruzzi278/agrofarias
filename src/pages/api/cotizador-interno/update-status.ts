export const prerender = false;

import type { APIContext } from 'astro';
import { isValidPositiveInt } from '../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../lib/session';

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

  const wpUrl = import.meta.env.WORDPRESS_URL as string | undefined;
  const wcKey = import.meta.env.WC_CONSUMER_KEY as string | undefined;
  const wcSecret = import.meta.env.WC_CONSUMER_SECRET as string | undefined;
  if (!wpUrl || !wcKey || !wcSecret) {
    return json({ error: 'Servicio no disponible' }, 503);
  }

  try {
    const auth = btoa(`${wcKey}:${wcSecret}`);
    const res = await fetch(`${wpUrl}/wp-json/wc/v3/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      const order = await res.json().catch(() => ({}));
      return json({ success: true, id: order.id ?? id, status: order.status ?? status }, 200);
    }

    // El detalle de WooCommerce queda en logs; al cliente, mensaje genérico.
    console.error('[update-status] WooCommerce error:', res.status, await res.text().catch(() => ''));
    return json({ error: 'No se pudo actualizar el estado.' }, 502);
  } catch (e) {
    console.error('[update-status] Unhandled error:', e);
    return json({ error: 'Error interno' }, 500);
  }
}
