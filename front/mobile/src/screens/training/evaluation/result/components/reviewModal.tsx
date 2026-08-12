import { useTranslation } from 'react-i18next';
import { Image, View as RNView } from 'react-native';
import { Button, Colors, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import { EvaluationItemType } from '../../../../../store/slices/evaluation';
import { useReviewModalStyles } from '../hooks/useReviewModalStyles';

const { Dialog } = Incubator;

type ReviewModalProps = {
  item: EvaluationItemType | undefined;
  /** 1-based position among all 'review' answers, for the "2 / 6" counter */
  position: number;
  total: number;
  onChoose: (isCorrect: boolean) => void;
  onClose: () => void;
};

export default function ReviewModal({ item, position, total, onChoose, onClose }: ReviewModalProps) {
  const { t } = useTranslation();
  const styles = useReviewModalStyles();

  return (
    <Dialog
      visible={!!item}
      onDismiss={onClose}
      useSafeArea
      bottom
      width="100%"
      // RNUI's Dialog memoizes its own background without a theme dependency, so it can freeze
      // on whichever scheme was active at first mount — this forces it fresh on every render
      containerStyle={{ backgroundColor: Colors.$backgroundDefault }}>
      {item && (
        <RNView style={styles.container}>
          <RNView style={styles.header}>
            <Text text70BO $textDefault>
              {t('evaluationResult.review.title')}
            </Text>
            <Text text80M $textGeneral>
              {position} / {total}
            </Text>
          </RNView>
          <RNView style={styles.compare}>
            <RNView style={styles.compareItem}>
              <Text text90M $textGeneral>
                {t('evaluationResult.review.yourDrawing')}
              </Text>
              {/* A 'review' answer always carries an image: judging a drawing means seeing it */}
              <Image source={{ uri: `data:image/png;base64,${item.image}` }} style={styles.drawing} />
            </RNView>
            <RNView style={styles.compareItem}>
              <Text text90M $textGeneral>
                {t('evaluationResult.review.expected')}
              </Text>
              <RNView style={styles.expectedBox}>
                <Text style={styles.expectedCharacter}>{item.kanji.kanji?.character}</Text>
              </RNView>
            </RNView>
          </RNView>
          <Text text70M center>
            {t('evaluationResult.review.question')}
          </Text>
          <RNView style={styles.actions}>
            <Button label={t('evaluationResult.review.no')} outline onPress={() => onChoose(false)} style={styles.actionButton} />
            <Button label={t('evaluationResult.review.yes')} onPress={() => onChoose(true)} style={styles.actionButton} />
          </RNView>
        </RNView>
      )}
    </Dialog>
  );
}
