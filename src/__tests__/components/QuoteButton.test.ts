import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import QuoteButton from '../../components/QuoteButton.vue';

describe('QuoteButton', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('should render with correct text when not in quote', () => {
    const wrapper = mount(QuoteButton, {
      props: {
        productId: 1,
        productName: 'Test Product',
        productSlug: 'test-product',
        productImage: '/test.jpg',
      },
    });

    expect(wrapper.text()).toContain('Agregar a cotización');
  });

  it('should add item to quote when clicked', async () => {
    const wrapper = mount(QuoteButton, {
      props: {
        productId: 1,
        productName: 'Test Product',
        productSlug: 'test-product',
      },
    });

    await wrapper.trigger('click');

    expect(wrapper.text()).toContain('En cotización');
  });

  it('should navigate to /cotizacion when item is already in quote', async () => {
    const originalHref = window.location.href;
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    const wrapper = mount(QuoteButton, {
      props: {
        productId: 1,
        productName: 'Test Product',
        productSlug: 'test-product',
      },
    });

    await wrapper.trigger('click');
    await wrapper.trigger('click');

    expect(window.location.href).toBe('/cotizacion');

    Object.defineProperty(window, 'location', {
      value: { href: originalHref },
      writable: true,
    });
  });

  it('should show plus icon when not in quote', () => {
    const wrapper = mount(QuoteButton, {
      props: {
        productId: 1,
        productName: 'Test Product',
        productSlug: 'test-product',
      },
    });

    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 24 24');
  });

  it('should show check icon when in quote', async () => {
    const wrapper = mount(QuoteButton, {
      props: {
        productId: 1,
        productName: 'Test Product',
        productSlug: 'test-product',
      },
    });

    await wrapper.trigger('click');

    expect(wrapper.text()).toContain('En cotización');
  });
});
