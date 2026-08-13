export const prerender = false;

import type { APIContext } from 'astro';
import { checkRateLimit, getClientIP } from '../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../lib/session';
import { fetchCategorias } from '../../../lib/woocommerce';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function GET({ request, cookies }: APIContext) {
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: JSON_HEADERS });
  }

  const { allowed } = await checkRateLimit(getClientIP(request), 'admin-categories');
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), { status: 429, headers: JSON_HEADERS });
  }

  try {
    const categorias = await fetchCategorias();
    const data = categorias.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c.count }));
    return new Response(JSON.stringify({ categories: data }), { status: 200, headers: JSON_HEADERS });
  } catch (e) {
    console.error('[admin/categorias GET]', e);
    return new Response(JSON.stringify({ error: 'Error al obtener categorías' }), { status: 502, headers: JSON_HEADERS });
  }
}
