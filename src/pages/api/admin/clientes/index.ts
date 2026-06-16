export const prerender = false;

import type { APIContext } from 'astro';
import { checkRateLimit, getClientIP, sanitize } from '../../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../../lib/session';
import { fetchCustomers, createCustomer } from '../../../../lib/woocommerce';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function unauthorized() {
  return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: JSON_HEADERS });
}

async function guard(cookies: APIContext['cookies'], request: Request) {
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) return unauthorized();
  const { allowed } = await checkRateLimit(getClientIP(request));
  if (!allowed) return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), { status: 429, headers: JSON_HEADERS });
  return null;
}

export async function GET({ request, cookies }: APIContext) {
  const block = await guard(cookies, request);
  if (block) return block;

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || undefined;
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const per_page = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page') || 20)));

    const { customers, totalPages, total } = await fetchCustomers({ search, page, per_page });

    return new Response(JSON.stringify({ customers, page, totalPages, total }), {
      status: 200, headers: JSON_HEADERS,
    });
  } catch (e) {
    console.error('[admin/clientes GET]', e);
    return new Response(JSON.stringify({ error: 'Error al obtener clientes' }), { status: 502, headers: JSON_HEADERS });
  }
}

export async function POST({ request, cookies }: APIContext) {
  const block = await guard(cookies, request);
  if (block) return block;

  try {
    const body = await request.json();

    const first_name = sanitize(String(body.first_name || '')).trim();
    const last_name = sanitize(String(body.last_name || '')).trim();
    const email = String(body.email || '').trim().toLowerCase();
    const username = sanitize(String(body.username || '')).trim();
    const password = String(body.password || '');

    if (!first_name) return new Response(JSON.stringify({ error: 'El nombre es requerido' }), { status: 400, headers: JSON_HEADERS });
    if (!last_name) return new Response(JSON.stringify({ error: 'El apellido es requerido' }), { status: 400, headers: JSON_HEADERS });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return new Response(JSON.stringify({ error: 'Email inválido' }), { status: 400, headers: JSON_HEADERS });
    if (!username) return new Response(JSON.stringify({ error: 'El usuario es requerido' }), { status: 400, headers: JSON_HEADERS });
    if (password.length < 8) return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 8 caracteres' }), { status: 400, headers: JSON_HEADERS });

    const billing = body.billing ? {
      phone: body.billing.phone ? sanitize(String(body.billing.phone)) : '',
      address_1: body.billing.address_1 ? sanitize(String(body.billing.address_1)) : '',
      city: body.billing.city ? sanitize(String(body.billing.city)) : '',
      state: body.billing.state ? sanitize(String(body.billing.state)) : '',
      country: 'CL',
    } : undefined;

    const customer = await createCustomer({ first_name, last_name, email, username, password, billing });

    return new Response(JSON.stringify({ success: true, id: customer.id }), { status: 201, headers: JSON_HEADERS });
  } catch (e) {
    console.error('[admin/clientes POST]', e);
    const msg = e instanceof Error && e.message.includes('409') ? 'El email o usuario ya existe' : 'Error al crear cliente';
    return new Response(JSON.stringify({ error: msg }), { status: 502, headers: JSON_HEADERS });
  }
}
