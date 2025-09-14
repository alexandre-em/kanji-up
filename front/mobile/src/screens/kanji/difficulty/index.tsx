import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet } from 'react-native';
import { Card, Colors, View } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { screenNames } from '../../../constants/screens';
import { jlptDifficulties } from '../../../constants/selection';
import { GENERAL_MARGIN } from '../../../constants/styles';
import { selectUserState } from '../../../store/slices/user';

type KanjiDifficultiesProps = RouteParamsProps<{
  category: string;
}>;

const { width } = Dimensions.get('window');

export default function KanjiDifficulties({ route }: KanjiDifficultiesProps) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const user = useSelector(selectUserState);
  const { category } = route.params;

  const handleRedirect = useCallback(
    (difficulty: string) => {
      navigation.navigate(screenNames.KANJIS, { difficulty, category });
    },
    [navigation],
  );

  return (
    <Layout screen={`difficulties.${category}`}>
      <Spacing y={10} />
      {jlptDifficulties.map((button) => (
        <View key={button.textKey}>
          <Spacing y={15} />
          <Card height={105} width={width - GENERAL_MARGIN * 2} onPress={() => handleRedirect(button.screen)} row centerV spread>
            {button.image}
            <View style={styles.cardContainer}>
              <Card.Section
                flex
                content={[
                  { text: t(button.textKey), text60BL: true },
                  {
                    text: `${button.count} ${t(button.subtitle)}`,
                    highlightString: `${button.count}`,
                    highlightStyle: { color: Colors.$backgroundPrimaryHeavy, fontWeight: '700' },
                    text80M: true,
                  },
                ]}
                contentStyle={styles.transparent}
                style={styles.transparent}
              />
            </View>
          </Card>
        </View>
      ))}
    </Layout>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.$backgroundElevated,
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: 15,
  },
  transparent: { backgroundColor: '#00000000' },
});
