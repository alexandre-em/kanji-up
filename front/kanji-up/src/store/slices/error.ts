import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ErrorState = {
  isErrorTriggered: false,
  message: '',
};

export const error = createSlice({
  name: 'error',
  initialState,
  reducers: {
    reset: () => initialState,
    update: (state, action: PayloadAction<string>) => ({ isErrorTriggered: true, message: action.payload }),
  },
});

export default error.reducer;
