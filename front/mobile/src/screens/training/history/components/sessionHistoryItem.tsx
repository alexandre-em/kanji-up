import { useTranslation } from 'react-i18next';
import { View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import { useHistoryScreenStyles } from '../hooks/useHistoryScreenStyles';

type SessionHistoryItemProps = {
  session: SessionType;
};

export default function SessionHistoryItem({ session }: SessionHistoryItemProps) {
  const { t, i18n } = useTranslation();
  const styles = useHistoryScreenStyles();

  const date = new Date(session.createdAt).toLocaleDateString(i18n.language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const statusColor =
    session.status === 'finished'
      ? Colors.$textSuccess
      : session.status === 'abandoned'
        ? Colors.$textNeutral
        : Colors.$textPrimary;

  return (
    <RNView style={styles.row}>
      <RNView>
        <Text text80M $textDefault>
          {date}
        </Text>
        <Text text90M style={{ color: statusColor }}>
          {t(`history.status.${session.status}`)}
        </Text>
      </RNView>
      <Text text80BO $textDefault>
        {session.score !== null ? `${session.score}/${session.questions.length}` : '—'}
      </Text>
    </RNView>
  );
}
