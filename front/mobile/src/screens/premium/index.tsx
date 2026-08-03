import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View as RNView } from 'react-native';
import { Assets, Button, Card, Colors, Icon, Text, View } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { GENERAL_MARGIN } from '../../constants/styles';
import { useToaster } from '../../providers/toaster';
import { selectUserState } from '../../store/slices/user';

const { width } = Dimensions.get('window');

const BENEFIT_KEYS = ['noAds', 'advancedKanji', 'scan', 'resume'] as const;

type PlanKey = 'monthly' | 'annual' | 'lifetime';

const PLANS: PlanKey[] = ['monthly', 'annual', 'lifetime'];

export default function Premium() {
  const { t } = useTranslation();
  const toast = useToaster();
  const userState = useSelector(selectUserState);

  // Purchases aren't wired yet (Google Play Billing is the next lot) — tapping a plan says so
  // honestly instead of looking clickable and doing nothing
  const handleSelectPlan = useCallback(() => {
    toast?.show({ message: t('premium.comingSoon.toast'), type: 'success' });
  }, [toast, t]);

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
          <Card width={width - GENERAL_MARGIN * 2} style={styles.planCard} onPress={handleSelectPlan}>
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
            <Button label={t('premium.plans.select')} onPress={handleSelectPlan} outline />
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
