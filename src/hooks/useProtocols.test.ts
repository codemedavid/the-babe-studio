import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProtocols } from './useProtocols';
import { allMockProtocols, mockTextProtocol } from '../test/mocks';

// Mock supabase
const mockOrder = vi.fn();
const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
const mockInsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockTextProtocol, error: null }) }) });
const mockUpdateEq = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockTextProtocol, error: null }) }) });
const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq });

const mockFrom = vi.fn().mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('useProtocols', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrder.mockResolvedValue({ data: allMockProtocols, error: null });
  });

  // --- Unit Tests ---

  describe('fetchProtocols', () => {
    it('fetches protocols on mount', async () => {
      const { result } = renderHook(() => useProtocols());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFrom).toHaveBeenCalledWith('protocols');
      expect(result.current.protocols).toEqual(allMockProtocols);
      expect(result.current.protocols).toHaveLength(4);
    });

    it('sets error on fetch failure', async () => {
      mockOrder.mockResolvedValueOnce({ data: null, error: new Error('DB error') });

      const { result } = renderHook(() => useProtocols());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('DB error');
      expect(result.current.protocols).toEqual([]);
    });

    it('returns protocols with all content types', async () => {
      const { result } = renderHook(() => useProtocols());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const textProtocols = result.current.protocols.filter(p => p.content_type === 'text');
      const imageProtocols = result.current.protocols.filter(p => p.content_type === 'image');
      const fileProtocols = result.current.protocols.filter(p => p.content_type === 'file');

      expect(textProtocols).toHaveLength(2);
      expect(imageProtocols).toHaveLength(1);
      expect(fileProtocols).toHaveLength(1);
    });
  });

  describe('addProtocol', () => {
    it('adds a text protocol', async () => {
      const { result } = renderHook(() => useProtocols());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newProtocol = {
        name: 'New Protocol',
        category: 'Test',
        dosage: '10mg',
        frequency: 'Daily',
        duration: '4 weeks',
        notes: ['Note 1'],
        storage: 'Room temp',
        sort_order: 5,
        active: true,
        content_type: 'text' as const,
        file_url: null,
      };

      const addResult = await result.current.addProtocol(newProtocol);

      expect(addResult.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('protocols');
      expect(mockInsert).toHaveBeenCalledWith(newProtocol);
    });

    it('adds an image protocol with file_url', async () => {
      const { result } = renderHook(() => useProtocols());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const imageProtocol = {
        name: 'Image Protocol',
        category: 'Skin',
        dosage: '',
        frequency: '',
        duration: '',
        notes: [],
        storage: '',
        sort_order: 6,
        active: true,
        content_type: 'image' as const,
        file_url: 'https://test.supabase.co/storage/v1/object/public/protocol-files/test.png',
      };

      const addResult = await result.current.addProtocol(imageProtocol);

      expect(addResult.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(imageProtocol);
    });

    it('adds a file protocol with file_url', async () => {
      const { result } = renderHook(() => useProtocols());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const fileProtocol = {
        name: 'File Protocol',
        category: 'Recovery',
        dosage: '',
        frequency: '',
        duration: '',
        notes: [],
        storage: '',
        sort_order: 7,
        active: true,
        content_type: 'file' as const,
        file_url: 'https://test.supabase.co/storage/v1/object/public/protocol-files/doc.pdf',
      };

      const addResult = await result.current.addProtocol(fileProtocol);

      expect(addResult.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(fileProtocol);
    });

    it('returns error on add failure', async () => {
      mockInsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
        }),
      });

      const { result } = renderHook(() => useProtocols());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const addResult = await result.current.addProtocol({
        name: 'Fail', category: 'Test', dosage: '', frequency: '', duration: '',
        notes: [], storage: '', sort_order: 1, active: true, content_type: 'text', file_url: null,
      });

      expect(addResult.success).toBe(false);
      expect(addResult.error).toBe('Insert failed');
    });
  });

  describe('updateProtocol', () => {
    it('updates a protocol content_type from text to image', async () => {
      const { result } = renderHook(() => useProtocols());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.updateProtocol('proto-1', {
        content_type: 'image',
        file_url: 'https://test.supabase.co/storage/v1/object/public/protocol-files/new.png',
      });

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        content_type: 'image',
        file_url: 'https://test.supabase.co/storage/v1/object/public/protocol-files/new.png',
      }));
      expect(mockUpdateEq).toHaveBeenCalledWith('id', 'proto-1');
    });
  });

  describe('deleteProtocol', () => {
    it('deletes a protocol', async () => {
      const { result } = renderHook(() => useProtocols());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const deleteResult = await result.current.deleteProtocol('proto-1');

      expect(deleteResult.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('protocols');
      expect(mockDeleteEq).toHaveBeenCalledWith('id', 'proto-1');
    });
  });

  describe('toggleActive', () => {
    it('toggles protocol active state', async () => {
      const { result } = renderHook(() => useProtocols());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.toggleActive('proto-1', false);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
    });
  });

  // --- Protocol Interface Tests ---

  describe('Protocol interface', () => {
    it('text protocol has required text fields', () => {
      const proto = allMockProtocols.find(p => p.content_type === 'text' && p.active);
      expect(proto).toBeDefined();
      expect(proto!.dosage).toBeTruthy();
      expect(proto!.frequency).toBeTruthy();
      expect(proto!.duration).toBeTruthy();
      expect(proto!.file_url).toBeNull();
    });

    it('image protocol has file_url and content_type image', () => {
      const proto = allMockProtocols.find(p => p.content_type === 'image');
      expect(proto).toBeDefined();
      expect(proto!.file_url).toBeTruthy();
      expect(proto!.file_url).toContain('protocol-files');
    });

    it('file protocol has file_url and content_type file', () => {
      const proto = allMockProtocols.find(p => p.content_type === 'file');
      expect(proto).toBeDefined();
      expect(proto!.file_url).toBeTruthy();
      expect(proto!.file_url).toContain('.pdf');
    });
  });
});
