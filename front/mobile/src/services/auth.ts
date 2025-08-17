import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export default class AuthService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this._instance = axios.create({
        baseURL: `${baseUrl}/users`,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  get(macAddress: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance.get<UserType>(`/mac-address/${macAddress}`, options);
  }

  create(payload: Pick<UserType, 'name' | 'macAddress'>, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance?.post('/', payload, options as AxiosRequestConfig);
  }

  link(payload: Pick<UserType, 'email' | 'picture' | 'providerId' | 'macAddress'>, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance?.patch(`/link/${payload.macAddress}`, payload, options as AxiosRequestConfig);
  }
}
