export const prerender = false;

import type { APIContext } from 'astro';
import { checkRateLimit, recordRequest, getClientIP } from '../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../lib/session';

export async function GET({ request, cookies }: APIContext) {
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIP(request);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  await recordRequest(ip);

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';

    const wpUrl = import.meta.env.WORDPRESS_URL as string;
    const wcKey = import.meta.env.WC_CONSUMER_KEY as string;
    const wcSecret = import.meta.env.WC_CONSUMER_SECRET as string;

    if (!wpUrl || !wcKey || !wcSecret) {
      return new Response(JSON.stringify({ error: 'Servicio no disponible' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const auth = btoa(`${wcKey}:${wcSecret}`);
    const apiUrl = search
      ? `${wpUrl}/wp-json/wc/v3/products?search=${encodeURIComponent(search)}&per_page=20&status=publish`
      : `${wpUrl}/wp-json/wc/v3/products?per_page=100&page=1&status=publish`;

    const res = await fetch(apiUrl, {
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('[productos] WooCommerce error:', res.status);
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const productos = await res.json();
    const data = productos.map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: ((p.images as Array<{ src: string }>)?.[0]?.src) || '',
    }));

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[productos] Error:', e);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
