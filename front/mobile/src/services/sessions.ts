import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export default class SessionsService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this._instance = axios.create({
        baseURL: `${baseUrl}/sessions`,
        headers: { 'Access-Control-Allow-Origin': '*' },
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
