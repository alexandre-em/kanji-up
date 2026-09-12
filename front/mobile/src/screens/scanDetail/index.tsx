import { useTranslation } from 'react-i18next';
import { Image, View as RNView } from 'react-native';
import { Text } from 'react-native-ui-lib';

import Layout from '../../components/layout';
import RecognizedTokens from '../../components/recognizedTokens';
import Spacing from '../../components/spacing';
import { useAppSelector } from '../../hooks/useStore';
import { selectGetOne as selectWordEntities } from '../../store/slices/word';
import { useScanDetailStyles } from './useScanDetailStyles';

type ScanDetailProps = RouteParamsProps<{ scan: ScanSummaryType }>;

export default function ScanDetail(props: ScanDetailProps) {
  const { t } = useTranslation();
  const { scan } = props.route.params;
  const styles = useScanDetailStyles();
  const wordEntities = useAppSelector(selectWordEntities);

  // RecognizedTokens below fetches whatever word isn't cached yet — reused here for its meaning,
  // not just its reading, so the translation list can lag behind by a render until that resolves
  const translations = scan.tokens
    .filter((token): token is ScanTokenType & { wordId: string } => !!token.wordId && !!wordEntities[token.wordId])
    .map((token) => ({
      text: token.text,
      meaning: wordEntities[token.wordId].definition.flatMap((definition) => definition.meaning).join(', '),
    }));

  return (
    <Layout screen="scanDetail">
      <Image source={{ uri: scan.imageUrl }} style={styles.image} resizeMode="cover" />
      <Spacing y={16} />
      <RecognizedTokens tokens={scan.tokens} recognizedText={scan.recognizedText} />
      {translations.length > 0 && (
        <>
          <Spacing y={20} />
          <Text text70BO>{t('scanDetail.translation.title')}</Text>
          <Spacing y={12} />
          {translations.map((entry, index) => (
            <RNView key={`${entry.text}-${index}`} style={styles.translationRow}>
              <Text text80BO $textPrimary>
                {entry.text}
              </Text>
              <Text text80M $textDefault>
                {entry.meaning}
              </Text>
            </RNView>
          ))}
        </>
      )}
    </Layout>
  );
}
