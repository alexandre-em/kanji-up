import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { API_TIMEOUT_MS } from '../constants/network';

export default class AuthService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this._instance = axios.create({
        baseURL: `${baseUrl}/users`,
        headers: { 'Access-Control-Allow-Origin': '*' },
        timeout: API_TIMEOUT_MS,
      });
    }
  }

  // Bootstrap only: the one lookup a client without a stored userId yet can make
  getByMacAddress(macAddress: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance.get<UserType>(`/mac-address/${macAddress}`, options);
  }

  get(userId: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance.get<UserType>(`/${userId}`, options);
  }

  create(payload: Pick<UserType, 'name' | 'macAddress'>, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance?.post('/', payload, options as AxiosRequestConfig);
  }

  recoverAccount(userId: string, idToken: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance.patch<{ userId: string; migrated: boolean }>(`/${userId}/recover`, { idToken }, options);
  }

  // Bootstrap only, like create() above: the client has no stored userId yet on a fresh device
  // signing in with Google directly rather than creating a plain named account.
  signInWithGoogle(payload: { idToken: string; macAddress: string }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance.post<{ userId: string }>('/sign-in-with-google', payload, options);
  }

  earnCredits(userId: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance?.patch(`/${userId}/credits/earn`, undefined, options as AxiosRequestConfig);
  }

  unlockContent(
    userId: string,
    payload: { scope: 'kanji' | 'tier'; tier: string; kanjiId?: string },
    options?: AxiosRequestConfig,
  ) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance?.patch(`/${userId}/unlock`, payload, options as AxiosRequestConfig);
  }

  updateKanjiProgression(userId: string, payload: KanjiProgressionType, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance?.patch(`/${userId}/kanji-progression`, payload, options as AxiosRequestConfig);
  }
}
