// Must match the product/subscription IDs configured in Google Play Console
export const PREMIUM_SUBSCRIPTION_SKUS = {
  monthly: 'premium_monthly',
  annual: 'premium_annual',
} as const;

export const PREMIUM_LIFETIME_SKU = 'premium_lifetime';

export type PremiumPlanKey = keyof typeof PREMIUM_SUBSCRIPTION_SKUS | 'lifetime';
