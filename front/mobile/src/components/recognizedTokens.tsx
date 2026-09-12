import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import { screenNames } from '../constants/screens';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import { getOne as getOneWord, selectGetOne as selectWordEntities } from '../store/slices/word';
import FuriganaText from './furiganaText';

// Kana, kanji, and Japanese punctuation only — OCR sometimes picks up stray roman letters/digits
// from a photo's background or a watermark, which don't belong in the reading
const JAPANESE_CHARACTER_PATTERN = /[^　-〿぀-ヿ一-鿿]/g;

function filterJapaneseText(text: string) {
  return text.replace(JAPANESE_CHARACTER_PATTERN, '');
}

type RecognizedTokensProps = {
  tokens: ScanTokenType[];
  recognizedText: string;
};

export default function RecognizedTokens({ tokens, recognizedText }: RecognizedTokensProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const wordEntities = useAppSelector(selectWordEntities);

  // Furigana on a matched token needs the word's reading, which the token itself doesn't carry —
  // only its wordId does
  useEffect(() => {
    tokens.forEach((token) => {
      if (token.wordId && !wordEntities[token.wordId]) dispatch(getOneWord(token.wordId));
    });
  }, [tokens, wordEntities, dispatch]);

  const handleTokenPress = (token: ScanTokenType) => {
    if (!token.wordId) return;
    navigation.navigate(screenNames.WORD as never, { id: token.wordId } as never);
  };

  if (tokens.length > 0) {
    return (
      <RNView style={styles.tokenRow}>
        {tokens.map((token, index) => {
          const wordEntity = token.wordId ? wordEntities[token.wordId] : undefined;
          // Alternate spellings of the same word usually share one reading — positional
          // pairing only when the API gave one reading per spelling (see word/index.tsx)
          const spellingIndex = wordEntity?.word.indexOf(token.text) ?? -1;
          const reading = wordEntity
            ? wordEntity.reading.length === wordEntity.word.length
              ? wordEntity.reading[spellingIndex]
              : wordEntity.reading[0]
            : undefined;

          return (
            <TouchableOpacity
              key={`${token.text}-${index}`}
              disabled={!token.wordId}
              onPress={() => handleTokenPress(token)}
              style={[styles.token, token.wordId && { backgroundColor: Colors.$backgroundPrimaryLight }]}
              accessibilityRole={token.wordId ? 'button' : undefined}>
              {reading ? (
                <FuriganaText text={token.text} reading={reading} size="small" furiganaSize="XS" />
              ) : (
                <Text text70M color={token.wordId ? Colors.$textPrimary : Colors.$textDefault}>
                  {token.text}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </RNView>
    );
  }

  const filteredText = filterJapaneseText(recognizedText);
  if (filteredText.trim().length > 0) {
    return <Text text80M>{filteredText}</Text>;
  }

  return (
    <Text text80M $textGeneral>
      {t('ocr.result.empty')}
    </Text>
  );
}

const styles = StyleSheet.create({
  tokenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  token: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
