export const prerender = false;

import type { APIContext } from 'astro';
import { checkRateLimit, getClientIP } from '../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../lib/session';
import { fetchAllProductos } from '../../../lib/woocommerce';
import { filterProductos, toProductoLite } from '../../../lib/productFilter';

export async function GET({ request, cookies }: APIContext) {
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIP(request);
  const { allowed } = await checkRateLimit(ip, 'admin-quote-products');
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').trim();
    const category = (url.searchParams.get('category') || '').trim();

    // Sin término ni categoría no se busca nada (evita traer todo el catálogo
    // sin intención y deja el panel limpio al abrir).
    if (!search && !category) {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Misma fuente que la tienda pública: catálogo cacheado (L1/L2) + filtro
    // compartido. Así ambos extraen los productos de la misma forma y con la
    // misma semántica de búsqueda (nombre + descripción corta).
    const categoriaId = category ? Number(category) : undefined;
    const productos = await fetchAllProductos();

    // Búsqueda por texto: hasta 30 resultados. Navegación por categoría:
    // hasta 100 ordenados alfabéticamente para listar la familia completa.
    const filtrados = filterProductos(productos, {
      search,
      categoriaId: Number.isFinite(categoriaId) ? categoriaId : undefined,
      sort: search ? 'default' : 'name-asc',
    });

    const limite = search ? 30 : 100;
    const data = filtrados.slice(0, limite).map(toProductoLite);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[productos] Error:', e);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
