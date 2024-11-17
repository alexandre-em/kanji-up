import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export default class KanjiService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl: string, accessToken: string) {
    this._instance = axios.create({
      baseURL: `${baseUrl}/kanjis`,
      headers: { 'Access-Control-Allow-Origin': '*', Authorization: `Bearer ${accessToken}` },
    });
  }

  getAll({ page = 0, limit = 10, grade = '1' }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Kanji instance not ready...');

    return this._instance.get<Pagination<KanjiType>>(`?page=${page}&limit=${limit}&grade=${grade}`, options);
  }

  getOne({ id = '' }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Kanji instance not ready...');
    if (id === '') throw new Error('Kanji Id is empty');

    return this._instance.get<KanjiType>(`/detail/${id}`, options);
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
