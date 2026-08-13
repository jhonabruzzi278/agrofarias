import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, verifySession } from './lib/session';

const ADMIN_HOST = 'admin.agrofarias.cl';

function notFound(): Response {
  return new Response('No encontrado', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

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
  const hostname = context.url.hostname.toLowerCase();
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const isAdminHost = hostname === ADMIN_HOST || isLocal;

  const isAdminPage = path === '/admin' || path.startsWith('/admin/');
  const isAdminApi =
    path === '/api/admin' || path.startsWith('/api/admin/') ||
    path === '/api/cotizador-interno' || path.startsWith('/api/cotizador-interno/');
  const isAdminSurface = isAdminPage || isAdminApi;

  // El panel no deja huellas navegables en el sitio público: las rutas
  // antiguas y sus APIs responden 404, sin redirecciones ni pistas de acceso.
  if (!isAdminHost && isAdminSurface) return notFound();

  // En el subdominio admin solo se sirve la consola, sus APIs y los recursos
  // estáticos necesarios para hidratarla. La tienda no queda duplicada aquí.
  if (hostname === ADMIN_HOST) {
    const isAdminAsset =
      path.startsWith('/_astro/') ||
      path === '/_image' ||
      path === '/logo-agrofarias.png' ||
      path === '/favicon.ico';
    const isAllowedAdminPath = path === '/' || isAdminSurface || isAdminAsset;
    if (!isAllowedAdminPath) return notFound();
  }

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
