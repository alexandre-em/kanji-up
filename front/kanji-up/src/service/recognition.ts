import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

// const KANJI_BASE_URL = 'http://localhost:5000';
const KANJI_BASE_URL = 'https://kanjiup-api.alexandre-em.fr';

export default class kanjiService {
  private baseUrl;

  constructor() {
    this.baseUrl = axios.create({ baseURL: `${KANJI_BASE_URL}/recognition`, headers: { 'Access-Control-Allow-Origin': '*' } });
  };

  postRecognition(kanji: string, predictions: { confidence: number, prediction: string }[], image: Blob, options?: AxiosRequestConfig): Promise<AxiosResponse<RecognitionType>> {
    if (!image) { throw new Error('Image is null'); }

    const file = new File([image], `${kanji};${Date.now().toString()}.jpeg`);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('json', JSON.stringify({ kanji, predictions }));

    return this.baseUrl.post('', formData, options);
  };

  postRecognitionNative(kanji: string, predictions: { confidence: number, prediction: string }[], imagePath: string, options?: AxiosRequestConfig): Promise<AxiosResponse<RecognitionType>> {
    if (!imagePath || imagePath === '') { throw new Error('Image is null'); }

    const file = {
      uri: imagePath,
      name: `${kanji};${Date.now().toString()}.jpg`,
      type: 'image/jpeg',
    }
    const formData = new FormData();
    formData.append('image', file as any);
    formData.append('json', JSON.stringify({ kanji, predictions }));

    return this.baseUrl.post('', formData, options);
  };

  userValidation(isValid: boolean, recognitionId: string) {
    return this.baseUrl.patch(`/validation/${recognitionId}`, { is_valid: isValid });
  }
};

