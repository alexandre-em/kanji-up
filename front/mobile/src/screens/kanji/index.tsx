import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Text, View } from 'react-native-ui-lib';
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
      // Advanced has no sub-levels to pick between (unlike JLPT/grade) — a tier-picker screen
      // showing a single "all of it" tile would just be an extra tap for nothing
      if (category === 'advanced') {
        navigation.navigate(screenNames.KANJIS as never, { category, difficulty: 'all' } as never);
        return;
      }

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
      <Spacing y={15} />
      <TouchableOpacity
        style={[styles.myListsCard, { borderColor: Colors.$outlineNeutral }]}
        onPress={() => navigation.navigate(screenNames.MY_LISTS)}
        accessibilityRole="button">
        <Text text70BO $textDefault>
          {t('selection.menu.myLists.title')}
        </Text>
        <Text text90M $textNeutral>
          {t('selection.menu.myLists.subtitle')}
        </Text>
      </TouchableOpacity>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
  },
  myListsCard: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  transparent: { backgroundColor: '#00000000' },
  badge: { position: 'absolute', right: 10, top: 10 },
  badgeLabel: { color: '#fff' },
});
