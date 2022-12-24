import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: SettingValuesType = {
  username: 'user',
  accessToken: null,
  flashcardNumber: 30,
  evaluationCardNumber: 70,
  evaluationTime: 60,
};

const initialize = () => {
  return initialState;
};

const update = (state: SettingValuesType, action: PayloadAction<Partial<SettingValuesType>>) => {
  const updatedState = action.payload;

  return { ...state, ...updatedState };
}

export const settings = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    initialize,
    update,
  },
});

export default settings.reducer;
