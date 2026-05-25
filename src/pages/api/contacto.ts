export const prerender = false;

import {
  checkRateLimit,
  recordRequest,
  getClientIP,
  sanitize,
  sanitizePhone,
  isValidEmail,
  isValidNonEmptyString,
  errorResponse,
  successResponse,
  validateOrigin,
} from '../../lib/security';

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') data[key] = value;
    });
    return data;
  }
  return request.json();
}

export async function POST({ request }: { request: Request }) {
  try {
    if (!validateOrigin(request)) {
      return errorResponse('Origen no permitido', 403)
    }

    const ip = getClientIP(request);
    const { allowed } = await checkRateLimit(ip);
    if (!allowed) {
      return errorResponse('Demasiadas solicitudes. Intenta en 1 minuto.', 429);
    }
    await recordRequest(ip);

    let data: Record<string, unknown>;
    try {
      data = await parseBody(request);
    } catch {
      return errorResponse('Datos inválidos', 400);
    }

    const nombre = sanitize(data.nombre);
    const email = sanitize(data.email);
    const telefono = sanitizePhone(data.telefono ?? '');
    const asunto = sanitize(data.asunto ?? '');
    const mensaje = sanitize(data.mensaje ?? '');

    if (!isValidNonEmptyString(nombre)) {
      return errorResponse('Nombre inválido', 400);
    }
    if (!isValidEmail(email)) {
      return errorResponse('Email inválido', 400);
    }
    if (!isValidNonEmptyString(asunto)) {
      return errorResponse('Asunto inválido', 400);
    }
    if (!isValidNonEmptyString(mensaje, 5000)) {
      return errorResponse('Mensaje inválido', 400);
    }

    const wpUrl = import.meta.env.WORDPRESS_URL as string | undefined;
    if (!wpUrl) {
      return errorResponse('Configuración no disponible', 503);
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const wpApiKey = import.meta.env.WP_CONTACT_API_KEY as string | undefined;
    if (wpApiKey) {
      headers['X-API-Key'] = wpApiKey;
    }

    const res = await fetch(`${wpUrl}/wp-json/custom/v1/contacto`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ nombre, email, telefono, asunto, mensaje }),
    });

    if (res.ok) {
      const result = await res.json().catch(() => ({}));
      return successResponse({ success: true, data: result });
    }

    const errorText = await res.text().catch(() => '');
    console.error('[contacto] WordPress API error:', res.status, errorText)
    return errorResponse('El servicio de contacto no está disponible. Intenta nuevamente más tarde.', 502);
  } catch (e) {
    console.error('[contacto] Unhandled error:', e)
    return errorResponse('Error interno del servidor', 500);
  }
}
