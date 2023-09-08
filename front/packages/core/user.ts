import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { PredictionType, UpdatedDataResponse, User, UserScore } from 'kanji-app-types';

export default class UserService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl?: string, accessToken?: string) {
    if (baseUrl) {
      this._instance = axios.create({
        baseURL: `${baseUrl}/users`,
        headers: { 'Access-Control-Allow-Origin': '*', Authorization: `Bearer ${accessToken}` },
      });
    }
  }

  getProfile(options?: AxiosRequestConfig): Promise<AxiosResponse<User>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance?.get('/profile', options);
  }

  getProfileImage(user_id: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance?.get(`/profile/image/${user_id}`, options);
  }

  updateProfileImage(image: Blob, options?: AxiosRequestConfig): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');
    if (!image) throw new Error('Image is null');

    const file = new File([image], `image;${Date.now().toString()}.jpeg`);
    const formData = new FormData();
    formData.append('file', file);

    return this._instance.post(`/image`, formData, options);
  }

  updateProfileImageNative(imagePath: string, options?: AxiosRequestConfig): Promise<AxiosResponse<PredictionType[]>> {
    if (!this._instance) throw new Error('User instance not ready...');
    if (!imagePath || imagePath === '') throw new Error('Image is null');

    const file = {
      uri: imagePath,
      name: `image;${Date.now().toString()}.jpg`,
      type: 'image/jpeg',
    };
    const formData = new FormData();
    // eslint-disable-next-line
    formData.append('file', file as any);

    return this._instance.post(`/image`, formData, options);
  }

  updateUserScore(scores: UserScore, options?: AxiosRequestConfig): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');
    if (!scores || scores.total_score === undefined) throw new Error('Invalid score body');

    return this._instance.put('/score/kanji', scores, options);
  }
}
