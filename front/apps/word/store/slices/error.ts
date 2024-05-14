import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { snackbarColors } from '../../constants/Colors';

const initialState: ErrorState = {
  isErrorTriggered: false,
  message: '',
  color: snackbarColors.error,
};

export const error = createSlice({
  name: 'error',
  initialState,
  reducers: {
    reset: () => initialState,
    update: (_, action: PayloadAction<Partial<ErrorState>>) => ({
      isErrorTriggered: true,
      message: action.payload.message!,
      color: action.payload.color || snackbarColors.error,
    }),
  },
});

export default error.reducer;
