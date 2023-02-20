import axios, {AxiosRequestConfig} from 'axios';

const KANJI_BASE_URL = 'https://kanjiup1-alexandreemem.b4a.run';

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

  uploadData(kanji: string, image: Blob, options?: AxiosRequestConfig) {
    if (!image) { throw new Error('Image is null'); }

    const file = new File([image], `${kanji};${Date.now().toString()}.jpeg`);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('json', JSON.stringify({ kanji }));

    return this.baseUrl.post('/data', formData, options);
  }
};
