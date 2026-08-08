import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View as RNView } from 'react-native';
import { Product, Purchase, PurchaseError, Subscription } from 'react-native-iap';
import { Assets, Button, Card, Colors, Icon, Text, View } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { PREMIUM_LIFETIME_SKU, PREMIUM_SUBSCRIPTION_SKUS, PremiumPlanKey } from '../../constants/billing';
import { GENERAL_MARGIN } from '../../constants/styles';
import { useAppDispatch } from '../../hooks/useStore';
import { useToaster } from '../../providers/toaster';
import {
  acknowledgePurchase,
  addPurchaseListeners,
  endBilling,
  fetchPremiumOffers,
  initBilling,
  purchaseLifetime,
  purchaseSubscription,
  restorePurchases,
} from '../../services/billing';
import { core } from '../../services/http';
import { selectUserState, user } from '../../store/slices/user';

const { width } = Dimensions.get('window');

const BENEFIT_KEYS = ['noAds', 'advancedKanji', 'scan', 'resume'] as const;
const PLANS: PremiumPlanKey[] = ['monthly', 'annual', 'lifetime'];

function planFromProductId(productId: string): PremiumPlanKey | null {
  if (productId === PREMIUM_SUBSCRIPTION_SKUS.monthly) return 'monthly';
  if (productId === PREMIUM_SUBSCRIPTION_SKUS.annual) return 'annual';
  if (productId === PREMIUM_LIFETIME_SKU) return 'lifetime';
  return null;
}

export default function Premium() {
  const { t } = useTranslation();
  const toast = useToaster();
  const dispatch = useAppDispatch();
  const userState = useSelector(selectUserState);
  const [offers, setOffers] = useState<{ subscriptions: Subscription[]; products: Product[] }>({
    subscriptions: [],
    products: [],
  });
  const [purchasingPlan, setPurchasingPlan] = useState<PremiumPlanKey | null>(null);

  // Server is the source of truth: the purchase token is only proof a checkout happened, it's the
  // /billing/verify-purchase check against the Google Play Developer API that actually grants
  // premium, so a crafted local state change can't fake it.
  const applyServerVerification = useCallback(
    async (plan: PremiumPlanKey, purchase: Purchase) => {
      if (!purchase.purchaseToken) throw new Error('Missing purchase token');

      const response = await core.purchasesService!.verifyPurchase({
        userId: userState.userId,
        productId: purchase.productId,
        purchaseToken: purchase.purchaseToken,
        planType: plan,
      });

      dispatch(
        user.actions.update({
          subscriptionPlan: response.data.subscriptionPlan,
          subscribedAt: new Date(),
          subscribedUntil: response.data.subscribedUntil ? new Date(response.data.subscribedUntil) : null,
        }),
      );
    },
    [dispatch, userState.userId],
  );

  const handlePurchaseUpdate = useCallback(
    async (purchase: Purchase) => {
      const plan = planFromProductId(purchase.productId);

      try {
        await acknowledgePurchase(purchase);
        if (plan) await applyServerVerification(plan, purchase);
        toast?.show({ message: t('premium.purchase.success'), type: 'success' });
      } catch {
        toast?.show({ message: t('premium.purchase.error'), type: 'failure' });
      } finally {
        setPurchasingPlan(null);
      }
    },
    [applyServerVerification, toast, t],
  );

  const handlePurchaseError = useCallback(
    (error: PurchaseError) => {
      setPurchasingPlan(null);
      // A user backing out of the purchase sheet isn't an error worth surfacing
      if (error.code !== 'E_USER_CANCELLED') {
        toast?.show({ message: t('premium.purchase.error'), type: 'failure' });
      }
    },
    [toast, t],
  );

  useEffect(() => {
    let removeListeners: (() => void) | undefined;

    initBilling()
      .then(() => {
        removeListeners = addPurchaseListeners(handlePurchaseUpdate, handlePurchaseError);
        return Promise.all([fetchPremiumOffers(), restorePurchases()]);
      })
      .then(([premiumOffers, pastPurchases]) => {
        setOffers(premiumOffers);

        const restoredPurchase = pastPurchases.find((purchase) => planFromProductId(purchase.productId) !== null);
        if (restoredPurchase && userState.subscriptionPlan === 'free') {
          const plan = planFromProductId(restoredPurchase.productId)!;
          applyServerVerification(plan, restoredPurchase).catch(() => undefined);
        }
      })
      .catch(() => {
        // Billing unavailable (no Play Services here, or products not yet configured in Play
        // Console) — the tier cards still render with their placeholder copy/price
      });

    return () => {
      removeListeners?.();
      endBilling().catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPlan = useCallback(
    async (plan: PremiumPlanKey) => {
      // Dev shortcut: skips real Play Billing (unavailable on the emulator/no Play Services)
      // entirely and grants premium locally, so the paywalled UI can be tested without a real
      // purchase. __DEV__ is false in release builds, so this never ships.
      if (__DEV__) {
        dispatch(user.actions.update({ subscriptionPlan: 'premium', subscribedAt: new Date(), subscribedUntil: null }));
        toast?.show({ message: t('premium.purchase.success'), type: 'success' });
        return;
      }

      setPurchasingPlan(plan);

      try {
        if (plan === 'lifetime') {
          await purchaseLifetime();
          return;
        }

        const subscription = offers.subscriptions.find((item) => item.productId === PREMIUM_SUBSCRIPTION_SKUS[plan]);
        if (!subscription) throw new Error('Offer not available yet');

        await purchaseSubscription(subscription);
      } catch {
        setPurchasingPlan(null);
        toast?.show({ message: t('premium.purchase.error'), type: 'failure' });
      }
    },
    [offers, toast, t, dispatch],
  );

  if (userState.subscriptionPlan === 'premium') {
    return (
      <Layout screen="premium" hideBanner>
        <View center flex>
          <Icon source={Assets.icons.premium} size={48} tintColor={Colors.$textPrimary} />
          <Spacing y={20} />
          <Text text70BO $textDefault center>
            {t('premium.active.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('premium.active.message')}
          </Text>
          <Spacing y={28} />
          {/* Cancellation isn't wired yet — Play Billing subscriptions are normally cancelled from
              the Play Store's own subscription management, not re-implemented in-app */}
          <Button label={t('premium.active.cancel')} disabled outline />
        </View>
      </Layout>
    );
  }

  return (
    <Layout screen="premium" hideBanner>
      <RNView style={styles.hero}>
        <Icon source={Assets.icons.premium} size={48} tintColor={Colors.$textPrimary} />
      </RNView>
      <Spacing y={20} />
      <Text text60BL $textDefault>
        {t('premium.benefits.title')}
      </Text>
      <Spacing y={12} />
      {BENEFIT_KEYS.map((key) => (
        <RNView key={key} style={styles.benefitRow}>
          <RNView style={[styles.benefitIcon, { backgroundColor: Colors.$backgroundSuccessLight }]}>
            <Icon source={Assets.icons.check} size={16} tintColor={Colors.$iconSuccess} />
          </RNView>
          <Text text80M $textDefault style={styles.benefitText}>
            {t(`premium.benefits.${key}`)}
          </Text>
        </RNView>
      ))}
      <Spacing y={28} />
      {PLANS.map((plan) => (
        <RNView key={plan}>
          <Card width={width - GENERAL_MARGIN * 2} style={styles.planCard} onPress={() => handleSelectPlan(plan)}>
            <RNView style={styles.planHeader}>
              <Text text70BL $textDefault>
                {t(`premium.plans.${plan}.title`)}
              </Text>
              {plan !== 'monthly' && (
                <RNView style={[styles.planBadge, { backgroundColor: Colors.$backgroundPrimaryLight }]}>
                  <Text text90BO $textPrimary>
                    {t(`premium.plans.${plan}.badge`)}
                  </Text>
                </RNView>
              )}
            </RNView>
            <Text text80M $textGeneral>
              {t(`premium.plans.${plan}.price`)}
            </Text>
            <Spacing y={12} />
            <Button
              label={t('premium.plans.select')}
              onPress={() => handleSelectPlan(plan)}
              disabled={purchasingPlan !== null}
              outline
            />
          </Card>
          <Spacing y={16} />
        </RNView>
      ))}
    </Layout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  planCard: {
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
