export const prerender = false;

import type { APIContext } from 'astro';
import { fetchOrders } from '../../../lib/woocommerce';
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

  const wpUrl = (import.meta.env.WORDPRESS_URL as string | undefined)?.replace(/\/$/, '') || '';

  const isCotizacion = (o: Record<string, unknown>): boolean => {
    const note = String(o.customer_note || '');
    return note.includes('COTIZACIÓN -') || note.includes('COTIZACION -');
  };

  const mapQuote = (o: Record<string, unknown>) => {
    const billing = (o.billing as Record<string, string>) || {};
    const items = (o.line_items as Array<Record<string, unknown>>) || [];
    return {
      id: o.id,
      number: o.number,
      status: o.status,
      date_created: o.date_created,
      total: o.total,
      // Link al editor de la orden en WooCommerce (HPOS, default moderno).
      editUrl: wpUrl ? `${wpUrl}/wp-admin/admin.php?page=wc-orders&action=edit&id=${o.id}` : '',
      customer: {
        name: `${billing.first_name || ''} ${billing.last_name || ''}`.trim(),
        email: billing.email || '',
        phone: billing.phone || '',
        company: billing.company || '',
      },
      products: items.map((item: Record<string, unknown>) => ({
        name: item.name,
        quantity: item.quantity,
        total: item.total,
      })),
      message: String(o.customer_note || ''),
    };
  };

  try {
    // El filtro de "cotización" se aplica sobre el customer_note, que WooCommerce
    // no permite filtrar server-side. Por eso escaneamos varias páginas de órdenes
    // recientes (hasta MAX_PAGES * PER_PAGE) en lugar de quedarnos con las primeras
    // 50: así las cotizaciones no quedan ocultas tras órdenes normales.
    const PER_PAGE = 100;
    const MAX_PAGES = 3; // hasta 300 órdenes recientes escaneadas
    const quotes: ReturnType<typeof mapQuote>[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const orders = await fetchOrders({ perPage: PER_PAGE, page });
      if (orders.length === 0) break;
      for (const o of orders) {
        if (isCotizacion(o)) quotes.push(mapQuote(o));
      }
      if (orders.length < PER_PAGE) break; // última página
    }

    return new Response(JSON.stringify(quotes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[cotizador-interno/quotes] Error:', e);
    return new Response(JSON.stringify({ error: 'Error al cargar cotizaciones' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
