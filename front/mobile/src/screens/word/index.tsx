import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Colors, Icon, Text } from 'react-native-ui-lib';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { useToaster } from '../../providers/toaster';
import { core } from '../../services/http';
import { getOne as getKanji, selectEntities } from '../../store/slices/kanji';
import { save, selectedKanji, selectSelectedKanji } from '../../store/slices/selectedKanji';
import { getKanjiCharacters } from '../../store/slices/wordEvaluation';

type WordDetailProps = RouteParamsProps<{ id: string }>;

export default function WordDetail(props: WordDetailProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const { id } = props.route.params;

  const [word, setWord] = useState<WordType | null>(null);
  const [status, setStatus] = useState<RequestStatusType>('pending');

  const kanjiEntities = useAppSelector(selectEntities);
  const selectedKanjiState = useAppSelector(selectSelectedKanji);

  useEffect(() => {
    setStatus('pending');
    core
      .wordService!.getOne({ id })
      .then((response) => {
        setWord(response.data);
        setStatus('succeeded');
      })
      .catch(() => setStatus('failed'));
  }, [id]);

  const characters = useMemo(() => (word ? Array.from(new Set(getKanjiCharacters(word.word[0] ?? ''))) : []), [word]);

  useEffect(() => {
    characters.forEach((character) => {
      if (!kanjiEntities[character]) dispatch(getKanji(character));
    });
  }, [characters, kanjiEntities, dispatch]);

  const handleToggleKanji = (character: string) => {
    const kanjiEntity = kanjiEntities[character];
    if (!kanjiEntity) return;

    const isSelected = !!selectedKanjiState[character];
    dispatch(isSelected ? selectedKanji.actions.unSelectKanji(kanjiEntity) : selectedKanji.actions.selectKanji(kanjiEntity));
    dispatch(save());
    toast?.show({ message: t(isSelected ? 'wordDetails.kanji.removed' : 'wordDetails.kanji.added'), type: 'success' });
  };

  if (status === 'pending') {
    return (
      <Layout screen="wordDetails">
        <RNView style={styles.center}>
          <ActivityIndicator color={Colors.$backgroundPrimaryHeavy} size="large" />
        </RNView>
      </Layout>
    );
  }

  if (status === 'failed' || !word) {
    return (
      <Layout screen="wordDetails">
        <RNView style={styles.center}>
          <Text text80M $textGeneral center>
            {t('wordDetails.error')}
          </Text>
        </RNView>
      </Layout>
    );
  }

  return (
    <Layout screen="wordDetails">
      <Text text70BO>{t('wordDetails.spellings')}</Text>
      <Spacing y={8} />
      <RNView style={styles.chipRow}>
        {word.word.map((spelling) => (
          <RNView key={spelling} style={styles.chip}>
            <Text text70BL $textPrimary>
              {spelling}
            </Text>
          </RNView>
        ))}
      </RNView>

      <Spacing y={20} />
      <Text text70BO>{t('wordDetails.readings')}</Text>
      <Spacing y={8} />
      <RNView style={styles.chipRow}>
        {word.reading.map((reading) => (
          <RNView key={reading} style={styles.chipNeutral}>
            <Text text80M $textDefault>
              {reading}
            </Text>
          </RNView>
        ))}
      </RNView>

      {characters.length > 0 && (
        <>
          <Spacing y={20} />
          <Text text70BO>{t('wordDetails.kanji.title')}</Text>
          <Spacing y={4} />
          <Text text90M $textGeneral>
            {t('wordDetails.kanji.subtitle')}
          </Text>
          <Spacing y={12} />
          <RNView style={styles.chipRow}>
            {characters.map((character) => {
              const isSelected = !!selectedKanjiState[character];

              return (
                <TouchableOpacity
                  key={character}
                  onPress={() => handleToggleKanji(character)}
                  style={[styles.kanjiTile, isSelected && styles.kanjiTileSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={t(isSelected ? 'wordDetails.kanji.removed' : 'wordDetails.kanji.added')}>
                  <Text text50BL center>
                    {character}
                  </Text>
                  {isSelected && (
                    <RNView style={styles.kanjiCheck}>
                      <Icon source={Assets.icons.check} size={14} tintColor={Colors.$iconSuccess} />
                    </RNView>
                  )}
                </TouchableOpacity>
              );
            })}
          </RNView>
        </>
      )}

      <Spacing y={20} />
      <Text text70BO>{t('wordDetails.definitions')}</Text>
      <Spacing y={8} />
      {word.definition.map((definition, index) => (
        <RNView key={index} style={styles.definitionRow}>
          <Text text80M $textDefault>
            {definition.meaning.join(', ')}
          </Text>
        </RNView>
      ))}
    </Layout>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.$backgroundPrimaryLight,
  },
  chipNeutral: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.$backgroundNeutralLight,
  },
  kanjiTile: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.$outlineNeutral,
  },
  kanjiTileSelected: {
    borderColor: Colors.$backgroundSuccessHeavy,
    backgroundColor: Colors.$backgroundSuccessLight,
  },
  kanjiCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  definitionRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.$outlineNeutral,
  },
});
