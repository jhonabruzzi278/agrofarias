export const prerender = false;

import type { APIContext } from 'astro';
import { checkRateLimit, getClientIP } from '../../../../lib/security';
import { SESSION_COOKIE, verifySession } from '../../../../lib/session';
import { uploadProductoImage } from '../../../../lib/woocommerce';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST({ request, cookies }: APIContext) {
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: JSON_HEADERS });
  }

  const { allowed } = await checkRateLimit(getClientIP(request));
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), { status: 429, headers: JSON_HEADERS });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Se requiere un archivo de imagen' }), { status: 400, headers: JSON_HEADERS });
    }

    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Solo se permiten archivos de imagen' }), { status: 400, headers: JSON_HEADERS });
    }

    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: 'La imagen no debe superar 5MB' }), { status: 400, headers: JSON_HEADERS });
    }

    // Reject filenames with path traversal
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeFile = new File([file], safeName, { type: file.type });

    const result = await uploadProductoImage(safeFile);

    return new Response(JSON.stringify({ success: true, id: result.id, url: result.source_url }), {
      status: 200, headers: JSON_HEADERS,
    });
  } catch (e) {
    console.error('[admin/productos/imagen POST]', e);
    return new Response(JSON.stringify({ error: 'Error al subir imagen' }), { status: 502, headers: JSON_HEADERS });
  }
}
