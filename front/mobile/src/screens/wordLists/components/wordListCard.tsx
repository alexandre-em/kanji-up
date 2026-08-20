import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View as RNView } from 'react-native';
import { Button, ExpandableSection, Text, View } from 'react-native-ui-lib';

import Spacing from '../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { getOne, selectGetOne } from '../../../store/slices/word';
import { useListsScreenStyles } from '../../lists/hooks/useListsScreenStyles';

type WordListCardProps = {
  list: WordSelectionList;
  onRename: () => void;
  onDelete: () => void;
};

export default function WordListCard({ list, onRename, onDelete }: WordListCardProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const styles = useListsScreenStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const wordEntities = useAppSelector(selectGetOne);

  useEffect(() => {
    if (!isExpanded) return;
    list.wordIds.forEach((wordId) => {
      if (!wordEntities[wordId]) dispatch(getOne(wordId));
    });
  }, [isExpanded, list.wordIds, wordEntities, dispatch]);

  return (
    <View style={styles.card}>
      <ExpandableSection
        expanded={isExpanded}
        onPress={() => setIsExpanded((prev) => !prev)}
        sectionHeader={
          <RNView style={styles.cardHeader}>
            <View flex>
              <Text text70BO $textDefault numberOfLines={1}>
                {list.name}
              </Text>
              <Text text90M $textNeutral>
                {list.wordIds.length === 0
                  ? t('lists.card.emptyDescription')
                  : t('wordLists.card.wordCount', { count: list.wordIds.length })}
              </Text>
            </View>
          </RNView>
        }>
        <Spacing y={12} />
        {list.wordIds.length === 0 ? (
          <Text text90M $textNeutral>
            {t('wordLists.card.empty')}
          </Text>
        ) : (
          <RNView style={styles.chipRow}>
            {list.wordIds.map((wordId) => (
              <RNView key={wordId} style={styles.wordChip}>
                <Text text80M $textDefault>
                  {wordEntities[wordId]?.word?.[0] ?? '…'}
                </Text>
              </RNView>
            ))}
          </RNView>
        )}
        <Spacing y={16} />
        <RNView style={styles.cardActions}>
          <Button label={t('lists.card.rename')} outline size="xSmall" onPress={onRename} />
          <Button label={t('lists.card.delete')} outline size="xSmall" onPress={onDelete} />
        </RNView>
      </ExpandableSection>
    </View>
  );
}
