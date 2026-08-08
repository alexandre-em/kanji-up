import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { API_TIMEOUT_MS } from '../constants/network';

type GetAllParams = {
  page?: number;
  limit?: number;
  grade?: string;
  jlpt?: string;
  advanced?: boolean;
};

export default class KanjiService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl: string) {
    this._instance = axios.create({
      baseURL: `${baseUrl}/kanjis`,
      // headers: { 'Access-Control-Allow-Origin': '*' },
      timeout: API_TIMEOUT_MS,
    });
  }

  getAll(
    { page = 0, limit = 10, grade = undefined, jlpt = undefined, advanced = undefined }: GetAllParams,
    options?: AxiosRequestConfig,
  ) {
    if (!this._instance) throw new Error('Kanji instance not ready...');

    return this._instance.get<Pagination<KanjiType>>(``, { ...options, params: { page, limit, grade, jlpt, advanced } });
  }

  getOne({ id = '' }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Kanji instance not ready...');
    if (id === '') throw new Error('Kanji Id is empty');

    return this._instance.get<KanjiType>(`/detail/${id}`, options);
  }

  getOneImage({ kanji = '' }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Kanji instance not ready...');
    if (kanji === '') throw new Error('Kanji Id is empty');

    return this._instance.get<string>(`/image/${kanji}`, options);
  }

  search({ page = 0, limit = 10, query = '' }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Kanji instance not ready...');

    if (query === '') {
      throw new Error('Please, insert a search query');
    }
    return this._instance.get<Pagination<KanjiType>>(`/search?query=${query}&page=${page}&limit=${limit}`, options);
  }

  getRandom(number: number, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Kanji instance not ready...');

    return this._instance.get<KanjiType[]>(`/random?number=${number}`, options);
  }
}
