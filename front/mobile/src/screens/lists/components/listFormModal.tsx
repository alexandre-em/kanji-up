import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View as RNView } from 'react-native';
import { Button, Colors, Text, TextField } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Spacing from '../../../components/spacing';
import { MAX_FREE_LISTS } from '../../../constants/lists';
import { screenNames } from '../../../constants/screens';
import { useListsScreenStyles } from '../hooks/useListsScreenStyles';

const { Dialog } = Incubator;

type ListFormModalProps = {
  visible: boolean;
  /** Present = renaming that list; absent = creating a new one */
  initialName?: string;
  /** Only meaningful when creating (initialName absent) — an existing list is never blocked from a rename */
  isCapReached?: boolean;
  /** Free-tier cap shown in the "limit reached" message — kanji and word lists have separate caps */
  maxFreeLists?: number;
  onSubmit: (name: string) => void;
  onClose: () => void;
};

export default function ListFormModal({
  visible,
  initialName,
  isCapReached,
  maxFreeLists = MAX_FREE_LISTS,
  onSubmit,
  onClose,
}: ListFormModalProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const styles = useListsScreenStyles();
  const [name, setName] = useState(initialName ?? '');

  // Re-seed the field every time the dialog opens (rather than only on mount) — the same modal
  // instance is reused for every list, so a stale name from a previous rename would otherwise
  // still be sitting in state the next time it opens
  useEffect(() => {
    if (visible) setName(initialName ?? '');
  }, [visible, initialName]);

  const isRename = initialName !== undefined;
  const blockedByCap = !isRename && isCapReached;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleGoPremium = () => {
    onClose();
    navigation.navigate(screenNames.PREMIUM);
  };

  return (
    <Dialog
      visible={visible}
      onDismiss={onClose}
      bottom
      useSafeArea
      width="100%"
      containerStyle={{ backgroundColor: Colors.$backgroundDefault }}>
      <RNView style={styles.modalContent}>
        {blockedByCap ? (
          <>
            <Text text70BO $textDefault>
              {t('lists.cap.title')}
            </Text>
            <Spacing y={8} />
            <Text text80M $textGeneral>
              {t('lists.cap.message', { max: maxFreeLists })}
            </Text>
            <Spacing y={20} />
            <RNView style={styles.cardActions}>
              <Button label={t('lists.form.cancel')} outline onPress={onClose} flex />
              <Button label={t('lists.cap.upgrade')} onPress={handleGoPremium} flex />
            </RNView>
          </>
        ) : (
          <>
            <Text text70BO $textDefault>
              {t(isRename ? 'lists.rename.title' : 'lists.create.title')}
            </Text>
            <Spacing y={16} />
            <TextField
              placeholder={t('lists.form.namePlaceholder')}
              value={name}
              onChangeText={setName}
              showClearButton
              autoFocus
              preset="outline"
            />
            <Spacing y={20} />
            <RNView style={styles.cardActions}>
              <Button label={t('lists.form.cancel')} outline onPress={onClose} flex />
              <Button label={t('lists.form.save')} onPress={handleSubmit} disabled={!name.trim()} flex />
            </RNView>
          </>
        )}
      </RNView>
    </Dialog>
  );
}
