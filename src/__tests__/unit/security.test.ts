import { describe, it, expect } from 'vitest';
import {
  sanitize,
  sanitizePhone,
  sanitizeProductName,
  isValidEmail,
  isValidPositiveInt,
  isValidNonEmptyString,
  validateOrigin,
  getClientIP,
  parseBody,
  checkRateLimit,
} from '../../lib/security';

// `Origin`/`Referer` son forbidden headers: el constructor real de Request los
// descarta. Usamos un Headers standalone (guard "none") dentro de un objeto que
// imita lo único que estas funciones leen: `request.headers.get(...)`.
function req(headers: Record<string, string>): Request {
  const h = new Headers();
  for (const [k, v] of Object.entries(headers)) h.set(k, v);
  return { headers: h } as unknown as Request;
}

describe('sanitize', () => {
  it('quita < > y recorta', () => {
    expect(sanitize('  <b>hola</b>  ')).toBe('bhola/b');
    expect(sanitize('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });
  it('devuelve "" para no-strings', () => {
    expect(sanitize(123)).toBe('');
    expect(sanitize(null)).toBe('');
    expect(sanitize(undefined)).toBe('');
  });
  it('limita a 1000 caracteres', () => {
    expect(sanitize('a'.repeat(2000)).length).toBe(1000);
  });
});

describe('sanitizePhone', () => {
  it('mantiene solo dígitos y símbolos de teléfono', () => {
    expect(sanitizePhone('+56 9 1234-5678')).toBe('+56 9 1234-5678');
    expect(sanitizePhone('abc+569<script>')).toBe('+569');
  });
  it('recorta a 20 caracteres', () => {
    expect(sanitizePhone('1'.repeat(50)).length).toBe(20);
  });
});

describe('sanitizeProductName', () => {
  it('quita < > y recorta a 200', () => {
    expect(sanitizeProductName('<x>Producto')).toBe('xProducto');
    expect(sanitizeProductName('p'.repeat(300)).length).toBe(200);
  });
});

describe('isValidEmail', () => {
  it('acepta emails válidos', () => {
    expect(isValidEmail('juan@example.com')).toBe(true);
  });
  it('rechaza inválidos', () => {
    expect(isValidEmail('sin-arroba')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('a @b.com')).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });
});

describe('isValidPositiveInt', () => {
  it('acepta enteros positivos', () => {
    expect(isValidPositiveInt(1)).toBe(true);
    expect(isValidPositiveInt(999)).toBe(true);
  });
  it('rechaza 0, negativos, decimales y no-números', () => {
    expect(isValidPositiveInt(0)).toBe(false);
    expect(isValidPositiveInt(-3)).toBe(false);
    expect(isValidPositiveInt(1.5)).toBe(false);
    expect(isValidPositiveInt('5')).toBe(false);
  });
});

describe('isValidNonEmptyString', () => {
  it('acepta strings dentro del límite', () => {
    expect(isValidNonEmptyString('hola')).toBe(true);
  });
  it('rechaza vacíos y excedidos', () => {
    expect(isValidNonEmptyString('   ')).toBe(false);
    expect(isValidNonEmptyString('a'.repeat(201))).toBe(false);
    expect(isValidNonEmptyString('a'.repeat(10), 5)).toBe(false);
  });
});

describe('validateOrigin', () => {
  it('acepta hosts permitidos vía Origin', () => {
    expect(validateOrigin(req({ origin: 'https://agrofarias.cl' }))).toBe(true);
    expect(validateOrigin(req({ origin: 'https://www.agrofarias.cl' }))).toBe(true);
  });
  it('acepta vía Referer si no hay Origin', () => {
    expect(validateOrigin(req({ referer: 'https://agrofarias.cl/contacto' }))).toBe(true);
  });
  it('rechaza otros orígenes y ausencia de headers', () => {
    expect(validateOrigin(req({ origin: 'https://evil.com' }))).toBe(false);
    expect(validateOrigin(req({}))).toBe(false);
    expect(validateOrigin(req({ origin: 'no-es-url' }))).toBe(false);
  });
});

describe('getClientIP', () => {
  it('prefiere x-real-ip (fijado por Vercel)', () => {
    expect(getClientIP(req({ 'x-real-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' }))).toBe('1.2.3.4');
  });
  it('usa el salto MÁS A LA DERECHA de x-forwarded-for (anti-spoof)', () => {
    expect(getClientIP(req({ 'x-forwarded-for': 'fake-cliente, 5.6.7.8' }))).toBe('5.6.7.8');
  });
  it('genera bucket estable por user-agent sin tiempo', () => {
    const a = getClientIP(req({ 'user-agent': 'TestUA' }));
    const b = getClientIP(req({ 'user-agent': 'TestUA' }));
    expect(a).toBe(b); // sin Date.now(): misma clave => rate-limit no evadible
    expect(a.startsWith('anon-')).toBe(true);
  });
});

describe('parseBody', () => {
  it('parsea JSON', async () => {
    const r = new Request('https://agrofarias.cl/api/x', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ a: 1 }),
    });
    expect(await parseBody(r)).toEqual({ a: 1 });
  });
  it('parsea urlencoded', async () => {
    const r = new Request('https://agrofarias.cl/api/x', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'nombre=Juan&email=a@b.com',
    });
    expect(await parseBody(r)).toEqual({ nombre: 'Juan', email: 'a@b.com' });
  });
});

describe('checkRateLimit (sin Upstash configurado en test)', () => {
  it('no bloquea cuando no hay KV (fallback permisivo)', async () => {
    const result = await checkRateLimit('1.2.3.4');
    expect(result.allowed).toBe(true);
  });
});
