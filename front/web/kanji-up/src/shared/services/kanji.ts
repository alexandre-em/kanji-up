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

    return this._instance.get(`?page=${page}&limit=${limit}&grade=${grade}`, options);
  }

  getOne({ id = '' }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Kanji instance not ready...');
    if (id === '') throw new Error('Kanji Id is empty');

    return this._instance.get(`/detail/${id}`, options);
  }

  search({ page = 0, limit = 10, query = '' }, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Kanji instance not ready...');

    if (query === '') {
      throw new Error('Please, insert a search query');
    }
    return this._instance.get(`/search?query=${query}&page=${page}&limit=${limit}`, options);
  }

  createKanji(kanjiId: string, radicalId: string, referenceId: string, examples = [], options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Kanji instance not ready...');
    if (!kanjiId || !radicalId || !referenceId) throw new Error('Kanji cannot be created. Field missing');

    const body = {
      kanji: kanjiId,
      radical: radicalId,
      reference: referenceId,
      examples,
    };

    return this._instance.post('/', body, options);
  }

  deleteKanji(kanjiId: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Kanji instance not ready...');
    if (!kanjiId) throw new Error('Kanji id not valid');

    return this._instance.delete(`/${kanjiId}`, options);
  }
}
