import {
  endConnection,
  finishTransaction,
  getAvailablePurchases,
  getProducts,
  getSubscriptions,
  initConnection,
  Product,
  Purchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  requestSubscription,
  Subscription,
} from 'react-native-iap';

import { PREMIUM_LIFETIME_SKU, PREMIUM_SUBSCRIPTION_SKUS } from '../constants/billing';

export const initBilling = () => initConnection();
export const endBilling = () => endConnection();

export async function fetchPremiumOffers(): Promise<{ subscriptions: Subscription[]; products: Product[] }> {
  const [subscriptions, products] = await Promise.all([
    getSubscriptions({ skus: Object.values(PREMIUM_SUBSCRIPTION_SKUS) }),
    getProducts({ skus: [PREMIUM_LIFETIME_SKU] }),
  ]);

  return { subscriptions, products };
}

export function purchaseSubscription(subscription: Subscription) {
  // Android-only app: the other members of the Subscription union (iOS/Amazon) don't apply
  const offerToken =
    'subscriptionOfferDetails' in subscription ? subscription.subscriptionOfferDetails?.[0]?.offerToken : undefined;
  if (!offerToken) throw new Error('No offer available for this subscription yet');

  return requestSubscription({
    subscriptionOffers: [{ sku: subscription.productId, offerToken }],
  });
}

export function purchaseLifetime() {
  return requestPurchase({ skus: [PREMIUM_LIFETIME_SKU] });
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
export const restorePurchases = () => getAvailablePurchases();
