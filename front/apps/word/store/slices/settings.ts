import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: SettingValuesType = {
  flashcardNumber: 30,
  evaluationCardNumber: 70,
  evaluationTime: 60,
  useLocalModel: false,
};

const initialize = () => initialState;

const update = (state: SettingValuesType, action: PayloadAction<Partial<SettingValuesType>>) => {
  const updatedState: SettingValuesType = {
    ...state,
    ...action.payload,
  };

  return updatedState;
};

export const settings = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    initialize,
    update,
  },
});

export default settings.reducer;
