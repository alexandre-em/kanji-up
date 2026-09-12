import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import { screenNames } from '../constants/screens';
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

  const handleTokenPress = (token: ScanTokenType) => {
    if (!token.wordId) return;
    navigation.navigate(screenNames.WORD as never, { id: token.wordId } as never);
  };

  if (tokens.length > 0) {
    return (
      <RNView style={styles.tokenRow}>
        {tokens.map((token, index) => (
          <TouchableOpacity
            key={`${token.text}-${index}`}
            disabled={!token.wordId}
            onPress={() => handleTokenPress(token)}
            style={[styles.token, token.wordId && { backgroundColor: Colors.$backgroundPrimaryLight }]}
            accessibilityRole={token.wordId ? 'button' : undefined}>
            {token.reading ? (
              <FuriganaText text={token.text} reading={token.reading} size="small" furiganaSize="XS" />
            ) : (
              <Text text70M color={token.wordId ? Colors.$textPrimary : Colors.$textDefault}>
                {token.text}
              </Text>
            )}
          </TouchableOpacity>
        ))}
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
