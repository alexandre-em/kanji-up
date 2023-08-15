import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import jwtDecode from 'jwt-decode';
import { DecodedToken } from 'kanji-app-types';

const initialState: SettingValuesType = {
  username: 'user',
  accessToken: null,
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

  if (action.payload.accessToken) {
    const decodedToken: DecodedToken = jwtDecode(action.payload.accessToken as string);
    updatedState.username = decodedToken.name;
  }

  return updatedState;
};

const logout = (state: SettingValuesType) => ({ ...state, username: 'user', accessToken: null });

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
