export type AppMode = 'local' | 'development' | 'mainnet';

export const VALID_MODES: AppMode[] = ['local', 'development', 'mainnet'];

/**
 * Returns the app mode from URL (?mode=local|development|mainnet).
 * Use when resolving the effective mode at app load (e.g. Redux initial state).
 */
export function getModeFromUrl(): AppMode {
  if (typeof window === 'undefined') return 'mainnet';
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode')?.toLowerCase().trim();
  if (mode && VALID_MODES.includes(mode as AppMode)) return mode as AppMode;
  return 'mainnet';
}

/**
 * Sync mode to localStorage: store for local/development, clear for mainnet.
 * Called once after store creation so the popup is hidden when URL is mainnet.
 */
export function persistModeFromUrl(mode: AppMode): void {
  if (typeof window === 'undefined') return;
  try {
    const key = 'gethuecoin_mode';
    if (mode === 'mainnet') {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, mode);
    }
  } catch {
    // ignore storage errors
  }
}
