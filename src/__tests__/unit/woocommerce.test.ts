import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitCotizacion } from '../../lib/woocommerce';
import type { SolicitudCotizacion } from '../../lib/types';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('submitCotizacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success when API responds ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 123 }),
    });

    const data: SolicitudCotizacion = {
      productos: [{ id: 1, name: 'Test', slug: 'test', cantidad: 1 }],
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '+56912345678',
    };

    const result = await submitCotizacion(data);
    expect(result).toEqual({ success: true, id: 123 });
    expect(mockFetch).toHaveBeenCalledWith('/api/cotizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  });

  it('should return error when API responds with error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Nombre inválido' }),
    });

    const data: SolicitudCotizacion = {
      productos: [{ id: 1, name: 'Test', slug: 'test', cantidad: 1 }],
      nombre: '',
      email: 'juan@example.com',
      telefono: '+56912345678',
    };

    const result = await submitCotizacion(data);
    expect(result).toEqual({ error: 'Nombre inválido' });
  });

  it('should return generic error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const data: SolicitudCotizacion = {
      productos: [{ id: 1, name: 'Test', slug: 'test', cantidad: 1 }],
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '+56912345678',
    };

    const result = await submitCotizacion(data);
    expect(result).toEqual({ error: 'Error de conexión al enviar la cotización' });
  });
});
