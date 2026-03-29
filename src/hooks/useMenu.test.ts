import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMenu } from './useMenu';

const mockProducts = [
  {
    id: 'prod-1',
    name: 'BPC-157',
    description: 'Recovery peptide',
    category: 'Recovery',
    base_price: 2500,
    discount_price: null,
    discount_start_date: null,
    discount_end_date: null,
    discount_active: false,
    available: true,
    featured: true,
    purity_percentage: 99,
    storage_conditions: 'Refrigerate',
    stock_quantity: 10,
    image_url: null,
    safety_sheet_url: null,
    inclusions: null,
    molecular_weight: null,
    cas_number: null,
    sequence: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    product_variations: [
      { id: 'var-2', product_id: 'prod-1', name: '10mg', quantity_mg: 10, price: 2500, stock_quantity: 5, created_at: '2025-01-01', disposable_pen_price: null, reusable_pen_price: null, discount_price: null, discount_active: false },
      { id: 'var-1', product_id: 'prod-1', name: '5mg', quantity_mg: 5, price: 1500, stock_quantity: 3, created_at: '2025-01-01', disposable_pen_price: null, reusable_pen_price: null, discount_price: null, discount_active: false },
    ],
  },
  {
    id: 'prod-2',
    name: 'GHK-Cu',
    description: 'Skin peptide',
    category: 'Skin',
    base_price: 3000,
    discount_price: null,
    discount_start_date: null,
    discount_end_date: null,
    discount_active: false,
    available: true,
    featured: false,
    purity_percentage: 98,
    storage_conditions: 'Refrigerate',
    stock_quantity: 8,
    image_url: null,
    safety_sheet_url: null,
    inclusions: null,
    molecular_weight: null,
    cas_number: null,
    sequence: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    product_variations: [],
  },
];

// Chain: supabase.from('products').select(...).eq(...).order(...).order(...)
const mockOrder2 = vi.fn();
const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
const mockEq = vi.fn().mockReturnValue({ order: mockOrder1 });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

const mockRemoveChannel = vi.fn();

// Use lazy arrow functions to avoid hoisting issues
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: (...args: unknown[]) => mockSelect(...args),
    }),
    channel: () => mockChannel,
    removeChannel: (...args: unknown[]) => mockRemoveChannel(...args),
  },
}));

describe('useMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder1 });
    mockOrder1.mockReturnValue({ order: mockOrder2 });
    mockOrder2.mockResolvedValue({ data: mockProducts, error: null });
  });

  // --- fetchProducts ---

  describe('fetchProducts', () => {
    it('fetches products on mount', async () => {
      const { result } = renderHook(() => useMenu());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toHaveLength(2);
      expect(result.current.products[0].name).toBe('BPC-157');
      expect(result.current.products[1].name).toBe('GHK-Cu');
      expect(result.current.error).toBeNull();
    });

    it('sorts variations by quantity_mg ascending', async () => {
      const { result } = renderHook(() => useMenu());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const variations = result.current.products[0].variations;
      expect(variations).toHaveLength(2);
      expect(variations![0].name).toBe('5mg');
      expect(variations![0].quantity_mg).toBe(5);
      expect(variations![1].name).toBe('10mg');
      expect(variations![1].quantity_mg).toBe(10);
    });

    it('removes product_variations key from result', async () => {
      const { result } = renderHook(() => useMenu());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect((result.current.products[0] as any).product_variations).toBeUndefined();
    });

    it('handles products with no variations', async () => {
      const { result } = renderHook(() => useMenu());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products[1].variations).toEqual([]);
    });

    it('sets error on fetch failure', async () => {
      mockOrder2.mockResolvedValueOnce({ data: null, error: new Error('Network error') });

      const { result } = renderHook(() => useMenu());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });

    it('handles null data gracefully', async () => {
      mockOrder2.mockResolvedValueOnce({ data: null, error: null });

      const { result } = renderHook(() => useMenu());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
    });
  });

  // --- Realtime subscription ---

  describe('realtime subscription', () => {
    it('subscribes to products and product_variations channels', () => {
      renderHook(() => useMenu());

      expect(mockChannel.on).toHaveBeenCalledTimes(2);
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes on unmount', () => {
      const { unmount } = renderHook(() => useMenu());

      unmount();

      expect(mockRemoveChannel).toHaveBeenCalled();
    });
  });
});
