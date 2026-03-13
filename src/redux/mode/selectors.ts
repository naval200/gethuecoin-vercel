import type { RootState } from '../store';

export const selectAppMode = (state: RootState) => state.mode.mode;

/** For display: non-mainnet mode or null (so mainnet hides the indicator). */
export const selectStoredMode = (state: RootState): 'local' | 'development' | null => {
  const mode = state.mode.mode;
  return mode === 'local' || mode === 'development' ? mode : null;
};
