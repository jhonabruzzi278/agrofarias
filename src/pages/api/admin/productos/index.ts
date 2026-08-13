export const prerender = false;

import type { APIContext } from 'astro';
import { checkRateLimit, getClientIP, sanitize } from '../../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../../lib/session';
import { fetchProductosAdmin, createProducto } from '../../../../lib/woocommerce';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function unauthorized() {
  return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: JSON_HEADERS });
}

function tooMany() {
  return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), { status: 429, headers: JSON_HEADERS });
}

async function guard(cookies: APIContext['cookies'], request: Request) {
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) return unauthorized();
  const { allowed } = await checkRateLimit(getClientIP(request), 'admin-products');
  if (!allowed) return tooMany();
  return null;
}

export async function GET({ request, cookies }: APIContext) {
  const block = await guard(cookies, request);
  if (block) return block;

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || undefined;
    const category = url.searchParams.get('category') ? Number(url.searchParams.get('category')) : undefined;
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const per_page = Math.min(100, Math.max(1, Number(url.searchParams.get('per_page') || 20)));
    const status = url.searchParams.get('status') || 'any';

    const { products, totalPages, total } = await fetchProductosAdmin({ search, category, page, per_page, status });

    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku || '',
      status: (p as unknown as Record<string, string>).status || 'publish',
      stock_status: p.stock_status,
      stock_quantity: p.stock_quantity,
      regular_price: (p as unknown as Record<string, string>).regular_price || '0',
      image: p.images?.[0] || null,
      categories: p.categories,
      acf: p.acf || {},
    }));

    return new Response(JSON.stringify({ products: data, page, totalPages, total }), {
      status: 200, headers: JSON_HEADERS,
    });
  } catch (e) {
    console.error('[admin/productos GET]', e);
    return new Response(JSON.stringify({ error: 'Error al obtener productos' }), { status: 502, headers: JSON_HEADERS });
  }
}

export async function POST({ request, cookies }: APIContext) {
  const block = await guard(cookies, request);
  if (block) return block;

  try {
    const body = await request.json();

    const name = sanitize(String(body.name || '')).trim();
    if (!name) {
      return new Response(JSON.stringify({ error: 'El nombre del producto es requerido' }), { status: 400, headers: JSON_HEADERS });
    }

    const price = parseFloat(body.regular_price ?? '0');
    if (isNaN(price) || price < 0) {
      return new Response(JSON.stringify({ error: 'Precio inválido' }), { status: 400, headers: JSON_HEADERS });
    }

    const meta_data: Array<{ key: string; value: string }> = [];
    if (body.unidad_medida) meta_data.push({ key: 'unidad_medida', value: sanitize(String(body.unidad_medida)) });
    if (body.cultivo_aplicable) meta_data.push({ key: 'cultivo_aplicable', value: sanitize(String(body.cultivo_aplicable)) });
    if (body.dosis_recomendada) meta_data.push({ key: 'dosis_recomendada', value: sanitize(String(body.dosis_recomendada)) });

    const payload = {
      name,
      description: body.description ? String(body.description).replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') : '',
      short_description: body.short_description ? String(body.short_description).replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') : '',
      regular_price: price.toFixed(2),
      sku: body.sku ? sanitize(String(body.sku)) : '',
      stock_quantity: body.stock_quantity != null ? Math.max(0, Math.round(Number(body.stock_quantity))) : undefined,
      stock_status: ['instock', 'outofstock', 'onbackorder'].includes(body.stock_status) ? body.stock_status : 'instock',
      status: body.status === 'draft' ? 'draft' : 'publish',
      categories: Array.isArray(body.categories) ? body.categories.map((id: number) => ({ id })) : [],
      images: body.image_id ? [{ id: Number(body.image_id) }] : [],
      ...(meta_data.length > 0 ? { meta_data } : {}),
    };

    const product = await createProducto(payload);

    return new Response(JSON.stringify({ success: true, id: product.id, slug: product.slug }), {
      status: 201, headers: JSON_HEADERS,
    });
  } catch (e) {
    console.error('[admin/productos POST]', e);
    return new Response(JSON.stringify({ error: 'Error al crear producto' }), { status: 502, headers: JSON_HEADERS });
  }
}
