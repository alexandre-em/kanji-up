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

  getUserById(userId: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance?.get(`/${userId}`, options);
  }

  updateProfile(body: Partial<User>, options?: AxiosRequestConfig): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');

    if (!body.password || body.password === '') delete body.password;

    return this._instance.patch('/info', body, options);
  }

  getProfileImage(user_id: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance?.get(`/profile/image/${user_id}`, options);
  }

  updateProfileImage(
    image: Blob,
    contentType: string,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');
    if (!image) throw new Error('Image is null');

    const ext = contentType.split('/')[1];

    const file = new File([image], `image;${Date.now().toString()}.${ext}`, { type: contentType });
    const formData = new FormData();
    formData.append('file', file);

    return this._instance.put(`/image`, formData, options);
  }

  updateProfileImageNative(
    imagePath: string,
    filename: string,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<PredictionType[]>> {
    if (!this._instance) throw new Error('User instance not ready...');
    if (!imagePath || imagePath === '') throw new Error('Image is null');

    const nameSplit = imagePath.split('.');
    const ext = nameSplit[nameSplit.length - 1];

    const file = {
      uri: imagePath,
      name: filename,
      type: `image/${ext}`,
    };
    const formData = new FormData();
    // eslint-disable-next-line
    formData.append('file', file as any);

    return this._instance.put(`/image`, formData, options);
  }

  updateUserScore(scores: UserScore, options?: AxiosRequestConfig): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');
    if (!scores || scores.total_score === undefined) throw new Error('Invalid score body');

    return this._instance.put('/score/kanji', scores, options);
  }

  getRanking(appType: 'kanji' | 'word', limit = 10, options?: AxiosRequestConfig) {
    return this._instance?.get(`/ranks/${appType}?limit=${limit}`, options);
  }

  getFollowers(userId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Partial<User>[]>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance.get(`/friends/${userId}`, options);
  }

  addFriend(userId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance.patch(`/friends/${userId}`, options);
  }

  removeFriend(userId: string, option?: AxiosRequestConfig): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance.delete(`/friends/${userId}`, option);
  }

  deleteUser(options?: AxiosRequestConfig): Promise<AxiosRequestConfig<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance.delete('', options);
  }
}
