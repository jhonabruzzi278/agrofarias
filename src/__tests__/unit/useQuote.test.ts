import { describe, it, expect, beforeEach } from 'vitest';
import { useQuote } from '../../stores/useQuote';

describe('useQuote', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with empty items', () => {
    const quote = useQuote();
    quote.clearQuote();
    expect(quote.items.value).toHaveLength(0);
    expect(quote.totalItems.value).toBe(0);
  });

  it('should add an item to the quote', () => {
    const quote = useQuote();
    quote.clearQuote();
    quote.addItem({
      id: 1,
      name: 'Test Product',
      slug: 'test-product',
      image: '/test.jpg',
    });

    expect(quote.items.value).toHaveLength(1);
    expect(quote.totalItems.value).toBe(1);
    expect(quote.items.value[0].name).toBe('Test Product');
  });

  it('should increment quantity when adding same item', () => {
    const quote = useQuote();
    quote.clearQuote();
    quote.addItem({ id: 1, name: 'Test', slug: 'test' });
    quote.addItem({ id: 1, name: 'Test', slug: 'test' });

    expect(quote.items.value).toHaveLength(1);
    expect(quote.items.value[0].cantidad).toBe(2);
    expect(quote.totalItems.value).toBe(2);
  });

  it('should remove an item from the quote', () => {
    const quote = useQuote();
    quote.clearQuote();
    quote.addItem({ id: 1, name: 'Test', slug: 'test' });
    quote.removeItem(1);

    expect(quote.items.value).toHaveLength(0);
    expect(quote.totalItems.value).toBe(0);
  });

  it('should update quantity of an item', () => {
    const quote = useQuote();
    quote.clearQuote();
    quote.addItem({ id: 1, name: 'Test', slug: 'test' });
    quote.updateQuantity(1, 5);

    expect(quote.items.value[0].cantidad).toBe(5);
    expect(quote.totalItems.value).toBe(5);
  });

  it('should not allow quantity below 1', () => {
    const quote = useQuote();
    quote.clearQuote();
    quote.addItem({ id: 1, name: 'Test', slug: 'test' });
    quote.updateQuantity(1, 0);

    expect(quote.items.value[0].cantidad).toBe(1);
  });

  it('should check if item is in quote', () => {
    const quote = useQuote();
    quote.clearQuote();
    quote.addItem({ id: 1, name: 'Test', slug: 'test' });

    expect(quote.hasItem(1)).toBe(true);
    expect(quote.hasItem(2)).toBe(false);
  });

  it('should clear all items from quote', () => {
    const quote = useQuote();
    quote.clearQuote();
    quote.addItem({ id: 1, name: 'Test 1', slug: 'test-1' });
    quote.addItem({ id: 2, name: 'Test 2', slug: 'test-2' });
    quote.clearQuote();

    expect(quote.items.value).toHaveLength(0);
    expect(quote.totalItems.value).toBe(0);
  });

  it('should persist items to localStorage', () => {
    const quote = useQuote();
    quote.clearQuote();
    quote.addItem({ id: 1, name: 'Test', slug: 'test' });

    const saved = localStorage.getItem('agrofarias-quote');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Test');
  });
});
