import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet } from 'react-native';
import { Card, Colors, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import Lock from '../../../components/svg/lock';
import { screenNames } from '../../../constants/screens';
import { jlptDifficulties, schoolDifficulties } from '../../../constants/selection';
import { GENERAL_MARGIN } from '../../../constants/styles';
import { getTierKey, PER_KANJI_UNLOCK_COST } from '../../../constants/unlockCosts';
import { useAppSelector } from '../../../hooks/useStore';
import { selectUserState } from '../../../store/slices/user';

type KanjiDifficultiesProps = RouteParamsProps<{
  category: string;
}>;

const { width } = Dimensions.get('window');

export default function KanjiDifficulties({ route }: KanjiDifficultiesProps) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { category } = route.params;
  const userState = useAppSelector(selectUserState);
  const isPremium = userState.subscriptionPlan === 'premium';
  // 'advanced' has no difficulty list of its own yet — it's gated a level up, on the category
  // card itself (kanji/index.tsx), not reachable past that point for free users
  const difficulties = category === 'grade' ? schoolDifficulties : jlptDifficulties;

  const handleRedirect = useCallback(
    (difficulty: string) => {
      navigation.navigate(screenNames.KANJIS, { difficulty, category });
    },
    [navigation],
  );

  return (
    <Layout screen={`difficulties.${category}`}>
      <Spacing y={10} />
      {difficulties.map((button) => {
        const tierKey = getTierKey(category, button.screen);
        // Browsing in is always allowed — this only flags that some/all of the kanji inside
        // are locked, the actual per-kanji/bulk unlock happens on the kanji grid itself
        const isLocked =
          !isPremium && !userState.unlockedDifficulties.includes(tierKey) && PER_KANJI_UNLOCK_COST[tierKey] !== undefined;

        return (
          <View key={button.textKey}>
            <Spacing y={15} />
            <Card
              height={105}
              width={width - GENERAL_MARGIN * 2}
              onPress={() => handleRedirect(button.screen)}
              row
              centerV
              spread
              style={isLocked ? styles.cardLocked : undefined}>
              {button.image}
              <View style={[styles.cardContainer, { backgroundColor: Colors.$backgroundNeutralLight }]}>
                <Card.Section
                  flex
                  content={[
                    { text: t(button.textKey), text60BL: true, $textDefault: true },
                    {
                      text: `${button.count} ${t(button.subtitle)}`,
                      highlightString: `${button.count}`,
                      highlightStyle: { color: Colors.$backgroundPrimaryHeavy, fontWeight: '700' },
                      text80M: true,
                      $textNeutral: true,
                    },
                  ]}
                  contentStyle={styles.transparent}
                  style={styles.transparent}
                />
              </View>
              {isLocked && (
                <View style={styles.lockBadge}>
                  <Lock size={16} color="#fff" />
                </View>
              )}
            </Card>
          </View>
        );
      })}
    </Layout>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    flex: 1,
    padding: 15,
    // Card itself doesn't clip children (overflow: visible), so the right side needs its own
    // rounding to match the thumbnail's — otherwise square corners here read as the card not
    // stopping cleanly, uneven against the rounded left edge
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  transparent: { backgroundColor: '#00000000' },
  cardLocked: {
    opacity: 0.5,
  },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
