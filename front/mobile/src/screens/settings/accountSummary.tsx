import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';
import Avatar from 'react-native-ui-lib/avatar';
import { useSelector } from 'react-redux';

import { selectUserName, selectUserPicture, selectUserState } from '../../store/slices/user';

export default function AccountSummary() {
  const { t, i18n } = useTranslation();
  const userName = useSelector(selectUserName);
  const userPicture = useSelector(selectUserPicture);
  const userState = useSelector(selectUserState);

  const isPremium = userState.subscriptionPlan === 'premium';
  const subscriptionLabel = isPremium ? t('settings.subscription.premium') : t('settings.subscription.free');
  const expiresOn =
    isPremium && userState.subscribedUntil ? new Date(userState.subscribedUntil).toLocaleDateString(i18n.language) : undefined;

  return (
    <RNView style={styles.row}>
      <Avatar name={userName} source={userPicture ? { uri: userPicture } : undefined} useAutoColors size={56} />
      <RNView style={styles.info}>
        <Text text70BO numberOfLines={1}>
          {userName}
        </Text>
        <RNView style={styles.subscriptionRow}>
          <RNView style={[styles.badge, isPremium && styles.badgePremium]}>
            <Text text100M style={isPremium ? { color: Colors.$textPrimary } : { color: Colors.$textNeutral }}>
              {subscriptionLabel}
            </Text>
          </RNView>
          {expiresOn && (
            <Text text90M $textNeutral>
              {t('settings.subscription.expiresOn', { date: expiresOn })}
            </Text>
          )}
        </RNView>
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.$backgroundNeutralLight,
  },
  badgePremium: {
    backgroundColor: Colors.$backgroundPrimaryLight,
  },
});
