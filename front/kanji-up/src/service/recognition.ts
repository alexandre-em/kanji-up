import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Constants from 'expo-constants';

export default class RecognitionService {
  private baseUrl;

  constructor() {
    this.baseUrl = axios.create({ baseURL: `${Constants?.expoConfig?.extra?.RECOGNITION_BASE_URL}/recognitions`, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  postRecognition(kanji: string, image: Blob, options?: AxiosRequestConfig): Promise<AxiosResponse<RecognitionType>> {
    if (!image) {
      throw new Error('Image is null');
    }

    const file = new File([image], `${kanji};${Date.now().toString()}.jpeg`);
    const formData = new FormData();
    formData.append('file', file);

    return this.baseUrl.post(`/${kanji}`, formData, options);
  }

  postRecognitionNative(kanji: string, imagePath: string, options?: AxiosRequestConfig): Promise<AxiosResponse<RecognitionType>> {
    if (!imagePath || imagePath === '') {
      throw new Error('Image is null');
    }

    const file = {
      uri: imagePath,
      name: `${kanji};${Date.now().toString()}.jpg`,
      type: 'image/jpeg',
    };
    const formData = new FormData();
    formData.append('file', file as any);

    return this.baseUrl.post(`${kanji}`, formData, options);
  }

  userValidation(isValid: boolean, recognitionId: string) {
    const body = { is_valid: isValid };

    return this.baseUrl.patch(`/validation/${recognitionId}`, body);
  }
}
