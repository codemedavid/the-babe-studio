console.log('[Main] main.tsx loading...');

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PostHogProvider } from 'posthog-js/react';
import { initPostHog } from './lib/posthog';
import posthog from './lib/posthog';
import App from './App.tsx';
import './index.css';

console.log('[Main] Calling initPostHog()...');
initPostHog();
console.log('[Main] initPostHog() completed');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>
);
