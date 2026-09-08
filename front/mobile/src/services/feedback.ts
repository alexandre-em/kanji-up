import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { API_TIMEOUT_MS } from '../constants/network';

export default class FeedbackService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this._instance = axios.create({
        baseURL: `${baseUrl}/feedback`,
        headers: { 'Access-Control-Allow-Origin': '*' },
        timeout: API_TIMEOUT_MS,
      });
    }
  }

  create(payload: { userId: string; category: FeedbackCategoryType; message: string }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Feedback instance not ready...');

    return this._instance.post<FeedbackType>('/', payload, options);
  }
}
