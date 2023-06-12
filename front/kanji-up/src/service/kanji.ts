import axios, { AxiosRequestConfig } from 'axios';

// const KANJI_BASE_URL = 'http://localhost:5000';
const KANJI_BASE_URL = 'https://kanjiup-api.alexandre-em.fr';

export default class KanjiService {
  private baseUrl;

  constructor() {
    this.baseUrl = axios.create({ baseURL: `${KANJI_BASE_URL}/kanjis`, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  getKanjis({ page = 0, limit = 10, grade = '1' }, options?: AxiosRequestConfig) {
    return this.baseUrl.get(`?page=${page}&limit=${limit}&grade=${grade}`, options);
  }

  getKanjiDetail({ id = '' }, options?: AxiosRequestConfig) {
    if (id === '') {
      throw new Error('Kanji Id is empty');
    }
    return this.baseUrl.get(`/detail/${id}`, options);
  }

  searchKanjis({ page = 0, limit = 10, query = '' }, options?: AxiosRequestConfig) {
    if (query === '') {
      throw new Error('Please, insert a search query');
    }
    return this.baseUrl.get(`/search?query=${query}&page=${page}&limit=${limit}`, options);
  }
}
