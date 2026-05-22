export const prerender = false;

import {
  checkRateLimit,
  getClientIP,
  sanitize,
  sanitizePhone,
  isValidEmail,
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

    const res = await fetch(`${wpUrl}/wp-json/custom/v1/contacto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    return errorResponse('El servicio de contacto no está disponible. Intenta nuevamente más tarde.', 502);
  } catch {
    return errorResponse('Error interno del servidor', 500);
  }
}
