import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { PremiumPlanKey } from '../constants/billing';
import { API_TIMEOUT_MS } from '../constants/network';

export type VerifyPurchasePayload = {
  userId: string;
  productId: string;
  purchaseToken: string;
  planType: PremiumPlanKey;
};

export type VerifyPurchaseResponse = {
  subscriptionPlan: SubscriptionPlan;
  subscribedUntil: string | null;
};

export default class PurchasesService {
  private _instance: AxiosInstance | null = null;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this._instance = axios.create({
        baseURL: `${baseUrl}/billing`,
        headers: { 'Access-Control-Allow-Origin': '*' },
        timeout: API_TIMEOUT_MS,
      });
    }
  }

  verifyPurchase(payload: VerifyPurchasePayload, options?: AxiosRequestConfig) {
    if (!this._instance) throw new Error('Purchases instance not ready...');

    return this._instance.post<VerifyPurchaseResponse>('/verify-purchase', payload, options);
  }
}
