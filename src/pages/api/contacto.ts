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
} from '../../lib/security';

const ALLOWED_ORIGINS = [
  'https://agrofarias.cl',
  'https://www.agrofarias.cl',
]

function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  if (!origin && !referer) return false

  const checkUrl = origin || referer
  if (!checkUrl) return false

  try {
    const url = new URL(checkUrl)
    const hostname = url.hostname
    return ALLOWED_ORIGINS.some(allowed => {
      const allowedUrl = new URL(allowed)
      return hostname === allowedUrl.hostname || hostname.endsWith('.' + allowedUrl.hostname.replace(/^https?:\/\//, ''))
    })
  } catch {
    return false
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    if (!validateOrigin(request)) {
      return errorResponse('Origen no permitido', 403)
    }

    const ip = getClientIP(request);
    const { allowed, remaining } = await checkRateLimit(ip);
    if (!allowed) {
      return errorResponse('Demasiadas solicitudes. Intenta en 1 minuto.', 429);
    }
    await recordRequest(ip);

    let data: Record<string, unknown>;
    try {
      data = await request.json();
    } catch {
      return errorResponse('JSON inválido', 400);
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

    const wpUrl = import.meta.env.WORDPRESS_URL as string;
    const wpApiKey = import.meta.env.WP_CONTACT_API_KEY as string;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (wpApiKey) {
      headers['X-API-Key'] = wpApiKey
    }

    const res = await fetch(`${wpUrl}/wp-json/custom/v1/contacto`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        nombre,
        email,
        telefono,
        asunto,
        mensaje,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      return successResponse({ success: true, data: result });
    }

    const errorText = await res.text();
    console.error('[contacto] WordPress API error:', res.status, errorText)
    return errorResponse('El servicio de contacto no está disponible. Intenta nuevamente más tarde.', 502);
  } catch (e) {
    console.error('[contacto] Unhandled error:', e)
    return errorResponse('Error interno del servidor', 500);
  }
}
