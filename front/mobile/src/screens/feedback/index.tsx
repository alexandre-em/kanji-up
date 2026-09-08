import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View as RNView } from 'react-native';
import { Button, Colors, Text, TextField } from 'react-native-ui-lib';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { useAppSelector } from '../../hooks/useStore';
import { useToaster } from '../../providers/toaster';
import { core } from '../../services/http';
import { selectUserState } from '../../store/slices/user';
import { useFeedbackStyles } from './hooks/useFeedbackStyles';

const CATEGORIES: FeedbackCategoryType[] = ['bug', 'suggestion', 'other'];

type SubmitStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export default function Feedback() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const styles = useFeedbackStyles();
  const toaster = useToaster();
  const userState = useAppSelector(selectUserState);

  const [category, setCategory] = useState<FeedbackCategoryType>('bug');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed || !userState.userId) return;

    setStatus('pending');
    try {
      await core.feedbackService!.create({ userId: userState.userId, category, message: trimmed });
      setStatus('succeeded');
      setMessage('');
      toaster?.show({ message: t('feedback.toast.success'), type: 'success' });
      navigation.goBack();
    } catch {
      setStatus('failed');
      toaster?.show({ message: t('feedback.toast.error'), type: 'failure' });
    }
  };

  return (
    <Layout screen="feedback">
      <RNView style={styles.segmentedControl}>
        {CATEGORIES.map((value) => {
          const isActive = value === category;

          return (
            <TouchableOpacity
              key={value}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => setCategory(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}>
              <Text style={{ color: isActive ? '#fff' : Colors.$textNeutral }}>{t(`feedback.category.${value}`)}</Text>
            </TouchableOpacity>
          );
        })}
      </RNView>
      <Spacing y={16} />
      <TextField
        placeholder={t('feedback.messagePlaceholder')}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={6}
        preset="outline"
        fieldStyle={styles.messageField}
      />
      <Spacing y={20} />
      <Button label={t('feedback.submit')} onPress={handleSubmit} disabled={!message.trim() || status === 'pending'} />
    </Layout>
  );
}
