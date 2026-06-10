export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyPassword, createSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '../../../lib/session';
import { checkRateLimit, recordRequest, getClientIP } from '../../../lib/security';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Rate limit para frenar fuerza bruta sobre la contraseña.
  const ip = getClientIP(request);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Demasiados intentos. Espera un momento.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  await recordRequest(ip);

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Datos inválidos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!(await verifyPassword(body?.password))) {
    // Mensaje genérico: no distinguir entre "no configurado" y "incorrecto".
    return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = await createSession();
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: import.meta.env.PROD, // https en prod; en dev (http) permite probar local
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
