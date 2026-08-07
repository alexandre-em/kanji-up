import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { API_TIMEOUT_MS } from '../constants/network';

export type ScanImageInput = {
  uri: string;
  type: string;
  name: string;
};

export default class ScanService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this._instance = axios.create({
        baseURL: `${baseUrl}/scans`,
        headers: { 'Access-Control-Allow-Origin': '*' },
        timeout: API_TIMEOUT_MS,
      });
    }
  }

  create(userId: string, image: ScanImageInput, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Scan instance not ready...');

    const formData = new FormData();
    formData.append('userId', userId);
    // React Native's FormData accepts this {uri, type, name} shape for a file part, not a real Blob
    formData.append('image', image as unknown as Blob);

    return this._instance.post<ScanResultType>('/', formData, {
      ...options,
      headers: { ...options?.headers, 'Content-Type': 'multipart/form-data' },
    });
  }

  list(userId: string, page: number, limit: number, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Scan instance not ready...');

    return this._instance.get<PaginatedScansType>('/', { ...options, params: { userId, page, limit } });
  }
}
