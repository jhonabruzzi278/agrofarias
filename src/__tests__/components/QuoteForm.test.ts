import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import QuoteForm from '../../components/QuoteForm.vue';
import { useQuote } from '../../stores/useQuote';
import * as woocommerce from '../../lib/woocommerce';

vi.mock('../../lib/woocommerce', () => ({
  submitCotizacion: vi.fn(),
}));

describe('QuoteForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    const quote = useQuote();
    quote.clearQuote();
  });

  it('should show form with items count when quote has items', async () => {
    const quote = useQuote();
    quote.addItem({ id: 1, name: 'Test Product', slug: 'test' });

    const wrapper = mount(QuoteForm);

    expect(wrapper.text()).toContain('Tus productos');
    expect(wrapper.text()).toContain('1 items');
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('should render all form fields', () => {
    const quote = useQuote();
    quote.addItem({ id: 1, name: 'Test Product', slug: 'test' });

    const wrapper = mount(QuoteForm);

    expect(wrapper.find('input[placeholder="Ej: Juan Pérez"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="Ej: juan@ejemplo.com"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="+56912345678"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="Ej: Agrícola El Sol"]').exists()).toBe(true);
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('should have submit button with correct text', () => {
    const quote = useQuote();
    quote.addItem({ id: 1, name: 'Test Product', slug: 'test' });

    const wrapper = mount(QuoteForm);

    const button = wrapper.find('button[type="submit"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Enviar solicitud de presupuesto');
  });
});
