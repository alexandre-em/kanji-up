import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import jwtDecode from 'jwt-decode';
import { DecodedToken } from 'kanji-app-types';

const initialState: SettingValuesType = {
  username: 'user',
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

const logout = (state: SettingValuesType) => ({ ...state, username: 'user', });

export const settings = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    initialize,
    update,
    logout,
  },
});

export default settings.reducer;
