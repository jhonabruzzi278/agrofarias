export const prerender = false;

import { fetchOrders } from '../../../lib/woocommerce';

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
    const orders = await fetchOrders({ perPage: 50 });

    // Filter to only quote-related orders
    const quotes = orders
      .filter((o: Record<string, unknown>) => {
        const note = String(o.customer_note || '');
        return note.includes('COTIZACIÓN -') || note.includes('COTIZACION -');
      })
      .map((o: Record<string, unknown>) => {
        const billing = (o.billing as Record<string, string>) || {};
        const items = (o.line_items as Array<Record<string, unknown>>) || [];
        return {
          id: o.id,
          number: o.number,
          status: o.status,
          date_created: o.date_created,
          total: o.total,
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
      });

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
