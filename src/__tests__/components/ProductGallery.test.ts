import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ProductGallery from '../../components/ProductGallery.vue';

describe('ProductGallery', () => {
  const oneImage = [{ id: 1, src: '/foto-1.jpg', alt: 'Foto 1' }];
  const twoImages = [
    { id: 1, src: '/foto-1.jpg', alt: 'Foto 1' },
    { id: 2, src: '/foto-2.jpg', alt: 'Foto 2' },
  ];

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('should render placeholder when there are no images', () => {
    const wrapper = mount(ProductGallery, { props: { images: [], productName: 'Producto X' } });

    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.fa-image').exists()).toBe(true);
  });

  it('should render the main image', () => {
    const wrapper = mount(ProductGallery, { props: { images: oneImage, productName: 'Producto X' } });

    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('/foto-1.jpg');
    expect(img.attributes('alt')).toBe('Foto 1');
  });

  it('should not render thumbnails when there is only 1 image', () => {
    const wrapper = mount(ProductGallery, { props: { images: oneImage, productName: 'Producto X' } });

    // main image + (none in lightbox, closed) = 1
    expect(wrapper.findAll('img').length).toBe(1);
  });

  it('should render thumbnails and switch the main image on click', async () => {
    const wrapper = mount(ProductGallery, { props: { images: twoImages, productName: 'Producto X' }, attachTo: document.body });

    const thumbButtons = wrapper.findAll('button').filter((b) => b.attributes('aria-label')?.startsWith('Ver imagen'));
    expect(thumbButtons.length).toBe(2);

    await thumbButtons[1]!.trigger('click');

    const mainImg = wrapper.find('img');
    expect(mainImg.attributes('src')).toBe('/foto-2.jpg');
    wrapper.unmount();
  });

  it('should open the lightbox when the main image is clicked', async () => {
    const wrapper = mount(ProductGallery, { props: { images: twoImages, productName: 'Producto X' }, attachTo: document.body });

    await wrapper.find('[aria-label="Ampliar imagen"]').trigger('click');

    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    wrapper.unmount();
  });

  it('should close the lightbox on Escape and navigate with arrow keys', async () => {
    const wrapper = mount(ProductGallery, { props: { images: twoImages, productName: 'Producto X' }, attachTo: document.body });

    await wrapper.find('[aria-label="Ampliar imagen"]').trigger('click');
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    await wrapper.vm.$nextTick();
    const dialogImg = document.querySelector('[role="dialog"] img') as HTMLImageElement;
    expect(dialogImg.src).toContain('/foto-2.jpg');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    wrapper.unmount();
  });

  it('should not render prev/next arrows in the lightbox when there is only 1 image', async () => {
    const wrapper = mount(ProductGallery, { props: { images: oneImage, productName: 'Producto X' }, attachTo: document.body });

    await wrapper.find('[aria-label="Ampliar imagen"]').trigger('click');

    expect(document.querySelector('[aria-label="Imagen siguiente"]')).toBeNull();
    expect(document.querySelector('[aria-label="Imagen anterior"]')).toBeNull();
    wrapper.unmount();
  });
});
