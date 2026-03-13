import { createAction, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getAuthSource, getAuthToken } from '../../lib/storage';

export type AuthProvider = 'app' | 'google' | 'apple';
export type OAuthProvider = Exclude<AuthProvider, 'app'>;

export interface AuthState {
  token: string;
  provider: AuthProvider | '';
  isLoading: boolean;
  error: string;
}

const storedSource = getAuthSource();
const initialProvider: AuthProvider | '' =
  storedSource === 'app' || storedSource === 'google' || storedSource === 'apple' ? storedSource : '';

const initialState: AuthState = {
  token: getAuthToken(),
  provider: initialProvider,
  isLoading: false,
  error: '',
};

export const loginRequested = createAction<OAuthProvider>('auth/loginRequested');
export const exchangeTokenRequested = createAction<string>('auth/exchangeTokenRequested');
export const logoutRequested = createAction('auth/logoutRequested');

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthTokenAndProvider: (
      state,
      action: PayloadAction<{ token: string; provider: AuthProvider }>,
    ) => {
      state.token = action.payload.token;
      state.provider = action.payload.provider;
      state.error = '';
      state.isLoading = false;
    },
    clearAuth: (state) => {
      state.token = '';
      state.provider = '';
      state.error = '';
      state.isLoading = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAuthError: (state) => {
      state.error = '';
    },
  },
});

export const {
  setAuthTokenAndProvider,
  clearAuth,
  setAuthLoading,
  setAuthError,
  clearAuthError,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
