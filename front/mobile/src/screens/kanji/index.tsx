import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet } from 'react-native';
import { Colors, View } from 'react-native-ui-lib';
import Badge from 'react-native-ui-lib/badge';
import Card from 'react-native-ui-lib/card';
import { useSelector } from 'react-redux';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { screenNames } from '../../constants/screens';
import { selectionMenuButtons } from '../../constants/selection';
import { GENERAL_MARGIN } from '../../constants/styles';
import { selectUserState } from '../../store/slices/user';

const { width } = Dimensions.get('window');

export default function KanjiCategoriesScreen() {
  const navigation = useNavigation();
  const user = useSelector(selectUserState);
  const { t } = useTranslation();

  const handleRedirect = useCallback(
    (category: string) => {
      navigation.navigate(screenNames.DIFFICULTIES, { category });
    },
    [navigation],
  );

  return (
    <Layout screen="selection" withTabBar>
      {selectionMenuButtons.map((button) => {
        const isLockedForUser = user.subscriptionPlan === 'free' && button.premium;

        return (
          <View key={button.textKey}>
            <Spacing y={15} />
            <Card
              height={105}
              width={width - GENERAL_MARGIN * 2}
              style={[styles.card, isLockedForUser && styles.cardDisabled]}
              disabled={isLockedForUser}
              onPress={() => handleRedirect(button.screen)}>
              {isLockedForUser && (
                <Badge
                  label={t('premium.feature.badge')}
                  size={20}
                  backgroundColor={Colors.$backgroundGeneralHeavy}
                  labelStyle={styles.badgeLabel}
                  style={styles.badge}
                />
              )}
              <Card.Section
                flex
                content={[{ text: t(button.textKey), text60BL: true, white: true }]}
                contentStyle={styles.transparent}
                style={styles.transparent}
                center
              />
              {button.subtitle && (
                <Card.Section
                  flex
                  content={[{ text: t(button.subtitle), text80M: true, white: true }]}
                  contentStyle={styles.transparent}
                  style={styles.transparent}
                  center
                />
              )}
              {isLockedForUser ? button.disabledImage : button.image}
            </Card>
          </View>
        );
      })}
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  transparent: { backgroundColor: '#00000000' },
  badge: { position: 'absolute', right: 10, top: 10 },
  badgeLabel: { color: '#fff' },
});
