/**
 * Autenticación de sesión para el panel admin.
 *
 * Reemplaza el esquema anterior (token derivado de la contraseña con base64,
 * reversible y expuesto al cliente). Ahora la contraseña se valida en el
 * servidor y se emite una cookie de sesión firmada con HMAC-SHA256 y con
 * expiración. El secreto NUNCA llega al navegador.
 */

export const SESSION_COOKIE = 'af_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

const encoder = new TextEncoder();

function getSecret(): string {
  // Preferir un secreto dedicado; si no está, derivar del password como
  // último recurso (sigue siendo server-side y nunca se expone al cliente).
  return (
    (import.meta.env.SESSION_SECRET as string | undefined) ||
    (import.meta.env.COTIZADOR_PASSWORD as string | undefined) ||
    ''
  );
}

function toBase64Url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  return atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
}

function bytesToBinaryString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return str;
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return toBase64Url(bytesToBinaryString(signature));
}

/** Comparación en tiempo constante para evitar timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** Valida la contraseña del admin en tiempo constante. */
export async function verifyPassword(input: unknown): Promise<boolean> {
  const expected = import.meta.env.COTIZADOR_PASSWORD as string | undefined;
  const secret = getSecret();
  if (!expected || !secret || typeof input !== 'string') return false;
  // Comparamos HMACs de longitud fija para no filtrar la longitud del password.
  const [a, b] = await Promise.all([hmac(input, secret), hmac(expected, secret)]);
  return timingSafeEqual(a, b);
}

/** Crea un token de sesión firmado: `<payload>.<firma>`. */
export async function createSession(): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error('SESSION_SECRET/COTIZADOR_PASSWORD no configurado');
  const payload = toBase64Url(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS }));
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

/** Verifica firma y expiración de un token de sesión. */
export async function verifySession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;

  const expected = await hmac(payload, secret);
  if (!timingSafeEqual(signature, expected)) return false;

  try {
    const data = JSON.parse(fromBase64Url(payload)) as { exp?: unknown };
    return typeof data.exp === 'number' && Date.now() < data.exp;
  } catch {
    return false;
  }
}

export const SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);
