export const prerender = false;

import type { APIContext } from 'astro';
import { checkRateLimit, getClientIP, sanitize } from '../../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../../lib/session';
import { fetchProductoById, updateProducto, trashProducto } from '../../../../lib/woocommerce';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function unauthorized() {
  return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: JSON_HEADERS });
}

function tooMany() {
  return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), { status: 429, headers: JSON_HEADERS });
}

async function guard(cookies: APIContext['cookies'], request: Request) {
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) return unauthorized();
  const { allowed } = await checkRateLimit(getClientIP(request), 'admin-product-detail');
  if (!allowed) return tooMany();
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
    const product = await fetchProductoById(id);
    return new Response(JSON.stringify(product), { status: 200, headers: JSON_HEADERS });
  } catch (e) {
    console.error('[admin/productos/[id] GET]', e);
    return new Response(JSON.stringify({ error: 'Producto no encontrado' }), { status: 404, headers: JSON_HEADERS });
  }
}

export async function PUT({ params, request, cookies }: APIContext) {
  const block = await guard(cookies, request);
  if (block) return block;

  const id = parseId(params);
  if (!id) return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers: JSON_HEADERS });

  try {
    const body = await request.json();

    const payload: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = sanitize(String(body.name)).trim();
      if (!name) return new Response(JSON.stringify({ error: 'El nombre es requerido' }), { status: 400, headers: JSON_HEADERS });
      payload.name = name;
    }

    if (body.description !== undefined) {
      payload.description = String(body.description).replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    }
    if (body.short_description !== undefined) {
      payload.short_description = String(body.short_description).replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    }

    if (body.regular_price !== undefined) {
      const price = parseFloat(body.regular_price);
      if (isNaN(price) || price < 0) return new Response(JSON.stringify({ error: 'Precio inválido' }), { status: 400, headers: JSON_HEADERS });
      payload.regular_price = price.toFixed(2);
    }

    if (body.sku !== undefined) payload.sku = sanitize(String(body.sku));
    if (body.stock_quantity != null) payload.stock_quantity = Math.max(0, Math.round(Number(body.stock_quantity)));
    if (body.stock_status && ['instock', 'outofstock', 'onbackorder'].includes(body.stock_status)) {
      payload.stock_status = body.stock_status;
    }
    if (body.status && ['publish', 'draft'].includes(body.status)) payload.status = body.status;
    if (Array.isArray(body.categories)) payload.categories = body.categories.map((catId: number) => ({ id: catId }));
    if (body.image_id) payload.images = [{ id: Number(body.image_id) }];

    const meta_data: Array<{ key: string; value: string }> = [];
    if (body.unidad_medida !== undefined) meta_data.push({ key: 'unidad_medida', value: sanitize(String(body.unidad_medida)) });
    if (body.cultivo_aplicable !== undefined) meta_data.push({ key: 'cultivo_aplicable', value: sanitize(String(body.cultivo_aplicable)) });
    if (body.dosis_recomendada !== undefined) meta_data.push({ key: 'dosis_recomendada', value: sanitize(String(body.dosis_recomendada)) });
    if (meta_data.length > 0) payload.meta_data = meta_data;

    const product = await updateProducto(id, payload as Parameters<typeof updateProducto>[1]);

    return new Response(JSON.stringify({ success: true, id: product.id }), { status: 200, headers: JSON_HEADERS });
  } catch (e) {
    console.error('[admin/productos/[id] PUT]', e);
    return new Response(JSON.stringify({ error: 'Error al actualizar producto' }), { status: 502, headers: JSON_HEADERS });
  }
}

export async function DELETE({ params, cookies, request }: APIContext) {
  const block = await guard(cookies, request);
  if (block) return block;

  const id = parseId(params);
  if (!id) return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers: JSON_HEADERS });

  try {
    await trashProducto(id);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: JSON_HEADERS });
  } catch (e) {
    console.error('[admin/productos/[id] DELETE]', e);
    return new Response(JSON.stringify({ error: 'Error al eliminar producto' }), { status: 502, headers: JSON_HEADERS });
  }
}
