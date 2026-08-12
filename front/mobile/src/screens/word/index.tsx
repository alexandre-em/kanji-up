import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Colors, Icon, ProgressBar, Text } from 'react-native-ui-lib';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { getAccuracyPercent, PROGRESSION_MASTERY_THRESHOLD_PERCENT } from '../../constants/progression';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { useToaster } from '../../providers/toaster';
import { core } from '../../services/http';
import { getOne as getKanji, selectEntities } from '../../store/slices/kanji';
import { save, selectedKanji, selectSelectedKanji } from '../../store/slices/selectedKanji';
import { selectUserState } from '../../store/slices/user';
import { getKanjiCharacters } from '../../store/slices/wordEvaluation';
import { useWordDetailStyles } from './useWordDetailStyles';

type WordDetailProps = RouteParamsProps<{ id: string }>;

export default function WordDetail(props: WordDetailProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const { id } = props.route.params;
  const styles = useWordDetailStyles();

  const [word, setWord] = useState<WordType | null>(null);
  const [status, setStatus] = useState<RequestStatusType>('pending');

  const kanjiEntities = useAppSelector(selectEntities);
  const selectedKanjiState = useAppSelector(selectSelectedKanji);
  const userState = useAppSelector(selectUserState);

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

  // Below the 20-attempt minimum (including zero answers), the real percentage isn't meaningful
  // yet — shown as an empty 0% bar rather than hiding the section entirely, same as kanji detail
  const displayPercent = word ? (getAccuracyPercent(userState.wordProgression[word.word_id]) ?? 0) : 0;

  return (
    <Layout
      screen="wordDetails"
      loadingMessage={status === 'pending' ? t('loading.title') : undefined}
      errorMessage={status === 'failed' || !word ? t('wordDetails.error') : undefined}>
      {word && (
        <>
          <RNView style={styles.chipRow}>
            {word.word.map((spelling) => (
              <Text key={spelling} text50BL $textPrimary>
                {spelling}
              </Text>
            ))}
          </RNView>

          <Spacing y={16} />
          <RNView style={styles.masteryRow}>
            <Text text90M $textNeutral>
              {t('wordDetails.mastery.title')}
            </Text>
            <Text
              text90BO
              style={{
                color: displayPercent > PROGRESSION_MASTERY_THRESHOLD_PERCENT ? Colors.$textSuccess : Colors.$textPrimary,
              }}>
              {displayPercent}%
            </Text>
          </RNView>
          <Spacing y={4} />
          <ProgressBar
            progress={displayPercent}
            style={{ backgroundColor: Colors.$backgroundNeutralMedium }}
            progressColor={
              displayPercent > PROGRESSION_MASTERY_THRESHOLD_PERCENT
                ? Colors.$backgroundSuccessHeavy
                : Colors.$backgroundPrimaryHeavy
            }
          />

          <Spacing y={20} />
          <Text text70BO>{t('wordDetails.readings')}</Text>
          <Spacing y={8} />
          <RNView style={styles.chipRow}>
            {word.reading.map((reading) => (
              <RNView key={reading} style={styles.chip}>
                <Text text80M $textPrimary>
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
              <Text text90M $textNeutral>
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
              {definition.example?.map((example, exampleIndex) => (
                <RNView key={example.sentence_id ?? exampleIndex} style={styles.exampleRow}>
                  <Text text90M $textDefault>
                    {example.sentence}
                  </Text>
                  <Text text90M $textNeutral>
                    {example.translation}
                  </Text>
                </RNView>
              ))}
            </RNView>
          ))}
        </>
      )}
    </Layout>
  );
}
