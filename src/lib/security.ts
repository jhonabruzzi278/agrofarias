import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL as string,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN as string,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
})

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const { success, remaining } = await ratelimit.limit(ip)
    return { allowed: success, remaining: Math.max(0, remaining) }
  } catch (e) {
    // Fallback: si Redis falla, permitir (no quiebres el sitio).
    console.warn('[checkRateLimit] Error conectando a Upstash:', e)
    return { allowed: true, remaining: 10 }
  }
}

export async function recordRequest(_ip: string): Promise<void> {
  // Upstash lo maneja automáticamente vía ratelimit.limit() en checkRateLimit()
}

export function getClientIP(request: Request): string {
  // En Vercel, `x-real-ip` lo fija la plataforma con la IP real del cliente
  // y no es spoofeable por el cliente, así que se prefiere.
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  // Fallback: tomar el salto MÁS A LA DERECHA de x-forwarded-for (el añadido
  // por el proxy de confianza), no el primero (que el cliente puede falsear).
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded.split(',').map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  // Último recurso: bucket estable por user-agent (sin tiempo, para que el
  // rate-limit no se evada con una clave distinta en cada request).
  const ua = request.headers.get('user-agent') || 'unknown';
  return `anon-${simpleHash(ua)}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}

const MAX_STR_LENGTH = 1000

export function sanitize(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[<>]/g, '').trim().slice(0, MAX_STR_LENGTH)
}

export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[^0-9+\-() ]/g, '').trim().slice(0, 20)
}

export function sanitizeProductName(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[<>]/g, '').trim().slice(0, 200)
}

export function isValidEmail(input: unknown): boolean {
  if (typeof input !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim())
}

export function isValidPositiveInt(input: unknown): boolean {
  if (typeof input !== 'number') return false
  return Number.isInteger(input) && input > 0
}

export function isValidNonEmptyString(input: unknown, maxLen = 200): boolean {
  if (typeof input !== 'string') return false
  const trimmed = input.trim()
  return trimmed.length > 0 && trimmed.length <= maxLen
}

export function errorResponse(error: string, status: number): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function successResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const ALLOWED_HOSTS = new Set(['agrofarias.cl', 'www.agrofarias.cl'])

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  const checkUrl = origin || referer;
  if (!checkUrl) return false;

  try {
    const hostname = new URL(checkUrl).hostname;
    return ALLOWED_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

export async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('urlencoded') || contentType.includes('multipart')) {
    const formData = await request.formData();
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') data[key] = value;
    });
    return data;
  }
  return request.json();
}
