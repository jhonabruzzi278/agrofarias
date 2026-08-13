export const prerender = false;

import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '../../../lib/session';
import { checkRateLimit, getClientIP } from '../../../lib/security';

export const POST: APIRoute = async ({ request, cookies }) => {
  const ip = getClientIP(request);
  const { allowed } = await checkRateLimit(ip, 'admin-logout');
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  cookies.delete(SESSION_COOKIE, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
  });
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
