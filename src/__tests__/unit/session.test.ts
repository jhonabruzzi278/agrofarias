import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { verifyPassword, createSession, verifySession } from '../../lib/session';

beforeEach(() => {
  vi.stubEnv('COTIZADOR_PASSWORD', 'super-secreta-2025');
  vi.stubEnv('SESSION_SECRET', 'clave-hmac-de-prueba-larga');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('verifyPassword', () => {
  it('acepta la contraseña correcta', async () => {
    expect(await verifyPassword('super-secreta-2025')).toBe(true);
  });
  it('rechaza contraseña incorrecta', async () => {
    expect(await verifyPassword('otra')).toBe(false);
  });
  it('rechaza no-strings', async () => {
    expect(await verifyPassword(undefined)).toBe(false);
    expect(await verifyPassword(12345)).toBe(false);
  });
});

describe('createSession / verifySession', () => {
  it('un token recién creado es válido', async () => {
    const token = await createSession();
    expect(await verifySession(token)).toBe(true);
  });

  it('rechaza token con firma manipulada', async () => {
    const token = await createSession();
    const [payload] = token.split('.');
    const tampered = `${payload}.firmaFalsa`;
    expect(await verifySession(tampered)).toBe(false);
  });

  it('rechaza token con payload manipulado', async () => {
    const token = await createSession();
    const [, sig] = token.split('.');
    const fakePayload = btoa(JSON.stringify({ exp: Date.now() + 999999 }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(await verifySession(`${fakePayload}.${sig}`)).toBe(false);
  });

  it('rechaza tokens malformados / vacíos', async () => {
    expect(await verifySession(undefined)).toBe(false);
    expect(await verifySession('')).toBe(false);
    expect(await verifySession('sin-punto')).toBe(false);
    expect(await verifySession('a.b.c')).toBe(false);
  });

  it('rechaza token expirado', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const token = await createSession();
    expect(await verifySession(token)).toBe(true);
    // Avanzamos 9 horas (TTL es 8h)
    vi.setSystemTime(new Date('2026-01-01T09:00:00Z'));
    expect(await verifySession(token)).toBe(false);
  });

  it('un token de otra clave no valida', async () => {
    const token = await createSession();
    vi.stubEnv('SESSION_SECRET', 'clave-distinta');
    expect(await verifySession(token)).toBe(false);
  });
});
