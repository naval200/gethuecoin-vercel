import { configureStore } from '@reduxjs/toolkit';

import { authMiddleware } from './auth/middleware';
import { authReducer } from './auth/redux';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
