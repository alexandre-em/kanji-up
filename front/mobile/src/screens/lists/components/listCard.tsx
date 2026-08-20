import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View as RNView } from 'react-native';
import { Button, ExpandableSection, Text, View } from 'react-native-ui-lib';

import Spacing from '../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { getOne, selectEntities } from '../../../store/slices/kanji';
import { useListsScreenStyles } from '../hooks/useListsScreenStyles';

type ListCardProps = {
  list: SelectionList;
  onRename: () => void;
  onDelete: () => void;
};

export default function ListCard({ list, onRename, onDelete }: ListCardProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const styles = useListsScreenStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const kanjiEntities = useAppSelector(selectEntities);

  useEffect(() => {
    if (!isExpanded) return;
    list.kanjiIds.forEach((kanjiId) => {
      if (!kanjiEntities[kanjiId]) dispatch(getOne(kanjiId));
    });
  }, [isExpanded, list.kanjiIds, kanjiEntities, dispatch]);

  return (
    <View style={styles.card}>
      <ExpandableSection
        expanded={isExpanded}
        onPress={() => setIsExpanded((prev) => !prev)}
        sectionHeader={
          <RNView style={styles.cardHeader}>
            {/* Plain RNView, not RNUI's View — RNUI's View defaults to $backgroundDefault via the
                global ThemeManager override in config/rnui.ts, which painted an opaque box behind
                this text instead of staying transparent over the card's own background */}
            <RNView style={styles.cardHeaderText}>
              <Text text70BO $textDefault numberOfLines={1}>
                {list.name}
              </Text>
              <Text text90M $textNeutral>
                {list.kanjiIds.length === 0
                  ? t('lists.card.emptyDescription')
                  : t('lists.card.kanjiCount', { count: list.kanjiIds.length })}
              </Text>
            </RNView>
          </RNView>
        }>
        <Spacing y={12} />
        {list.kanjiIds.length === 0 ? (
          <Text text90M $textNeutral>
            {t('lists.card.empty')}
          </Text>
        ) : (
          <RNView style={styles.chipRow}>
            {list.kanjiIds.map((kanjiId) => (
              <RNView key={kanjiId} style={styles.chip}>
                <Text text80M $textDefault>
                  {kanjiEntities[kanjiId]?.kanji?.character ?? '…'}
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
