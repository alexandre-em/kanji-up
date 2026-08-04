import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'store';

import { core } from '../../services/http';

type MissionsState = {
  today: DailyMissionType | null;
  status: RequestStatusType;
};

const initialState: MissionsState = {
  today: null,
  status: 'idle',
};

export const fetchTodayMissions = createAsyncThunk('missions/fetchToday', async (userId: string) => {
  const response = await core.missionsService!.getToday(userId);

  return response.data;
});

export const completeMissionTask = createAsyncThunk(
  'missions/completeTask',
  async (payload: { userId: string; task: MissionTaskKey }) => {
    const response = await core.missionsService!.complete(payload.userId, payload.task);

    return response.data;
  },
);

const missionsSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayMissions.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchTodayMissions.fulfilled, (state, action) => {
        state.today = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchTodayMissions.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(completeMissionTask.fulfilled, (state, action) => {
        state.today = action.payload.mission;
      });
  },
});

export default missionsSlice.reducer;

export const selectTodayMissions = (state: RootState) => state.missions.today;
export const selectMissionsStatus = (state: RootState) => state.missions.status;
