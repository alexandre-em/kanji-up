import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export default class RecognitionService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl: string, accessToken: string) {
    this._instance = axios.create({
      baseURL: `${baseUrl}/recognitions`,
      headers: { 'Access-Control-Allow-Origin': '*', Authorization: `Bearer ${accessToken}` },
    });
  }

  health(options?: AxiosRequestConfig): Promise<AxiosResponse<string>> {
    return this._instance!.get('/health', options);
  }

  post(kanji: string, image: Blob, options?: AxiosRequestConfig): Promise<AxiosResponse<PredictionType[]>> {
    if (!this._instance) throw new Error('Recognition instance not ready...');
    if (!image) throw new Error('Image is null');

    const file = new File([image], `${kanji};${Date.now().toString()}.jpeg`);
    const formData = new FormData();
    formData.append('file', file);

    return this._instance.post(`/${kanji}`, formData, options);
  }
}
