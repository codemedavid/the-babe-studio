import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromoPopup from './PromoPopup';

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

// Helper: render popup and advance fake timers so it becomes visible, then switch to real timers
function renderAndShow() {
  vi.useFakeTimers();
  const result = render(<PromoPopup />);
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  vi.useRealTimers();
  return result;
}

describe('PromoPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUpsert.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Delayed Visibility ---

  describe('visibility', () => {
    it('does not show immediately on render', () => {
      vi.useFakeTimers();
      render(<PromoPopup />);

      expect(screen.queryByText("Don't Miss Out!")).not.toBeInTheDocument();
      vi.useRealTimers();
    });

    it('shows after 2 second delay', () => {
      vi.useFakeTimers();
      render(<PromoPopup />);

      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(screen.queryByText("Don't Miss Out!")).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByText("Don't Miss Out!")).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('does not show if previously shown (localStorage)', () => {
      localStorage.setItem('tbs_promo_popup_shown', 'true');
      vi.useFakeTimers();
      render(<PromoPopup />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByText("Don't Miss Out!")).not.toBeInTheDocument();
      vi.useRealTimers();
    });

    it('sets localStorage when shown', () => {
      vi.useFakeTimers();
      render(<PromoPopup />);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(localStorage.getItem('tbs_promo_popup_shown')).toBe('true');
      vi.useRealTimers();
    });

    it('tracks view event via posthog', () => {
      vi.useFakeTimers();
      render(<PromoPopup />);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockCapture).toHaveBeenCalledWith('tbs_promo_popup_viewed');
      vi.useRealTimers();
    });
  });

  // --- Close Behavior ---

  describe('close behavior', () => {
    it('closes when X button is clicked', async () => {
      renderAndShow();

      expect(screen.getByText("Don't Miss Out!")).toBeInTheDocument();
      await userEvent.click(screen.getByLabelText('Close popup'));
      expect(screen.queryByText("Don't Miss Out!")).not.toBeInTheDocument();
    });

    it('closes when "No thanks" is clicked', async () => {
      renderAndShow();

      await userEvent.click(screen.getByText('No thanks, maybe later'));
      expect(screen.queryByText("Don't Miss Out!")).not.toBeInTheDocument();
    });

    it('tracks dismiss event on close', async () => {
      renderAndShow();

      await userEvent.click(screen.getByLabelText('Close popup'));
      expect(mockCapture).toHaveBeenCalledWith('tbs_promo_popup_dismissed');
    });
  });

  // --- Email Subscription ---

  describe('email subscription', () => {
    it('renders email input and submit button', () => {
      renderAndShow();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByText('Get Exclusive Promos')).toBeInTheDocument();
    });

    it('does not submit when email is empty', async () => {
      renderAndShow();

      await userEvent.click(screen.getByText('Get Exclusive Promos'));
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('shows validation error for invalid email', async () => {
      renderAndShow();

      // Use email that passes HTML5 type="email" validation but fails custom regex (no dot after @)
      await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'test@invalid');
      await userEvent.click(screen.getByText('Get Exclusive Promos'));

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('submits valid email and shows success', async () => {
      renderAndShow();

      await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');
      await userEvent.click(screen.getByText('Get Exclusive Promos'));

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          { email: 'user@example.com', source: 'tbs_promo_popup' },
          { onConflict: 'email', ignoreDuplicates: true },
        );
      });

      expect(screen.getByText("You're on the list!")).toBeInTheDocument();
      expect(screen.getByText('Start Shopping')).toBeInTheDocument();
    });

    it('saves submitted state to localStorage', async () => {
      renderAndShow();

      await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');
      await userEvent.click(screen.getByText('Get Exclusive Promos'));

      await waitFor(() => {
        expect(localStorage.getItem('tbs_promo_popup_submitted')).toBe('true');
      });
    });

    it('shows "Subscribing..." while submitting', async () => {
      let resolveInsert!: (value: any) => void;
      mockUpsert.mockReturnValueOnce(new Promise(r => { resolveInsert = r; }));

      renderAndShow();

      await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');
      await userEvent.click(screen.getByText('Get Exclusive Promos'));

      expect(screen.getByText('Subscribing...')).toBeInTheDocument();

      resolveInsert({ error: null });
      await waitFor(() => {
        expect(screen.getByText("You're on the list!")).toBeInTheDocument();
      });
    });
  });

  // --- Error Handling ---

  describe('error handling', () => {
    it('handles duplicate email silently via upsert', async () => {
      mockUpsert.mockResolvedValueOnce({ error: null });
      renderAndShow();

      await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'existing@test.com');
      await userEvent.click(screen.getByText('Get Exclusive Promos'));

      await waitFor(() => {
        expect(screen.getByText("You're on the list!")).toBeInTheDocument();
      });
    });

    it('shows error for non-duplicate DB errors', async () => {
      mockUpsert.mockResolvedValueOnce({ error: { code: '500', message: 'fail' } });
      renderAndShow();

      await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'user@test.com');
      await userEvent.click(screen.getByText('Get Exclusive Promos'));

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });

    it('shows error when insert throws', async () => {
      mockUpsert.mockRejectedValueOnce(new Error('Network failure'));
      renderAndShow();

      await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'user@test.com');
      await userEvent.click(screen.getByText('Get Exclusive Promos'));

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });
  });
});
