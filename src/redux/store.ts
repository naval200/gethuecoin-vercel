import { configureStore } from '@reduxjs/toolkit';

import { authMiddleware } from './auth/middleware';
import { authReducer } from './auth/redux';
import { modeMiddleware } from './mode/middleware';
import { modeReducer } from './mode/redux';
import { persistModeFromUrl } from '../lib/mode';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    mode: modeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authMiddleware, modeMiddleware),
});

// Persist initial mode to localStorage so popup state is correct on reload
persistModeFromUrl(store.getState().mode.mode);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
