import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View as RNView } from 'react-native';
import { ActionSheet, Button, Colors, Text } from 'react-native-ui-lib';

import Layout from '../../components/layout';
import Spacing from '../../components/spacing';
import { canCreateList, canCreateWordList, MAX_FREE_WORD_LISTS } from '../../constants/lists';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { useToaster } from '../../providers/toaster';
import { createList, deleteList, renameList, selectLists, selectListsCount } from '../../store/slices/lists';
import { selectUserState } from '../../store/slices/user';
import {
  createList as createWordList,
  deleteList as deleteWordList,
  renameList as renameWordList,
  selectWordLists,
  selectWordListsCount,
} from '../../store/slices/wordLists';
import WordListCard from '../wordLists/components/wordListCard';
import ListCard from './components/listCard';
import ListFormModal from './components/listFormModal';
import { useListsScreenStyles } from './hooks/useListsScreenStyles';

type ListsKind = 'kanji' | 'word';

type ListsScreenProps = Partial<RouteParamsProps<{ initialKind?: ListsKind }>>;

export default function ListsScreen(props: ListsScreenProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const styles = useListsScreenStyles();

  const [kind, setKind] = useState<ListsKind>(props.route?.params?.initialKind ?? 'kanji');
  const isKanji = kind === 'kanji';

  const kanjiLists = useAppSelector(selectLists);
  const kanjiListsCount = useAppSelector(selectListsCount);
  const wordLists = useAppSelector(selectWordLists);
  const wordListsCount = useAppSelector(selectWordListsCount);
  const userState = useAppSelector(selectUserState);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [renamingListId, setRenamingListId] = useState<string | null>(null);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);

  const lists = isKanji ? kanjiLists : wordLists;
  const listValues = Object.values(lists);
  const renamingList = renamingListId ? lists[renamingListId] : undefined;
  const deletingList = deletingListId ? lists[deletingListId] : undefined;

  const handleCreate = async (name: string) => {
    const isFulfilled = isKanji
      ? createList.fulfilled.match(await dispatch(createList(name)))
      : createWordList.fulfilled.match(await dispatch(createWordList(name)));
    setIsCreateModalVisible(false);
    if (isFulfilled) {
      toast?.show({ message: t('lists.toast.created', { name }), type: 'success' });
    }
  };

  const handleRename = async (name: string) => {
    if (!renamingListId) return;
    if (isKanji) {
      await dispatch(renameList({ id: renamingListId, name }));
    } else {
      await dispatch(renameWordList({ id: renamingListId, name }));
    }
    setRenamingListId(null);
    toast?.show({ message: t('lists.toast.renamed'), type: 'success' });
  };

  const handleConfirmDelete = async () => {
    if (!deletingListId) return;
    if (isKanji) {
      await dispatch(deleteList(deletingListId));
    } else {
      await dispatch(deleteWordList(deletingListId));
    }
    setDeletingListId(null);
    toast?.show({ message: t('lists.toast.deleted'), type: 'success' });
  };

  const segments: { key: ListsKind; label: string }[] = [
    { key: 'kanji', label: t('history.segment.kanji') },
    { key: 'word', label: t('history.segment.word') },
  ];

  return (
    <Layout screen="lists">
      <RNView style={styles.segmentedControl}>
        {segments.map((segment) => {
          const isActive = segment.key === kind;

          return (
            <TouchableOpacity
              key={segment.key}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => setKind(segment.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}>
              <Text style={{ color: isActive ? '#fff' : Colors.$textNeutral }}>{segment.label}</Text>
            </TouchableOpacity>
          );
        })}
      </RNView>
      <Spacing y={20} />
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
            {t(isKanji ? 'lists.empty.message' : 'wordLists.empty.message')}
          </Text>
        </RNView>
      ) : (
        listValues.map((list, index) => (
          <RNView key={list.id}>
            {index > 0 && <Spacing y={12} />}
            {isKanji ? (
              <ListCard
                list={list as SelectionList}
                onRename={() => setRenamingListId(list.id)}
                onDelete={() => setDeletingListId(list.id)}
              />
            ) : (
              <WordListCard
                list={list as WordSelectionList}
                onRename={() => setRenamingListId(list.id)}
                onDelete={() => setDeletingListId(list.id)}
              />
            )}
          </RNView>
        ))
      )}

      <ListFormModal
        visible={isCreateModalVisible}
        isCapReached={
          isKanji
            ? !canCreateList(kanjiListsCount, userState.subscriptionPlan)
            : !canCreateWordList(wordListsCount, userState.subscriptionPlan)
        }
        maxFreeLists={isKanji ? undefined : MAX_FREE_WORD_LISTS}
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
        message={t(isKanji ? 'lists.delete.confirmMessage' : 'wordLists.delete.confirmMessage')}
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
