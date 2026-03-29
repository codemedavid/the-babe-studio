import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock import.meta.env
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('VITE_POSTHOG_KEY', 'test-posthog-key');
