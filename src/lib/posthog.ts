import posthog from 'posthog-js';

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY;

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
      person_profiles: 'identified_only',
    });
  } catch (err) {
    console.error('[PostHog] init() threw an error:', err);
  }
}

/**
 * Identify a user by email and set person properties.
 * PostHog uses these properties to send emails and target users.
 */
export function identifyUser(email: string, properties?: Record<string, any>) {
  if (!email) return;

  posthog.identify(email, {
    email,
    ...properties,
  });
}

/**
 * Reset the identified user (e.g. after checkout or session end).
 * Creates a new anonymous ID for the next visitor.
 */
export function resetUser() {
  posthog.reset();
}

export default posthog;
