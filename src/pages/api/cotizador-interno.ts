export const prerender = false;

import {
  sanitize,
  sanitizePhone,
  sanitizeProductName,
  isValidEmail,
  isValidPositiveInt,
  isValidNonEmptyString,
  checkRateLimit,
  recordRequest,
  getClientIP,
} from '../../lib/security';

function checkAuth(request: Request): boolean {
  const password = import.meta.env.COTIZADOR_PASSWORD as string;
  if (!password) return false;
  const expected = 'agf_' + Buffer.from(password + ':af').toString('base64').replace(/=/g, '');
  const authHeader = request.headers.get('x-cotizador-auth') || '';
  return authHeader === expected;
}

export async function POST({ request }: { request: Request }) {
  try {
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting
    const ip = getClientIP(request);
    const { allowed } = await checkRateLimit(ip);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await recordRequest(ip);

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Datos inválidos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const nombre = sanitize(body.nombre);
    const email = sanitize(body.email);
    const telefono = sanitizePhone(body.telefono);
    const empresa = sanitize(body.empresa ?? '');
    const mensaje = sanitize(body.mensaje ?? '');
    const productosRaw = Array.isArray(body.productos) ? body.productos : [];

    if (!isValidNonEmptyString(nombre))
      return new Response(JSON.stringify({ error: 'Nombre inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    if (!isValidEmail(email))
      return new Response(JSON.stringify({ error: 'Email inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    if (!isValidNonEmptyString(telefono, 50))
      return new Response(JSON.stringify({ error: 'Teléfono inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    if (productosRaw.length === 0)
      return new Response(JSON.stringify({ error: 'Debe haber al menos un producto' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    if (productosRaw.length > 50)
      return new Response(JSON.stringify({ error: 'Máximo 50 productos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const productos = productosRaw.map((p: unknown) => {
      if (!p || typeof p !== 'object') return null;
      const item = p as Record<string, unknown>;
      const id = item.id;
      const name = sanitizeProductName(item.name);
      const cantidad = item.cantidad;
      const precioUnitario = item.precioUnitario;
      if (!isValidPositiveInt(id) || !isValidNonEmptyString(name) || !isValidPositiveInt(cantidad))
        return null;
      const price = typeof precioUnitario === 'number' && precioUnitario >= 0 ? Math.round(precioUnitario) : 0;
      return { id: id as number, name, cantidad: cantidad as number, precioUnitario: price };
    }).filter((p): p is { id: number; name: string; cantidad: number; precioUnitario: number } => p !== null);

    if (productos.length === 0)
      return new Response(JSON.stringify({ error: 'Productos inválidos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const wpUrl = import.meta.env.WORDPRESS_URL as string | undefined;
    const wcKey = import.meta.env.WC_CONSUMER_KEY as string;
    const wcSecret = import.meta.env.WC_CONSUMER_SECRET as string;

    if (!wpUrl || !wcKey || !wcSecret) {
      console.error('[cotizador-interno] WooCommerce config missing');
      return new Response(JSON.stringify({ error: 'Servicio no disponible' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    const auth = btoa(`${wcKey}:${wcSecret}`);
    const nombreParts = nombre.split(/\s+/);

    const orderBody = {
      status: 'processing',
      billing: {
        first_name: nombreParts[0] || nombre,
        last_name: nombreParts.slice(1).join(' ') || nombreParts[0] || '',
        email,
        phone: telefono,
        company: empresa || '',
      },
      customer_note: `COTIZACIÓN - ${productos.map(p => `${p.name} x${p.cantidad} ($${p.precioUnitario.toLocaleString('es-CL')} c/u)`).join(', ')}${mensaje ? ' - Mensaje: ' + mensaje : ''}`,
      line_items: productos.map(p => ({
        product_id: p.id,
        quantity: p.cantidad,
        subtotal: String(p.cantidad * p.precioUnitario),
        total: String(p.cantidad * p.precioUnitario),
      })),
    };

    const orderRes = await fetch(`${wpUrl}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(orderBody),
    });

    const orderText = await orderRes.text();

    if (orderRes.ok) {
      const order = JSON.parse(orderText);
      console.log(`[cotizador-interno] Order created: ${order.id} for ${email}`);
      return new Response(JSON.stringify({ success: true, id: order.id, orderNumber: order.number }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('[cotizador-interno] WooCommerce order failed:', orderRes.status, orderText);
    const errMsg = (() => {
      try { return JSON.parse(orderText).message || 'Error al crear la cotización'; }
      catch { return 'Error al crear la cotización'; }
    })();
    return new Response(JSON.stringify({ error: errMsg }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[cotizador-interno] Unhandled error:', e);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
