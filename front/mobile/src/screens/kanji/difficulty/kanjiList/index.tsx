import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Assets, Badge, Button, Card, Colors, Text, View } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import Layout from '../../../../components/layout';
import Spacing from '../../../../components/spacing';
import { screenNames } from '../../../../constants/screens';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useStore';
import { getAll, selectGetAllStatus, selectLastGet } from '../../../../store/slices/kanji';
import { selectGetAllResult } from '../../../../store/slices/kanji';
import {
  save,
  selectedKanji,
  selectKanjiToAdd,
  selectKanjiToDelete,
  selectSelectedKanji,
} from '../../../../store/slices/selectedKanji';

type KanjiListProps = RouteParamsProps<{
  difficulty: string;
  category: 'jlpt' | 'grade';
}>;

type KanjiCardElementProps = {
  kanji: Partial<KanjiType>;
  onPress: (kanji: Partial<KanjiType>) => void;
};

const CARD_SIZE = 50;

const KanjiCardElement = ({ kanji, onPress }: KanjiCardElementProps) => {
  const entities = useSelector(selectSelectedKanji);
  const toAdd = useSelector(selectKanjiToAdd);
  const toRemove = useSelector(selectKanjiToDelete);

  const color = useMemo(() => {
    if (toRemove[kanji.kanji_id!]) {
      return Colors.$backgroundDangerHeavy;
    }
    if (toAdd[kanji.kanji_id!]) {
      console.log('Added !', kanji.kanji_id);
      return Colors.$backgroundSuccessHeavy;
    }
    if (entities[kanji.kanji_id!]) {
      console.log('Removed !', kanji.kanji_id);
      return Colors.$backgroundNeutralHeavy;
    }
    return Colors.$backgroundElevated;
  }, [kanji.kanji_id, entities, toAdd, toRemove]);

  const label = useMemo(() => {
    if (toRemove[kanji.kanji_id!]) {
      return Assets.icons.remove;
    }
    if (toAdd[kanji.kanji_id!]) {
      return Assets.icons.add;
    }
    if (entities[kanji.kanji_id!]) {
      return Assets.icons.check;
    }
    return undefined;
  }, [kanji.kanji_id, entities, toAdd, toRemove]);

  const isBadgeVisible = useMemo(() => {
    return toRemove[kanji.kanji_id!] || toAdd[kanji.kanji_id!] || entities[kanji.kanji_id!];
  }, [kanji.kanji_id, entities, toAdd, toRemove]);

  return (
    <Card style={styles.cardContainer} width={CARD_SIZE} height={CARD_SIZE} onPress={onPress}>
      {isBadgeVisible && (
        <Badge
          icon={label}
          iconStyle={{ tintColor: '#fff', width: 15, height: 15 }}
          style={{ position: 'absolute', right: 0, zIndex: 100 }}
          size={20}
          backgroundColor={color}
        />
      )}

      <Card.Section
        content={[{ text: kanji.kanji!.character, text40BL: true, color: Colors.$textDefault }]}
        contentStyle={styles.cardContent}
      />
    </Card>
  );
};

export default function KanjiList(props: KanjiListProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isSelectModeOn, setIsSelectModeOn] = useState(false);
  const navigation = useNavigation();
  const last = useAppSelector(selectLastGet);
  const kanjis = useAppSelector(selectGetAllResult);
  const kanjisStatus = useAppSelector(selectGetAllStatus);
  const entities = useSelector(selectSelectedKanji);
  const toAdd = useSelector(selectKanjiToAdd);
  const toRemove = useSelector(selectKanjiToDelete);
  const { difficulty, category } = props.route.params;

  console.log({ toAdd, toRemove, entities });

  const kanjiList = useMemo(() => {
    const isOnline = true;
    if (isOnline) return kanjis; // TODO: check connection

    return Object.values(entities).filter((entity) => Number(entity.kanji?.jlpt) === Number(difficulty));
  }, [kanjis, difficulty, entities]);

  const handleEndReached = useCallback(() => {
    if (difficulty === last?.difficulty && category === last?.type && last.page > 0 && last.page <= last.totalPage) {
      dispatch(getAll({ type: category, difficulty, page: last.page + 1 }));
    }
  }, [dispatch, last?.difficulty, last?.type, last?.page, last?.totalPage, category, difficulty]);

  const handleRedirect = useCallback(
    (kanji: KanjiType) => {
      navigation.navigate(screenNames.KANJI, { character: kanji.kanji_id });
    },
    [navigation],
  );

  const handleSelect = useCallback(
    (kanji: Partial<KanjiType>) => {
      if (toAdd[kanji.kanji_id!] || (entities[kanji.kanji_id!] && !toRemove[kanji.kanji_id!])) {
        dispatch(selectedKanji.actions.unSelectKanji(kanji));
      } else {
        dispatch(selectedKanji.actions.selectKanji(kanji));
      }
    },
    [dispatch, toAdd, toRemove, entities],
  );

  const handlePress = useCallback(
    (kanji: Partial<KanjiType>) => {
      if (isSelectModeOn) handleSelect(kanji);
      else handleRedirect(kanji);
    },
    [isSelectModeOn, handleRedirect, handleSelect],
  );

  const handleSave = useCallback(() => {
    dispatch(save());
    setIsSelectModeOn(false);
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    dispatch(selectedKanji.actions.cancel());
    setIsSelectModeOn(false);
  }, [dispatch]);

  useEffect(() => {
    if (last?.difficulty !== difficulty || last?.type !== category) {
      dispatch(getAll({ type: category, difficulty, page: 1 }));
    }
  }, [category, difficulty, dispatch, last?.page, last?.difficulty, last?.type]);

  return (
    <Layout screen="kanjiList">
      {!isSelectModeOn ? (
        <Button label="Select" onPress={() => setIsSelectModeOn(!isSelectModeOn)} size="xSmall" />
      ) : (
        <View style={styles.buttonGroup}>
          <Button label="Save selection" onPress={handleSave} size="xSmall" />
          <Spacing x={10} />
          <Button label="Cancel" onPress={handleCancel} size="xSmall" outline />
        </View>
      )}
      <Spacing y={10} />
      <FlashList
        data={kanjiList}
        keyExtractor={(item) => item.kanji_id!}
        renderItem={({ item }) => <KanjiCardElement kanji={item} onPress={() => handlePress(item)} />}
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
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
