import posthog from 'posthog-js';

export function initPostHog() {
  console.log('[PostHog] initPostHog() called');

  const key = import.meta.env.VITE_POSTHOG_KEY;
  console.log('[PostHog] Key present:', !!key, 'Key starts with:', key?.substring(0, 8));

  if (!key) {
    console.warn('[PostHog] VITE_POSTHOG_KEY is not set — events will not be captured.');
    return;
  }

  try {
    posthog.init(key, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      debug: import.meta.env.DEV,
      loaded: (ph) => {
        console.log('[PostHog] SDK loaded. Distinct ID:', ph.get_distinct_id());
        ph.capture('tbs_sdk_loaded', { source: 'init_loaded_callback' });
        console.log('[PostHog] Test event "tbs_sdk_loaded" sent');
      },
    });
    console.log('[PostHog] posthog.init() called successfully. __loaded:', posthog.__loaded);
  } catch (err) {
    console.error('[PostHog] init() threw an error:', err);
  }
}

// Expose for browser console debugging: type window.__posthog in console
if (typeof window !== 'undefined') {
  (window as any).__posthog = posthog;
}

export default posthog;
