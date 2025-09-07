import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, ScrollView, StyleSheet } from 'react-native';
import { Assets, Badge, Button, Colors, Icon, ProgressBar } from 'react-native-ui-lib';
import Avatar from 'react-native-ui-lib/avatar';
import Card from 'react-native-ui-lib/card';
import Chip from 'react-native-ui-lib/chip';
import SearchInput from 'react-native-ui-lib/searchInput';
import Text from 'react-native-ui-lib/text';
import View from 'react-native-ui-lib/view';
import { useSelector } from 'react-redux';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { homeMenuButtons } from '../../constants/homeButtons';
import { screenNames } from '../../constants/screens';
import { GENERAL_MARGIN } from '../../constants/styles';
import { selectUserName, selectUserPicture, selectUserState } from '../../store/slices/user';

const { width } = Dimensions.get('window');

export default function Home() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const userName = useSelector(selectUserName);
  const userPicture = useSelector(selectUserPicture);
  const userState = useSelector(selectUserState);

  const handleRediction = useCallback(
    (screen: string) => {
      navigation.navigate(screen);
    },
    [navigation],
  );

  return (
    <Layout>
      <View style={styles.flex} marginB-15>
        <View style={styles.flex}>
          <Avatar
            animate
            name={userName}
            source={userPicture ? { uri: userPicture } : undefined}
            badgeProps={{ label: userState.subscriptionPlan.slice(0, 4), size: 15 }}
            badgePosition={'BOTTOM_RIGHT'}
            useAutoColors
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
      <SearchInput
        placeholder={t('home.search.placeholder')}
        autoFocus={false}
        style={styles.search}
        containerStyle={{ backgroundColor: Colors.$backgroundDefault }}
        useSafeArea
      />
      {/* Selection counter + mastered kanji counter */}
      <Spacing y={GENERAL_MARGIN} />
      <View>
        <Text text40BL>123</Text>
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
        onPress={() => {
          handleRediction(screenNames.EVALUATION);
        }}
      />
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
              style={styles.card}
              disabled={button.premium && userState.subscriptionPlan === 'free'}
              onPress={() => handleRediction(button.screen)}>
              {button.icon}
              <Card.Section
                flex
                style={{ backgroundColor: Colors.$backgroundElevated }}
                content={[{ text: t(button.textKey), text80BL: true, $outlineDefault: true }]}
                contentStyle={styles.cardContent}
              />
              {button.subtitle && (
                <Card.Section
                  flex
                  content={[{ text: t(button.subtitle), text90M: true }]}
                  contentStyle={styles.transparent}
                  style={styles.transparent}
                />
              )}
            </Card>
          </View>
        ))}
      </View>

      {userState.subscriptionPlan === 'free' && (
        <>
          <Spacing y={GENERAL_MARGIN} />
          <Card height={105} width={width - GENERAL_MARGIN * 2} style={styles.card}>
            <Icon source={Assets.icons.video} size={36} tintColor={Colors.$textPrimary} />
            <Card.Section
              flex
              content={[{ text: t('home.menu.ad.title'), text80BL: true, $outlineDefault: true }]}
              contentStyle={styles.cardContent}
              style={styles.transparent}
            />
            <Card.Section
              flex
              content={[{ text: t('home.menu.ad.subtitle'), text90M: true }]}
              contentStyle={styles.transparent}
              style={styles.transparent}
            />
          </Card>
          <Spacing y={GENERAL_MARGIN} />
          <Card height={105} width={width - GENERAL_MARGIN * 2} style={styles.card}>
            <Icon source={Assets.icons.premium} size={36} tintColor="#fff" />
            <Card.Section
              flex
              content={[{ text: t('home.menu.premium.title'), text70BL: true, white: true }]}
              contentStyle={styles.transparent}
              style={styles.transparent}
            />
            <Card.Section
              flex
              content={[{ text: t('home.menu.premium.subtitle'), text80BO: true, white: true }]}
              contentStyle={styles.transparent}
              style={styles.transparent}
            />
            <Image source={Assets.banners.premium} style={styles.bannerImage} />
          </Card>
        </>
      )}
      <Spacing y={GENERAL_MARGIN} />
      <Card height={90} width={width - GENERAL_MARGIN * 2} style={styles.card}>
        <Icon source={Assets.icons.setting} size={36} tintColor={Colors.$textPrimary} />
        <Card.Section
          flex
          content={[{ text: t('home.menu.setting.title'), text80BL: true }]}
          contentStyle={styles.cardContent}
          style={styles.transparent}
        />
      </Card>
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
  cardContent: {
    marginTop: GENERAL_MARGIN / 2,
    backgroundColor: Colors.$backgroundElevated,
  },
  transparent: { backgroundColor: '#00000000' },
  bannerImage: { position: 'absolute', left: 0, zIndex: -10, width: width - GENERAL_MARGIN * 2, height: 105, borderRadius: 10 },
  search: {
    borderWidth: 0.5,
    borderColor: Colors.$backgroundInverted + '25',
    borderRadius: 25,
  },
  badge: { position: 'absolute', right: 10, top: 10, zIndex: 10 },
});
