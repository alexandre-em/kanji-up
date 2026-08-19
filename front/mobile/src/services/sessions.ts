import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { API_TIMEOUT_MS } from '../constants/network';

export default class SessionsService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this._instance = axios.create({
        baseURL: `${baseUrl}/sessions`,
        headers: { 'Access-Control-Allow-Origin': '*' },
        timeout: API_TIMEOUT_MS,
      });
    }
  }

  create(payload: { userId: string; type: SessionKind; questions: SessionType['questions'] }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Sessions instance not ready...');

    return this._instance.post<SessionType>('/', payload, options);
  }

  findActive(userId: string, type: SessionKind, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Sessions instance not ready...');

    return this._instance.get<SessionType | null>('/active', { ...options, params: { userId, type } });
  }

  findByUser(userId: string, type: SessionKind, page = 1, limit = 20, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Sessions instance not ready...');

    return this._instance.get<SessionType[]>(`/user/${userId}`, { ...options, params: { type, page, limit } });
  }

  updateQuestion(sessionId: string, question: SessionType['questions'][number], options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Sessions instance not ready...');

    return this._instance.patch(`/${sessionId}/question`, { question }, options);
  }

  finish(sessionId: string, score: number, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Sessions instance not ready...');

    return this._instance.patch(`/${sessionId}/finish`, { score }, options);
  }

  abandon(sessionId: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Sessions instance not ready...');

    return this._instance.patch(`/${sessionId}/abandon`, undefined, options);
  }
}
