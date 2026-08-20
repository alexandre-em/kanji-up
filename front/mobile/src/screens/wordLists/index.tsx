import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View as RNView } from 'react-native';
import { ActionSheet, Button, Text } from 'react-native-ui-lib';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { canCreateWordList, MAX_FREE_WORD_LISTS } from '../../constants/lists';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { useToaster } from '../../providers/toaster';
import { selectUserState } from '../../store/slices/user';
import { createList, deleteList, renameList, selectWordLists, selectWordListsCount } from '../../store/slices/wordLists';
import ListFormModal from '../lists/components/listFormModal';
import { useListsScreenStyles } from '../lists/hooks/useListsScreenStyles';
import WordListCard from './components/wordListCard';

export default function WordListsScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const styles = useListsScreenStyles();

  const lists = useAppSelector(selectWordLists);
  const listsCount = useAppSelector(selectWordListsCount);
  const userState = useAppSelector(selectUserState);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [renamingListId, setRenamingListId] = useState<string | null>(null);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);

  const listValues = Object.values(lists);
  const renamingList = renamingListId ? lists[renamingListId] : undefined;
  const deletingList = deletingListId ? lists[deletingListId] : undefined;

  const handleCreate = async (name: string) => {
    const action = await dispatch(createList(name));
    setIsCreateModalVisible(false);
    if (createList.fulfilled.match(action)) {
      toast?.show({ message: t('lists.toast.created', { name }), type: 'success' });
    }
  };

  const handleRename = async (name: string) => {
    if (!renamingListId) return;
    await dispatch(renameList({ id: renamingListId, name }));
    setRenamingListId(null);
    toast?.show({ message: t('lists.toast.renamed'), type: 'success' });
  };

  const handleConfirmDelete = async () => {
    if (!deletingListId) return;
    await dispatch(deleteList(deletingListId));
    setDeletingListId(null);
    toast?.show({ message: t('lists.toast.deleted'), type: 'success' });
  };

  return (
    <Layout screen="wordLists">
      <Button
        label={t('lists.create.button')}
        onPress={() => setIsCreateModalVisible(true)}
        size="small"
        style={styles.createButton}
      />
      <Spacing y={20} />
      {listValues.length === 0 ? (
        <RNView style={styles.empty}>
          <Text text70BO $textDefault center>
            {t('lists.empty.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('wordLists.empty.message')}
          </Text>
        </RNView>
      ) : (
        listValues.map((list, index) => (
          <RNView key={list.id}>
            {index > 0 && <Spacing y={12} />}
            <WordListCard list={list} onRename={() => setRenamingListId(list.id)} onDelete={() => setDeletingListId(list.id)} />
          </RNView>
        ))
      )}

      <ListFormModal
        visible={isCreateModalVisible}
        isCapReached={!canCreateWordList(listsCount, userState.subscriptionPlan)}
        maxFreeLists={MAX_FREE_WORD_LISTS}
        onSubmit={handleCreate}
        onClose={() => setIsCreateModalVisible(false)}
      />
      <ListFormModal
        visible={!!renamingList}
        initialName={renamingList?.name}
        onSubmit={handleRename}
        onClose={() => setRenamingListId(null)}
      />
      <ActionSheet
        visible={!!deletingList}
        title={t('lists.delete.confirmTitle', { name: deletingList?.name })}
        message={t('wordLists.delete.confirmMessage')}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        options={[
          { label: t('lists.delete.confirm'), onPress: handleConfirmDelete },
          { label: t('lists.delete.cancel'), onPress: () => setDeletingListId(null) },
        ]}
      />
    </Layout>
  );
}
