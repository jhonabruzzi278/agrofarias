import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ProductCard from '../../components/ProductCard.vue';

describe('ProductCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  const defaultProps = {
    id: 1,
    name: 'Test Product',
    slug: 'test-product',
    image: '/test.jpg',
    category: 'Test Category',
    inStock: true,
  };

  it('should render product name', () => {
    const wrapper = mount(ProductCard, {
      props: defaultProps,
    });

    expect(wrapper.text()).toContain('Test Product');
  });

  it('should render category when provided', () => {
    const wrapper = mount(ProductCard, {
      props: defaultProps,
    });

    expect(wrapper.text()).toContain('Test Category');
  });

  it('should show "Disponible" when inStock is true', () => {
    const wrapper = mount(ProductCard, {
      props: { ...defaultProps, inStock: true },
    });

    expect(wrapper.text()).toContain('Disponible');
  });

  it('should show "Consultar" when inStock is false', () => {
    const wrapper = mount(ProductCard, {
      props: { ...defaultProps, inStock: false },
    });

    expect(wrapper.text()).toContain('Consultar');
  });

  it('should link to product page', () => {
    const wrapper = mount(ProductCard, {
      props: defaultProps,
    });

    const link = wrapper.find('a');
    expect(link.attributes('href')).toBe('/producto/test-product');
  });

  it('should render product image when provided', () => {
    const wrapper = mount(ProductCard, {
      props: defaultProps,
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/test.jpg');
    expect(img.attributes('alt')).toBe('Test Product');
  });

  it('should render placeholder when no image', () => {
    const wrapper = mount(ProductCard, {
      props: { ...defaultProps, image: '' },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(false);
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('should render QuoteButton component', () => {
    const wrapper = mount(ProductCard, {
      props: defaultProps,
    });

    expect(wrapper.findComponent({ name: 'QuoteButton' }).exists()).toBe(true);
  });
});
