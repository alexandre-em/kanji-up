import axios, {AxiosRequestConfig} from 'axios';

const KANJI_BASE_URL = 'https://kanjiup-api.alexandre-em.fr';

export default class kanjiService {
  private baseUrl;

  constructor() {
    this.baseUrl = axios.create({ baseURL: `${KANJI_BASE_URL}/kanjis`, headers: { 'Access-Control-Allow-Origin': '*' } });
  };

  getKanjis({ page=1, limit=10 }, options?: AxiosRequestConfig) {
    return this.baseUrl.get(`?page=${page}&limit=${limit}`, options);
  };

  searchKanjis({ page=1, limit=10, query='' }, options?: AxiosRequestConfig) {
    if (query === '') { throw new Error('Please, insert a search query'); }
    return this.baseUrl.get(`/search?query=${query}&page=${page}&limit=${limit}`, options);
  };
};
