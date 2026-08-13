export const prerender = false;

import type { APIContext } from 'astro';
import { SESSION_COOKIE, verifySession } from '../../../lib/session';
import { fetchCategorias, fetchProductosAdmin } from '../../../lib/woocommerce';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};

interface CheckResult {
  ok: boolean;
  latency: number;
  detail: string;
}

async function measure<T>(work: () => Promise<T>, successDetail: (value: T) => string): Promise<CheckResult> {
  const start = performance.now();
  try {
    const value = await work();
    return {
      ok: true,
      latency: Math.round(performance.now() - start),
      detail: successDetail(value),
    };
  } catch (error) {
    console.error('[admin/health]', error);
    return {
      ok: false,
      latency: Math.round(performance.now() - start),
      detail: 'No se pudo comprobar el servicio',
    };
  }
}

export async function GET({ cookies }: APIContext) {
  const sessionStart = performance.now();
  if (!(await verifySession(cookies.get(SESSION_COOKIE)?.value))) {
    return new Response(JSON.stringify({ error: 'Sesión vencida' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  const session: CheckResult = {
    ok: true,
    latency: Math.round(performance.now() - sessionStart),
    detail: 'Sesión autenticada y vigente',
  };

  // Un solo endpoint protegido ejecuta las comprobaciones internas. Así el
  // diagnóstico no consume las cuotas de uso de cada módulo del dashboard.
  const [catalog, products] = await Promise.all([
    measure(fetchCategorias, (categories) => `${categories.length} categorías disponibles`),
    measure(
      () => fetchProductosAdmin({ page: 1, per_page: 1, status: 'any' }),
      ({ total }) => `${total} productos disponibles`,
    ),
  ]);

  return new Response(JSON.stringify({
    checkedAt: new Date().toISOString(),
    services: { session, catalog, products },
  }), { status: 200, headers: JSON_HEADERS });
}
