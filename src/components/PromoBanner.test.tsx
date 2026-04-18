import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromoBanner from './PromoBanner';

// Mock posthog
const mockCapture = vi.fn();
vi.mock('../lib/posthog', () => ({
  default: { capture: (...args: unknown[]) => mockCapture(...args) },
}));

// Mock supabase - use lazy arrow to avoid hoisting issue
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      upsert: (...args: unknown[]) => mockUpsert(...args),
    }),
  },
}));

describe('PromoBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUpsert.mockResolvedValue({ error: null });
  });

  // --- Visibility ---

  describe('visibility', () => {
    it('shows banner when not previously dismissed', () => {
      render(<PromoBanner />);
      const elements = screen.getAllByText(/exclusive promos/i);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('hides banner when previously dismissed via localStorage', () => {
      localStorage.setItem('tbs_promo_banner_dismissed', 'true');
      render(<PromoBanner />);
      expect(screen.queryAllByText(/exclusive promos/i)).toHaveLength(0);
    });

    it('hides banner and saves to localStorage when dismiss button clicked', async () => {
      render(<PromoBanner />);
      expect(screen.getAllByText(/exclusive promos/i).length).toBeGreaterThanOrEqual(1);

      await userEvent.click(screen.getByLabelText('Dismiss banner'));

      expect(screen.queryAllByText(/exclusive promos/i)).toHaveLength(0);
      expect(localStorage.getItem('tbs_promo_banner_dismissed')).toBe('true');
    });

    it('tracks dismiss event via posthog', async () => {
      render(<PromoBanner />);

      await userEvent.click(screen.getByLabelText('Dismiss banner'));

      expect(mockCapture).toHaveBeenCalledWith('tbs_promo_banner_dismissed');
    });

    it('tracks view event on mount', () => {
      render(<PromoBanner />);
      expect(mockCapture).toHaveBeenCalledWith('tbs_promo_banner_viewed');
    });
  });

  // --- Email Form ---

  describe('email subscription form', () => {
    it('renders email input and Join button', () => {
      render(<PromoBanner />);
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByText('Join')).toBeInTheDocument();
    });

    it('does not submit when email is empty', async () => {
      render(<PromoBanner />);

      await userEvent.click(screen.getByText('Join'));

      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('shows validation error for invalid email', async () => {
      render(<PromoBanner />);

      // Use email that passes HTML5 type="email" validation but fails custom regex (no dot after @)
      await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'test@invalid');
      await userEvent.click(screen.getByText('Join'));

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('clears validation error when typing', async () => {
      render(<PromoBanner />);

      await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'test@invalid');
      await userEvent.click(screen.getByText('Join'));
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();

      await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'x');
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });

    it('submits valid email and shows success message', async () => {
      render(<PromoBanner />);

      await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com');
      await userEvent.click(screen.getByText('Join'));

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          { email: 'user@example.com', source: 'tbs_promo_banner' },
          { onConflict: 'email', ignoreDuplicates: true },
        );
      });

      expect(screen.getByText(/You're in!/)).toBeInTheDocument();
    });

    it('trims whitespace from email before submitting', async () => {
      render(<PromoBanner />);

      await userEvent.type(screen.getByPlaceholderText('Enter your email'), '  user@example.com  ');
      await userEvent.click(screen.getByText('Join'));

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          { email: 'user@example.com', source: 'tbs_promo_banner' },
          { onConflict: 'email', ignoreDuplicates: true },
        );
      });
    });

    it('shows "Joining..." while submitting', async () => {
      let resolveInsert!: (value: any) => void;
      mockUpsert.mockReturnValueOnce(new Promise(r => { resolveInsert = r; }));

      render(<PromoBanner />);

      await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'user@example.com');
      await userEvent.click(screen.getByText('Join'));

      expect(screen.getByText('Joining...')).toBeInTheDocument();

      resolveInsert({ error: null });
      await waitFor(() => {
        expect(screen.getByText(/You're in!/)).toBeInTheDocument();
      });
    });
  });

  // --- Duplicate & Error Handling ---

  describe('error handling', () => {
    it('handles duplicate email silently via upsert', async () => {
      mockUpsert.mockResolvedValueOnce({ error: null });

      render(<PromoBanner />);

      await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'existing@test.com');
      await userEvent.click(screen.getByText('Join'));

      await waitFor(() => {
        expect(screen.getByText(/You're in!/)).toBeInTheDocument();
      });
    });

    it('shows error for non-duplicate DB errors', async () => {
      mockUpsert.mockResolvedValueOnce({ error: { code: '500', message: 'Server error' } });

      render(<PromoBanner />);

      await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'user@test.com');
      await userEvent.click(screen.getByText('Join'));

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });

    it('shows error when insert throws an exception', async () => {
      mockUpsert.mockRejectedValueOnce(new Error('Network failure'));

      render(<PromoBanner />);

      await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'user@test.com');
      await userEvent.click(screen.getByText('Join'));

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });
  });
});
