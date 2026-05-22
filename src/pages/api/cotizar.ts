export const prerender = false;

import {
  checkRateLimit,
  getClientIP,
  sanitize,
  sanitizePhone,
  sanitizeProductName,
  isValidEmail,
  isValidPositiveInt,
  isValidNonEmptyString,
  errorResponse,
  successResponse,
} from '../../lib/security';

export async function POST({ request }: { request: Request }) {
  try {
    const ip = getClientIP(request);
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return errorResponse('Demasiadas solicitudes. Intenta en 1 minuto.', 429);
    }

    let data: Record<string, unknown>;
    try {
      data = await request.json();
    } catch {
      return errorResponse('JSON inválido', 400);
    }

    const nombre = sanitize(data.nombre);
    const email = sanitize(data.email);
    const telefono = sanitizePhone(data.telefono);
    const empresa = sanitize(data.empresa ?? '');
    const mensaje = sanitize(data.mensaje ?? '');
    const productosRaw = Array.isArray(data.productos) ? data.productos : [];

    if (!isValidNonEmptyString(nombre)) {
      return errorResponse('Nombre inválido', 400);
    }
    if (!isValidEmail(email)) {
      return errorResponse('Email inválido', 400);
    }
    if (!isValidNonEmptyString(telefono, 50)) {
      return errorResponse('Teléfono inválido', 400);
    }
    if (productosRaw.length === 0) {
      return errorResponse('Debes agregar al menos un producto', 400);
    }
    if (productosRaw.length > 50) {
      return errorResponse('Máximo 50 productos por cotización', 400);
    }

    const productos = productosRaw.map((p: unknown) => {
      if (!p || typeof p !== 'object') return null;
      const item = p as Record<string, unknown>;
      const id = item.id;
      const name = sanitizeProductName(item.name);
      const cantidad = item.cantidad;
      if (!isValidPositiveInt(id) || !isValidNonEmptyString(name) || !isValidPositiveInt(cantidad)) {
        return null;
      }
      return { id: id as number, name, cantidad: cantidad as number };
    }).filter((p): p is { id: number; name: string; cantidad: number } => p !== null);

    if (productos.length === 0) {
      return errorResponse('Productos inválidos', 400);
    }

    const wpUrl = import.meta.env.WORDPRESS_URL as string;
    const wcKey = import.meta.env.WC_CONSUMER_KEY as string;
    const wcSecret = import.meta.env.WC_CONSUMER_SECRET as string;
    const auth = btoa(`${wcKey}:${wcSecret}`);

    const orderBody = {
      status: 'pending',
      billing: {
        first_name: nombre.split(' ')[0],
        last_name: nombre.split(' ').slice(1).join(' ') || nombre,
        email,
        phone: telefono,
        company: empresa,
      },
      customer_note: `COTIZACIÓN - ${productos.map(p => `${p.name} x${p.cantidad}`).join(', ')} - Mensaje: ${mensaje || 'Sin mensaje'}`,
      line_items: productos.map(p => ({
        product_id: p.id,
        quantity: p.cantidad,
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
      return successResponse({ success: true, id: order.id, via: 'woocommerce', orderNumber: order.number });
    }

    const errMsg = (() => { try { return JSON.parse(orderText).message || 'Error al crear la orden'; } catch { return 'Error al crear la orden'; } })();
    return errorResponse(errMsg, 502);
  } catch {
    return errorResponse('Error interno del servidor', 500);
  }
}
