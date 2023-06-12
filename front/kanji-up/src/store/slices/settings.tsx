import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import jwtDecode from "jwt-decode";

const initialState: SettingValuesType = {
  username: "user",
  accessToken: null,
  flashcardNumber: 30,
  evaluationCardNumber: 70,
  evaluationTime: 60,
};

const initialize = () => {
  return initialState;
};

const update = (
  state: SettingValuesType,
  action: PayloadAction<Partial<SettingValuesType>>
) => {
  const decodedToken: DecodedToken = jwtDecode(
    action.payload.accessToken as string
  );
  const updatedState: SettingValuesType = {
    ...action.payload,
    username: decodedToken.name,
  };

  return { ...state, ...updatedState };
};

export const settings = createSlice({
  name: "settings",
  initialState,
  reducers: {
    initialize,
    update,
  },
});

export default settings.reducer;
