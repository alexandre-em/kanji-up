import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export type CompleteMissionTaskResponse = {
  mission: DailyMissionType;
  rewardGranted: boolean;
  creditsGranted: number;
};

export default class MissionsService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this._instance = axios.create({
        baseURL: `${baseUrl}/missions`,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  getToday(userId: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Missions instance not ready...');

    return this._instance.get<DailyMissionType>('/today', { ...options, params: { userId } });
  }

  complete(userId: string, task: MissionTaskKey, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Missions instance not ready...');

    return this._instance.patch<CompleteMissionTaskResponse>('/complete', { userId, task }, options);
  }
}
