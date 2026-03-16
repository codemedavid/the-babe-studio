import { vi } from 'vitest';
import { Protocol } from '../hooks/useProtocols';

// --- Mock Protocol Data ---

export const mockTextProtocol: Protocol = {
  id: 'proto-1',
  name: 'Tirzepatide',
  category: 'Weight Management',
  dosage: '2.5mg - 15mg',
  frequency: 'Once weekly',
  duration: '12-16 weeks',
  notes: ['Start low', 'Rotate injection sites'],
  storage: 'Refrigerate at 2-8°C',
  sort_order: 1,
  active: true,
  content_type: 'text',
  file_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockImageProtocol: Protocol = {
  id: 'proto-2',
  name: 'GHK-Cu Protocol',
  category: 'Skin & Anti-Aging',
  dosage: '',
  frequency: '',
  duration: '',
  notes: [],
  storage: '',
  sort_order: 2,
  active: true,
  content_type: 'image',
  file_url: 'https://test.supabase.co/storage/v1/object/public/protocol-files/ghk-protocol.png',
  created_at: '2025-01-02T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
};

export const mockFileProtocol: Protocol = {
  id: 'proto-3',
  name: 'BPC-157 Protocol',
  category: 'Recovery & Healing',
  dosage: '',
  frequency: '',
  duration: '',
  notes: [],
  storage: '',
  sort_order: 3,
  active: true,
  content_type: 'file',
  file_url: 'https://test.supabase.co/storage/v1/object/public/protocol-files/bpc-protocol.pdf',
  created_at: '2025-01-03T00:00:00Z',
  updated_at: '2025-01-03T00:00:00Z',
};

export const mockInactiveProtocol: Protocol = {
  id: 'proto-4',
  name: 'Hidden Protocol',
  category: 'Test',
  dosage: '100mg',
  frequency: 'Daily',
  duration: '4 weeks',
  notes: [],
  storage: '',
  sort_order: 4,
  active: false,
  content_type: 'text',
  file_url: null,
  created_at: '2025-01-04T00:00:00Z',
  updated_at: '2025-01-04T00:00:00Z',
};

export const allMockProtocols = [
  mockTextProtocol,
  mockImageProtocol,
  mockFileProtocol,
  mockInactiveProtocol,
];

// --- Supabase Mock ---

export const createMockSupabase = () => {
  const mockStorage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-file.png' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/protocol-files/test-file.png' } }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
      remove: vi.fn().mockResolvedValue({ error: null }),
    }),
  };

  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockTextProtocol, error: null }),
  };

  // Default select returns all protocols
  mockQuery.order.mockResolvedValue({ data: allMockProtocols, error: null });

  const mockFrom = vi.fn().mockReturnValue(mockQuery);

  return {
    supabase: { from: mockFrom, storage: mockStorage },
    mockQuery,
    mockStorage,
    mockFrom,
  };
};
