import type { RootState } from '../store';

export const selectAuthState = (state: RootState) => state.auth;
export const selectAuthProvider = (state: RootState) => state.auth.provider;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthIsLoading = (state: RootState) => state.auth.isLoading;
export const selectHasToken = (state: RootState) => state.auth.token.length > 0;
