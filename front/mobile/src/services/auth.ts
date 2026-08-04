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

  recoverAccount(macAddress: string, idToken: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance.patch<{ migrated: boolean }>(`/${macAddress}/recover`, { idToken }, options);
  }

  earnCredits(macAddress: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance?.patch(`/${macAddress}/credits/earn`, undefined, options as AxiosRequestConfig);
  }

  unlockContent(
    macAddress: string,
    payload: { scope: 'kanji' | 'tier'; tier: string; kanjiId?: string },
    options?: AxiosRequestConfig,
  ) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance?.patch(`/${macAddress}/unlock`, payload, options as AxiosRequestConfig);
  }

  updateKanjiProgression(macAddress: string, payload: KanjiProgressionType, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Auth instance not ready...');

    return this._instance?.patch(`/${macAddress}/kanji-progression`, payload, options as AxiosRequestConfig);
  }
}
