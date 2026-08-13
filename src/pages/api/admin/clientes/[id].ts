export const prerender = false;

import type { APIContext } from 'astro';
import { checkRateLimit, getClientIP } from '../../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../../lib/session';
import { fetchCustomerById, deleteCustomer, fetchOrdersByCustomer } from '../../../../lib/woocommerce';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function unauthorized() {
  return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: JSON_HEADERS });
}

async function guard(cookies: APIContext['cookies'], request: Request) {
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) return unauthorized();
  const { allowed } = await checkRateLimit(getClientIP(request), 'admin-client-detail');
  if (!allowed) return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), { status: 429, headers: JSON_HEADERS });
  return null;
}

function parseId(params: APIContext['params']): number | null {
  const n = Number(params.id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET({ params, cookies, request }: APIContext) {
  const block = await guard(cookies, request);
  if (block) return block;

  const id = parseId(params);
  if (!id) return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers: JSON_HEADERS });

  try {
    const [customer, orders] = await Promise.all([
      fetchCustomerById(id),
      fetchOrdersByCustomer(id),
    ]);

    const ordersData = orders.map((o) => {
      const order = o as Record<string, unknown>;
      return {
        id: order.id,
        number: order.number,
        status: order.status,
        date_created: order.date_created,
        total: order.total,
        line_items: order.line_items,
      };
    });

    return new Response(JSON.stringify({ customer, orders: ordersData }), { status: 200, headers: JSON_HEADERS });
  } catch (e) {
    console.error('[admin/clientes/[id] GET]', e);
    return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), { status: 404, headers: JSON_HEADERS });
  }
}

export async function DELETE({ params, cookies, request }: APIContext) {
  const block = await guard(cookies, request);
  if (block) return block;

  const id = parseId(params);
  if (!id) return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers: JSON_HEADERS });

  try {
    await deleteCustomer(id);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: JSON_HEADERS });
  } catch (e) {
    console.error('[admin/clientes/[id] DELETE]', e);
    return new Response(JSON.stringify({ error: 'Error al eliminar cliente' }), { status: 502, headers: JSON_HEADERS });
  }
}
