import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Card, Colors, Text, View } from 'react-native-ui-lib';

import Layout from '../../../../components/layout';
import Spacing from '../../../../components/spacing';
import { screenNames } from '../../../../constants/screens';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useStore';
import { getAll, selectGetAllStatus, selectLastGet } from '../../../../store/slices/kanji';
import { selectGetAllResult } from '../../../../store/slices/kanji';

type KanjiListProps = RouteParamsProps<{
  difficulty: string;
  category: 'jlpt' | 'grade';
}>;

type KanjiCardElementProps = {
  kanji: KanjiType;
  onPress: (kanji: KanjiType) => void;
};

const CARD_SIZE = 50;

const KanjiCardElement = ({ kanji, onPress }: KanjiCardElementProps) => {
  return (
    <Card style={styles.cardContainer} width={CARD_SIZE} height={CARD_SIZE} onPress={onPress}>
      <Card.Section
        content={[{ text: kanji.kanji.character, text40BL: true, color: Colors.$textDefault }]}
        contentStyle={styles.cardContent}
      />
    </Card>
  );
};

export default function KanjiList(props: KanjiListProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const last = useAppSelector(selectLastGet);
  const kanjis = useAppSelector(selectGetAllResult);
  const kanjisStatus = useAppSelector(selectGetAllStatus);
  const { difficulty, category } = props.route.params;

  const handleEndReached = useCallback(() => {
    if (difficulty === last?.difficulty && category === last?.type && last.page > 0 && last.page <= last.totalPage) {
      dispatch(getAll({ type: category, difficulty, page: last.page + 1 }));
    }
  }, [dispatch, last?.difficulty, last?.type, last?.page, last?.totalPage, category, difficulty]);

  const handleRedirect = useCallback(
    (character: string) => {
      navigation.navigate(screenNames.KANJI, { character });
    },
    [navigation],
  );

  useEffect(() => {
    if (last?.difficulty !== difficulty || last?.type !== category) {
      dispatch(getAll({ type: category, difficulty, page: 1 }));
    }
  }, [category, difficulty, dispatch, last?.page, last?.difficulty, last?.type]);

  return (
    <Layout screen="kanjiList">
      <FlashList
        data={kanjis}
        keyExtractor={(item) => item.kanji_id}
        renderItem={({ item }) => <KanjiCardElement kanji={item} onPress={() => handleRedirect(item.kanji_id)} />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.15}
        ListFooterComponent={
          kanjisStatus === 'pending' ? (
            <View style={styles.loader}>
              <ActivityIndicator style={{ marginVertical: 16 }} color={Colors.$backgroundPrimaryHeavy} size="large" />
              <Spacing x={10} />
              <Text>{t('loading.title')}</Text>
            </View>
          ) : null
        }
        numColumns={5}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: 5,
  },
  cardContent: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.$backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
