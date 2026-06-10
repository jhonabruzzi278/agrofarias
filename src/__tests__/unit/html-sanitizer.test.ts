import { describe, it, expect } from 'vitest';
import { sanitizeHTML } from '../../lib/html-sanitizer';

describe('sanitizeHTML', () => {
  it('devuelve "" para entradas vacías', () => {
    expect(sanitizeHTML('')).toBe('');
    expect(sanitizeHTML(null)).toBe('');
    expect(sanitizeHTML(undefined)).toBe('');
  });

  it('conserva etiquetas permitidas', () => {
    const out = sanitizeHTML('<p>Hola <strong>mundo</strong></p>');
    expect(out).toContain('<p>');
    expect(out).toContain('<strong>');
    expect(out).toContain('mundo');
  });

  it('elimina <script> y su contenido', () => {
    const out = sanitizeHTML('<p>ok</p><script>alert(1)</script>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert(1)');
    expect(out).toContain('ok');
  });

  it('elimina manejadores de eventos (onerror/onclick)', () => {
    const out = sanitizeHTML('<img src="x" onerror="alert(1)"><div onclick="evil()">hi</div>');
    expect(out).not.toContain('onerror');
    expect(out).not.toContain('onclick');
    expect(out).not.toContain('alert(1)');
  });

  it('elimina URLs javascript: en href', () => {
    const out = sanitizeHTML('<a href="javascript:alert(1)">click</a>');
    expect(out.toLowerCase()).not.toContain('javascript:');
    expect(out).toContain('click');
  });

  it('conserva enlaces http(s) y fuerza rel seguro', () => {
    const out = sanitizeHTML('<a href="https://ejemplo.com">ir</a>');
    expect(out).toContain('href="https://ejemplo.com"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });

  it('descarta etiquetas no permitidas (iframe, style)', () => {
    const out = sanitizeHTML('<iframe src="evil"></iframe><style>body{}</style><p>texto</p>');
    expect(out).not.toContain('<iframe');
    expect(out).not.toContain('<style');
    expect(out).toContain('texto');
  });

  it('conserva imágenes con src/alt permitidos', () => {
    const out = sanitizeHTML('<img src="https://cdn/x.jpg" alt="foto" loading="lazy">');
    expect(out).toContain('src="https://cdn/x.jpg"');
    expect(out).toContain('alt="foto"');
  });
});
