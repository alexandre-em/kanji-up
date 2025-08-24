import { Dimensions, Image, ScrollView, StyleSheet } from 'react-native';
import { Assets, Colors, Icon, ProgressBar } from 'react-native-ui-lib';
import Avatar from 'react-native-ui-lib/avatar';
import Card from 'react-native-ui-lib/card';
import Chip from 'react-native-ui-lib/chip';
import SearchInput from 'react-native-ui-lib/searchInput';
import Text from 'react-native-ui-lib/text';
import View from 'react-native-ui-lib/view';
import { useSelector } from 'react-redux';

import Spacing from '../../components/spacing';
import { homeMenuButtons } from '../../constants/homeButtons';
import { GENERAL_MARGIN } from '../../constants/styles';
import { selectUserCredit, selectUserName, selectUserPicture } from '../../store/slices/user';

const { width } = Dimensions.get('window');

export default function Home() {
  const userName = useSelector(selectUserName);
  const userPicture = useSelector(selectUserPicture);
  const userCredit = useSelector(selectUserCredit);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.flex} marginB-15>
        <View style={styles.flex}>
          <Avatar
            animate
            name={userName}
            source={userPicture ? { uri: userPicture } : undefined}
            badgeProps={{ label: 'prem', size: 15 }}
            badgePosition={'BOTTOM_RIGHT'}
            useAutoColors
          />
          <View style={styles.minContent} marginL-10>
            <Text h2 marginB-5>
              Welcome back
            </Text>
            <Text h3 highlightString={[userName]} highlightStyle={{ color: Colors.$textPrimary }}>
              {userName}
            </Text>
          </View>
        </View>
        <View width={90} height={30}>
          <Chip
            label={`${userCredit}`}
            size={35}
            iconSource={Assets.icons.coin}
            iconProps={{ size: { width: 20, height: 20 } }}
            useSizeAsMinimum
          />
        </View>
      </View>
      <SearchInput placeholder="Search..." preset="prominent" autoFocus={false} />
      {/* Selection counter + mastered kanji counter */}
      <Spacing y={GENERAL_MARGIN} />
      <View>
        <Text text40BL>123</Text>
        <Text>kanji learned</Text>
      </View>

      {/* Progress bar on mastered kanji / total kanji */}
      <Spacing y={GENERAL_MARGIN} />
      <View>
        <Text text90BO>Kanji mastering progress</Text>
        <Spacing y={5} />
        <ProgressBar progress={5} />
        <Text text100L>5%</Text>
      </View>
      {/* Menu */}
      <Spacing y={GENERAL_MARGIN} />
      <View style={styles.flex}>
        {homeMenuButtons.map((button, i) => (
          <View key={button.textKey} style={{ flexDirection: 'row' }}>
            {i !== 0 && <Spacing x={10} />}
            <Card
              height={100}
              width={(width - GENERAL_MARGIN * 2 + 10) / 2}
              style={{
                padding: 15,
              }}>
              <Icon source={Assets.icons.coin} size={36} tintColor={Colors.$textPrimary} />
              <Card.Section
                flex
                style={{ backgroundColor: Colors.$backgroundElevated }}
                content={[{ text: 'Test', text80BL: true, $outlineDefault: true }]}
                contentStyle={{
                  flex: 1,
                  marginTop: GENERAL_MARGIN / 2,
                  backgroundColor: Colors.$backgroundElevated,
                }}
              />
            </Card>
          </View>
        ))}
      </View>
      <Spacing y={GENERAL_MARGIN} />
      <Card height={105} width={width - GENERAL_MARGIN * 2} style={{ padding: 15 }}>
        <Icon source={Assets.icons.premium} size={36} tintColor="#fff" />
        <Card.Section
          flex
          content={[{ text: 'Premium', text80BL: true, white: true }]}
          contentStyle={{
            backgroundColor: '#00000000',
          }}
          style={{ backgroundColor: '#00000000' }}
        />
        <Card.Section
          flex
          content={[{ text: 'Your kanji journey, unlimited', text90BO: true, white: true }]}
          contentStyle={{
            backgroundColor: '#00000000',
          }}
          style={{ backgroundColor: '#00000000' }}
        />
        <Image source={Assets.banners.premium} style={styles.bannerImage} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: Colors.$backgroundDefault,
  },
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minContent: {
    alignSelf: 'flex-start',
  },
  bannerImage: { position: 'absolute', left: 0, zIndex: -10, width: width - GENERAL_MARGIN * 2, height: 105, borderRadius: 10 },
});
