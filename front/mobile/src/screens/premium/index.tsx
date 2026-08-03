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

  // TEMPORARY: grants premium from the purchase alone, trusting the client. Phase C (server-side
  // receipt verification against the Google Play Developer API) must replace this before launch —
  // right now nothing stops a crafted local state change from faking premium. The dates below are
  // a local estimate for display only, not the real renewal date Play tracks.
  const grantPremiumLocally = useCallback(
    (plan: PremiumPlanKey) => {
      const now = new Date();
      let subscribedUntil: Date | null = null;
      if (plan === 'monthly') subscribedUntil = new Date(now.setMonth(now.getMonth() + 1));
      if (plan === 'annual') subscribedUntil = new Date(now.setFullYear(now.getFullYear() + 1));

      dispatch(
        user.actions.update({
          subscriptionPlan: 'premium',
          subscribedAt: new Date(),
          subscribedUntil,
        }),
      );
    },
    [dispatch],
  );

  const handlePurchaseUpdate = useCallback(
    async (purchase: Purchase) => {
      const plan = planFromProductId(purchase.productId);

      try {
        await acknowledgePurchase(purchase);
        if (plan) grantPremiumLocally(plan);
        toast?.show({ message: t('premium.purchase.success'), type: 'success' });
      } catch {
        toast?.show({ message: t('premium.purchase.error'), type: 'failure' });
      } finally {
        setPurchasingPlan(null);
      }
    },
    [grantPremiumLocally, toast, t],
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

        const restoredPlan = pastPurchases
          .map((purchase) => planFromProductId(purchase.productId))
          .find((plan): plan is PremiumPlanKey => plan !== null);
        if (restoredPlan && userState.subscriptionPlan === 'free') grantPremiumLocally(restoredPlan);
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
    [offers, toast, t],
  );

  if (userState.subscriptionPlan === 'premium') {
    return (
      <Layout screen="premium" hideBanner>
        <View center flex>
          <Icon source={Assets.icons.premium} size={48} tintColor={Colors.$textPrimary} />
          <Spacing y={20} />
          <Text text70BO center>
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
      <Text text60BL>{t('premium.benefits.title')}</Text>
      <Spacing y={12} />
      {BENEFIT_KEYS.map((key) => (
        <RNView key={key} style={styles.benefitRow}>
          <RNView style={styles.benefitIcon}>
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
              <Text text70BL>{t(`premium.plans.${plan}.title`)}</Text>
              {plan !== 'monthly' && (
                <RNView style={styles.planBadge}>
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
    backgroundColor: Colors.$backgroundSuccessLight,
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
    backgroundColor: Colors.$backgroundPrimaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
