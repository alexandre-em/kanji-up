import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export default class WordService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl: string, accessToken: string) {
    this._instance = axios.create({
      baseURL: `${baseUrl}/words`,
      headers: { 'Access-Control-Allow-Origin': '*', Authorization: `Bearer ${accessToken}` },
    });
  }

  getAll({ page = 1, limit = 10 }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Word instance not ready');

    return this._instance.get<Pagination<WordType>>(`?page=${page}&limit=${limit}`, options);
  }

  getOne({ id = '' }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Word instance not ready');
    if (id === '') throw new Error('Insert a word id');

    return this._instance.get<WordType>(`/${id}`, options);
  }

  search({ page = 0, limit = 10, query = '' }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Word instance not ready');

    if (query === '') {
      throw new Error('Insert a search query');
    }

    return this._instance.get<Pagination<WordType>>(`/search/word?query=${query}&page=${page}&limit=${limit}`, options);
  }
}
