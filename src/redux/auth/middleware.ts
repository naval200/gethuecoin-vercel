import type { Middleware } from '@reduxjs/toolkit';

import { signinUser } from '../../api/auth';
import { getFirebaseConfig } from '../../config/appConfig';
import { signInWithApple, signInWithGoogle, signOutFirebaseSession } from '../../lib/firebaseAuth';
import { clearAuthSource, clearAuthToken, setAuthSource, setAuthToken } from '../../lib/storage';
import { clearAppMode } from '../mode/redux';
import {
  clearAuth,
  exchangeTokenRequested,
  loginRequested,
  logoutRequested,
  setAuthError,
  setAuthLoading,
  setAuthTokenAndProvider,
} from './redux';

function getFriendlyAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('popup')) {
    return 'Popup was blocked or closed. Please retry and allow popups.';
  }
  if (msg.includes('auth/unauthorized-domain')) {
    return 'This domain is not allowed for sign-in. Add it in Firebase Console -> Authentication -> Settings -> Authorized domains.';
  }
  return 'Could not complete login. Please try Google or Apple login again.';
}

export const authMiddleware: Middleware = ({ dispatch, getState }) => (next) => async (action) => {
  const firebaseConfig = () => getFirebaseConfig(getState().mode.mode);

  if (loginRequested.match(action)) {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(''));
    try {
      const firebaseToken =
        action.payload === 'google'
          ? await signInWithGoogle(firebaseConfig())
          : await signInWithApple(firebaseConfig());
      const authToken = await signinUser(firebaseToken);
      dispatch(setAuthTokenAndProvider({ token: authToken, provider: action.payload }));
    } catch (error) {
      dispatch(setAuthError(getFriendlyAuthError(error)));
    }
  }

  if (exchangeTokenRequested.match(action)) {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(''));
    try {
      const authToken = await signinUser(action.payload);
      dispatch(setAuthTokenAndProvider({ token: authToken, provider: 'app' }));
    } catch (error) {
      dispatch(setAuthError(getFriendlyAuthError(error)));
    }
  }

  if (logoutRequested.match(action)) {
    try {
      await signOutFirebaseSession(firebaseConfig());
    } catch {
      // Ignore provider-session signout failures and clear local app session anyway.
    }
    dispatch(clearAuth());
  }

  const result = next(action);

  if (setAuthTokenAndProvider.match(action)) {
    setAuthToken(action.payload.token);
    setAuthSource(action.payload.provider);
  }
  if (clearAuth.match(action)) {
    clearAuthToken();
    clearAuthSource();
    dispatch(clearAppMode());
  }

  return result;
};
