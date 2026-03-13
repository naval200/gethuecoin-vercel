import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getModeFromUrl } from '../../lib/mode';

export type AppMode = import('../../lib/mode').AppMode;

const initialState: { mode: AppMode } = {
  mode: getModeFromUrl(),
};

const modeSlice = createSlice({
  name: 'mode',
  initialState,
  reducers: {
    setAppMode: (state, action: PayloadAction<AppMode>) => {
      state.mode = action.payload;
    },
    clearAppMode: (state) => {
      state.mode = 'mainnet';
    },
  },
});

export const { setAppMode, clearAppMode } = modeSlice.actions;
export const modeReducer = modeSlice.reducer;
