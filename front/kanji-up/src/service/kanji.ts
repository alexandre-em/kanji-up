import axios from 'axios';

// const KANJI_BASE_URL = 'http://localhost:5000';
const KANJI_BASE_URL = 'https://kanji-up-api.herokuapp.com';

export default class kanjiService {
  private baseUrl;

  constructor() {
    this.baseUrl = axios.create({ baseURL: `${KANJI_BASE_URL}/kanjis`, headers: { 'Access-Control-Allow-Origin': '*' } });
  };

  getKanjis({ page=0, limit=10, grade='1' }) {
    return this.baseUrl.get(`?page=${page}&limit=${limit}&grade=${grade}`);
  };

  getKanjiDetail({ id='' }) {
    if (id === '') { throw new Error('Kanji Id is empty'); }
    return this.baseUrl.get(`/detail/${id}`);
  };

  searchKanjis({ page=0, limit=10, query='' }) {
    if (query === '') { throw new Error('Please, insert a seqrch query'); }
    return this.baseUrl.get(`/search?query=${query}&page=${page}&limit=${limit}`);
  };
};

