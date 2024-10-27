import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

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

    return this._instance?.get<User>('/profile', options);
  }

  getOne(userId: string, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance?.get<User>(`/profile/${userId}`, options);
  }

  getScore(userId: string, appType: 'kanji' | 'word', options?: AxiosRequestConfig): Promise<AxiosResponse<UserScore>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance?.get<UserScore>(`/score/${userId}?app=${appType}`, options);
  }

  updateProfile(body: Partial<User>, options?: AxiosRequestConfig): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');

    if (!body.password || body.password === '') delete body.password;

    return this._instance.patch('/profile', body, options);
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

    return this._instance.put(`/profile/image`, formData, options);
  }

  updateScore(
    scores: UserScore,
    application = 'kanji',
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');
    if (!scores || scores.total_score === undefined) throw new Error('Invalid score body');

    return this._instance.put(`/score/${application}`, scores, options);
  }

  getRanking(appType: 'kanji' | 'word', limit = 10, options?: AxiosRequestConfig) {
    return this._instance?.get<UserRank>(`/ranks/${appType}?limit=${limit}`, options);
  }

  getFollowingList(userId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<UserFollow>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance.get<UserFollow>(`/friends/${userId}/follow`, options);
  }

  getFollowers(userId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<UserFollow>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance.get<UserFollow>(`/friends/${userId}/followers`, options);
  }

  addFriend(userId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance.patch(`/friends/${userId}`, options);
  }

  removeFriend(userId: string, option?: AxiosRequestConfig): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance.delete(`/friends/${userId}`, option);
  }

  delete(options?: AxiosRequestConfig): Promise<AxiosResponse<UpdatedDataResponse>> {
    if (!this._instance) throw new Error('User instance not ready...');

    return this._instance.delete('', options);
  }

  search(input: string, options?: AxiosRequestConfig): Promise<AxiosResponse<UserSearchResult>> {
    if (!this._instance) throw new Error('User instance not ready...');
    if (!input) throw new Error('No input');

    return this._instance.get<UserSearchResult>(`/search/user?search=${input}`, options);
  }
}
