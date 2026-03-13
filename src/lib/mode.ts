export type AppMode = 'local' | 'development' | 'mainnet';

export const VALID_MODES: AppMode[] = ['local', 'development', 'mainnet'];

const MODE_STORAGE_KEY = 'gethuecoin_mode';

function getModeFromUrl(): AppMode {
  if (typeof window === 'undefined') return 'mainnet';
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode')?.toLowerCase().trim();
  if (mode && VALID_MODES.includes(mode as AppMode)) return mode as AppMode;
  return 'mainnet';
}

/**
 * Sync mode to localStorage: store for local/development, clear for mainnet
 * so the popup is hidden when URL is mainnet.
 */
function persistModeFromUrl(mode: AppMode): void {
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

/**
 * Returns the app mode from URL, and persists it to localStorage when local or development.
 * Use this when resolving the effective mode at app load.
 */
export function getAppMode(): AppMode {
  const mode = getModeFromUrl();
  persistModeFromUrl(mode);
  return mode;
}

/**
 * Returns the stored mode (local or development) for display purposes, e.g. mode indicator.
 * Returns null when mainnet or not set.
 */
export function getStoredMode(): 'local' | 'development' | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(MODE_STORAGE_KEY);
    if (v === 'local' || v === 'development') return v;
    return null;
  } catch {
    return null;
  }
}

/**
 * Sets the mode in localStorage. Use for UI (e.g. dropdown).
 * Mainnet: removes the key. Local/development: stores the value.
 */
export function setStoredMode(mode: AppMode): void {
  if (typeof window === 'undefined') return;
  try {
    if (mode === 'mainnet') {
      localStorage.removeItem(MODE_STORAGE_KEY);
    } else {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    }
  } catch {
    // ignore
  }
}

/**
 * Clears the mode from localStorage. Call on logout.
 */
export function clearModeInStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(MODE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
