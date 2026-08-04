import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Assets, Badge, Button, Colors, Icon, ProgressBar } from 'react-native-ui-lib';
import Avatar from 'react-native-ui-lib/avatar';
import Card from 'react-native-ui-lib/card';
import Chip from 'react-native-ui-lib/chip';
import Text from 'react-native-ui-lib/text';
import View from 'react-native-ui-lib/view';
import { useSelector } from 'react-redux';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import SearchIcon from '../../components/svg/search';
import { homeMenuButtons } from '../../constants/homeButtons';
import { screenNames } from '../../constants/screens';
import { GENERAL_MARGIN } from '../../constants/styles';
import { useRewardedCreditsAd } from '../../hooks/useRewardedCreditsAd';
import { useAppDispatch } from '../../hooks/useStore';
import { useToaster } from '../../providers/toaster';
import { fetchTodayMissions, selectTodayMissions } from '../../store/slices/missions';
import { selectSelectedKanji } from '../../store/slices/selectedKanji';
import { selectUserName, selectUserPicture, selectUserState } from '../../store/slices/user';
import MissionsModal from './missionsModal';

const { width } = Dimensions.get('window');
const MISSION_TASK_COUNT = 3;

export default function Home() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const userName = useSelector(selectUserName);
  const userPicture = useSelector(selectUserPicture);
  const userState = useSelector(selectUserState);
  const selectedKanjiState = useSelector(selectSelectedKanji);
  const todayMissions = useSelector(selectTodayMissions);
  const rewardedAd = useRewardedCreditsAd();
  const [missionsVisible, setMissionsVisible] = useState(false);

  const missionsDoneCount = todayMissions ? Object.values(todayMissions.tasks).filter(Boolean).length : 0;

  useEffect(() => {
    if (userState.macAddress) dispatch(fetchTodayMissions(userState.macAddress));
  }, [dispatch, userState.macAddress]);

  const handleWatchAd = useCallback(() => {
    if (rewardedAd.isReady) rewardedAd.show();
    else toast?.show({ message: t('home.menu.ad.error.toast'), type: 'failure' });
  }, [rewardedAd, toast, t]);

  const handleRediction = useCallback(
    (screen: string) => {
      navigation.navigate(screen);
    },
    [navigation],
  );

  return (
    <Layout withTabBar>
      <View style={styles.flex} marginB-15>
        <View style={styles.flex}>
          <Avatar
            animate
            name={userName}
            source={userPicture ? { uri: userPicture } : undefined}
            badgeProps={{ label: userState.subscriptionPlan.slice(0, 4), size: 15 }}
            badgePosition={'BOTTOM_RIGHT'}
            useAutoColors
            onPress={() => navigation.navigate(screenNames.PROFILE)}
          />
          <View style={styles.minContent} marginL-10>
            <Text text70BO>{t('home.welcome.title')},</Text>
            <Text text60BL highlightString={[userName]} highlightStyle={{ color: Colors.$textPrimary }}>
              {userName}
            </Text>
          </View>
        </View>
        <View width={90} height={30}>
          <Chip
            label={`${userState.credits}`}
            size={35}
            iconSource={Assets.icons.coin}
            iconProps={{ size: { width: 20, height: 20 } }}
            useSizeAsMinimum
          />
        </View>
      </View>
      {/* A styled button, not a real text field: no TextInput here means no keyboard/focus
          handling to fight with — a disabled SearchInput fought the native focus system and
          crashed the bridge on tap. The real, editable field lives on the Search screen. */}
      <TouchableOpacity
        onPress={() => handleRediction(screenNames.SEARCH)}
        style={styles.search}
        accessibilityRole="button"
        accessibilityLabel={t('home.search.placeholder')}>
        <SearchIcon size={18} color={Colors.$iconNeutral} />
        <Text text80M $textGeneral>
          {t('home.search.placeholder')}
        </Text>
      </TouchableOpacity>
      {/* Selection counter + mastered kanji counter */}
      <Spacing y={GENERAL_MARGIN} />
      <View>
        <Text text40BL>{selectedKanjiState ? Object.keys(selectedKanjiState).length : 0}</Text>
        <Text>{t('home.selection.unit')}</Text>
      </View>

      {/* Progress bar on mastered kanji / total kanji */}
      <Spacing y={GENERAL_MARGIN} />
      <View>
        <Text text90BO>{t('home.progression.title')}</Text>
        <Spacing y={5} />
        <ProgressBar progress={5} />
        <Text text100L>5%</Text>
      </View>
      <Spacing y={GENERAL_MARGIN} />
      <Button
        label={t('home.evaluation.button')}
        iconSource={Assets.icons.draw}
        iconProps={{ size: 20 }}
        text80BL
        onPress={() => handleRediction(screenNames.TRAINING)}
      />
      <Spacing y={GENERAL_MARGIN} />
      <TouchableOpacity
        onPress={() => setMissionsVisible(true)}
        style={styles.missionsCard}
        accessibilityRole="button"
        accessibilityLabel={t('missions.title')}>
        <Icon source={Assets.icons.check} size={32} tintColor={Colors.$iconPrimary} />
        <View style={styles.missionsContent}>
          <Text text80BL $textDefault>
            {t('missions.title')}
          </Text>
          <Text text90M $textGeneral>
            {t('missions.progress', { done: missionsDoneCount, total: MISSION_TASK_COUNT })}
          </Text>
        </View>
      </TouchableOpacity>
      {/* Menu */}
      <Spacing y={GENERAL_MARGIN} />
      <View style={styles.flex}>
        {homeMenuButtons.map((button, i) => (
          <View key={button.textKey} style={styles.row}>
            {i !== 0 && <Spacing x={10} />}
            {button.premium && userState.subscriptionPlan === 'free' && (
              <Badge
                label={t('premium.feature.badge')}
                size={20}
                backgroundColor={Colors.$backgroundGeneralMedium}
                style={styles.badge}
              />
            )}
            <Card
              height={140}
              width={(width - GENERAL_MARGIN * 2 - 20) / 2}
              style={[styles.card, button.premium && userState.subscriptionPlan === 'free' && styles.cardLocked]}
              onPress={() =>
                handleRediction(button.premium && userState.subscriptionPlan === 'free' ? screenNames.PREMIUM : button.screen)
              }>
              {button.icon}
              <Card.Section
                flex
                style={styles.transparent}
                content={[
                  { text: t(button.textKey), text80BL: true, $textDefault: true },
                  { text: t(button.subtitle!), text90M: true },
                ]}
                contentStyle={styles.cardContent}
              />
            </Card>
          </View>
        ))}
      </View>

      {userState.subscriptionPlan === 'free' && !userState.adsDeactivated && (
        <>
          <Spacing y={GENERAL_MARGIN} />
          <Card height={115} width={width - GENERAL_MARGIN * 2} style={styles.card} onPress={handleWatchAd}>
            <Icon source={Assets.icons.video} size={36} tintColor={Colors.$textPrimary} />
            <Card.Section
              flex
              content={[
                { text: t('home.menu.ad.title'), text80BL: true, $textDefault: true },
                { text: t('home.menu.ad.subtitle'), text90M: true },
              ]}
              contentStyle={styles.cardContent}
              style={styles.transparent}
            />
          </Card>
          <Spacing y={GENERAL_MARGIN} />
          <Card
            height={115}
            width={width - GENERAL_MARGIN * 2}
            style={styles.card}
            onPress={() => handleRediction(screenNames.PREMIUM)}>
            <Icon source={Assets.icons.premium} size={36} tintColor="#fff" />
            <Card.Section
              flex
              content={[
                { text: t('home.menu.premium.title'), text70BL: true, white: true },
                { text: t('home.menu.premium.subtitle'), text80BO: true, white: true },
              ]}
              contentStyle={styles.transparent}
              style={styles.transparent}
            />
            <Image source={Assets.banners.premium} style={styles.bannerImage} />
          </Card>
        </>
      )}
      <Spacing y={GENERAL_MARGIN} />
      <Card
        height={110}
        width={width - GENERAL_MARGIN * 2}
        style={styles.card}
        onPress={() => handleRediction(screenNames.SETTINGS)}>
        <Icon source={Assets.icons.setting} size={36} tintColor={Colors.$textPrimary} />
        <Card.Section
          flex
          content={[{ text: t('home.menu.setting.title'), text80BL: true }]}
          contentStyle={styles.cardContent}
          style={styles.transparent}
        />
      </Card>
      <MissionsModal visible={missionsVisible} missions={todayMissions} onClose={() => setMissionsVisible(false)} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minContent: {
    alignSelf: 'flex-start',
  },
  card: {
    padding: 15,
  },
  cardLocked: {
    opacity: 0.5,
  },
  cardContent: {
    marginTop: GENERAL_MARGIN / 2,
    backgroundColor: 'transparent',
  },
  transparent: { backgroundColor: '#00000000' },
  missionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: Colors.$outlineNeutral,
    borderRadius: 16,
  },
  missionsContent: {
    flex: 1,
  },
  bannerImage: { position: 'absolute', left: 0, zIndex: -10, width: width - GENERAL_MARGIN * 2, height: 115, borderRadius: 10 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 16,
    borderWidth: 0.5,
    borderColor: Colors.$outlineNeutral,
    borderRadius: 25,
  },
  badge: { position: 'absolute', right: 10, top: 10, zIndex: 10 },
});
