import axios, {AxiosRequestConfig} from 'axios';

const KANJI_BASE_URL = 'https://kanjiup-api.alexandre-em.fr';

export default class recognitionService {
  private baseUrl;

  constructor() {
    this.baseUrl = axios.create({ baseURL: `${KANJI_BASE_URL}/recognition`, headers: { 'Access-Control-Allow-Origin': '*' } });
  };

  getRecognitions({ page=1, limit=10, query='' }, options?: AxiosRequestConfig) {
    if (query === '') {
      return this.baseUrl.get(`/all?page=${page}&limit=${limit}`, options);
    }

    return this.baseUrl.get(`/all?page=${page}&limit=${limit}&query=${encodeURI(query)}`, options);
  };

  
  userValidation(isValid: boolean, recognitionId: string) {
    return this.baseUrl.patch(`/validation/${recognitionId}`, { is_valid: isValid });
  };
};
