import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, verifySession } from './lib/session';

/**
 * Gate centralizado de autenticación.
 *
 * Todos los endpoints internos del cotizador (`/api/cotizador-interno/*`)
 * exigen una cookie de sesión válida. La página `/admin/cotizador` es solo
 * una cáscara con el formulario de login: ya no contiene ningún secreto, por
 * lo que puede servirse públicamente. La autorización real vive aquí.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;

  const isProtectedApi =
    path === '/api/cotizador-interno' || path.startsWith('/api/cotizador-interno/') ||
    path.startsWith('/api/admin/productos') ||
    path.startsWith('/api/admin/clientes') ||
    path.startsWith('/api/admin/categorias');

  if (isProtectedApi) {
    const token = context.cookies.get(SESSION_COOKIE)?.value;
    if (!(await verifySession(token))) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return next();
});
