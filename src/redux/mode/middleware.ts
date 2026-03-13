import type { Middleware } from '@reduxjs/toolkit';
import { clearAppMode, setAppMode } from './redux';

const MODE_STORAGE_KEY = 'gethuecoin_mode';

function persistMode(mode: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (mode === 'mainnet') {
      localStorage.removeItem(MODE_STORAGE_KEY);
    } else {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    }
  } catch {
    // ignore storage errors
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const modeMiddleware: Middleware = (_store) => (next) => (action) => {
  const result = next(action);
  if (setAppMode.match(action)) {
    persistMode(action.payload);
  }
  if (clearAppMode.match(action)) {
    persistMode('mainnet');
  }
  return result;
};
