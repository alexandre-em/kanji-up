import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  Product,
  ProductSubscription,
  Purchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from 'react-native-iap';

import { PREMIUM_LIFETIME_SKU, PREMIUM_SUBSCRIPTION_SKUS } from '../constants/billing';

export const initBilling = () => initConnection();
export const endBilling = () => endConnection();

export async function fetchPremiumOffers(): Promise<{ subscriptions: ProductSubscription[]; products: Product[] }> {
  const [subscriptions, products] = await Promise.all([
    fetchProducts({ skus: Object.values(PREMIUM_SUBSCRIPTION_SKUS), type: 'subs' }),
    fetchProducts({ skus: [PREMIUM_LIFETIME_SKU], type: 'in-app' }),
  ]);

  return { subscriptions: subscriptions as ProductSubscription[], products: products as Product[] };
}

export function purchaseSubscription(subscription: ProductSubscription) {
  // Android-only app: the other members of the ProductSubscription union (iOS) don't apply
  const offerToken = 'subscriptionOffers' in subscription ? subscription.subscriptionOffers?.[0]?.offerTokenAndroid : undefined;
  if (!offerToken) throw new Error('No offer available for this subscription yet');

  return requestPurchase({
    request: { google: { skus: [subscription.id], subscriptionOffers: [{ sku: subscription.id, offerToken }] } },
    type: 'subs',
  });
}

export function purchaseLifetime() {
  return requestPurchase({ request: { google: { skus: [PREMIUM_LIFETIME_SKU] } }, type: 'in-app' });
}

export function addPurchaseListeners(onPurchase: (purchase: Purchase) => void, onError: (error: PurchaseError) => void) {
  const updateSubscription = purchaseUpdatedListener(onPurchase);
  const errorSubscription = purchaseErrorListener(onError);

  return () => {
    updateSubscription.remove();
    errorSubscription.remove();
  };
}

export const acknowledgePurchase = (purchase: Purchase) => finishTransaction({ purchase, isConsumable: false });
// Not react-native-iap's own restorePurchases() — that one only triggers an internal sync and
// resolves void. This app needs the actual list back to check for an already-owned plan on mount.
export const restorePurchases = () => getAvailablePurchases();
