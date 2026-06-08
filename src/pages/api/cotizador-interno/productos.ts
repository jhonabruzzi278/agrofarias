export const prerender = false;

import { fetchAllProductos } from '../../../lib/woocommerce';

function checkAuth(request: Request): boolean {
  const password = import.meta.env.COTIZADOR_PASSWORD as string;
  if (!password) return false;
  const authHeader = request.headers.get('x-cotizador-auth') || '';
  return authHeader === password;
}

export async function GET({ request }: { request: Request }) {
  if (!checkAuth(request)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const productos = await fetchAllProductos();
    const data = productos.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0]?.src || '',
    }));
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[cotizador-interno/productos] Error:', e);
    return new Response(JSON.stringify({ error: 'Error al cargar productos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
