import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { kanjiService } from '../../service';
import { fileNames, writeFile } from '../../service/file';
import { RootState } from '../../store';
import { error, kanji } from '../../store/slices';

interface useHandlersProps {
  navigation: any;
  grade: string;
}

export default function useHandlers({ navigation, grade }: useHandlersProps) {
  const dispatch = useDispatch();
  const kanjiState = useSelector((s: RootState) => s.kanji);
  const [data, setData] = useState<Pagination<KanjiType> | null>(null);
  const [limit, setLimit] = useState<number>(30);
  const [selectionMode, setSelection] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [dialog, setDialog] = useState<boolean>(false);

  const handleShowMenu = useCallback(() => setVisible(true), []);
  const handleCloseMenu = useCallback(() => setVisible(false), []);
  const handleCloseDialog = useCallback(() => setDialog(false), []);

  const handleSelect = useCallback(() => {
    setSelection((prevState: boolean) => !prevState);
  }, []);

  const handlePress = useCallback(
    (selectedKanji: KanjiType) => {
      if (selectionMode) {
        if (kanjiState.toAdd[selectedKanji.kanji_id] || (kanjiState.selectedKanji[selectedKanji.kanji_id] && !kanjiState.toRemove[selectedKanji.kanji_id])) {
          dispatch(kanji.actions.unSelectKanji(selectedKanji));
        } else {
          dispatch(kanji.actions.selectKanji(selectedKanji));
        }
      } else {
        navigation.navigate('KanjiDetail', { id: selectedKanji.kanji_id });
      }
    },
    [selectionMode, kanjiState]
  );

  const handleReset = useCallback(() => {
    dispatch(kanji.actions.reset());
  }, []);

  const handleCancel = useCallback(() => {
    dispatch(kanji.actions.cancel());
  }, []);

  const handleSave = useCallback(() => {
    dispatch(kanji.actions.save((selectedKanji: KanjiType) => writeFile(fileNames.SELECTED_KANJI, JSON.stringify(selectedKanji))));
  }, []);

  const handleBack = useCallback(() => {
    const hasModifs = Object.keys(kanjiState.toRemove).length + Object.keys(kanjiState.toAdd).length > 0;

    if (hasModifs) {
      setDialog(true);
    } else {
      navigation.goBack();
    }
  }, [kanjiState]);

  const getKanjis = useCallback(
    ({ page }: { page: number }, options: AxiosRequestConfig = {}) => {
      if (!loading) {
        setLoading(true);
        kanjiService
          .getKanjis({ grade, limit, page: page ?? {} }, options)
          .then((res: AxiosResponse<Pagination<KanjiType>>) => {
            if (!res?.data?.docs) {
              throw new Error('No data founded. Try later and if this error appear again, please contact an admin');
            }
            setData(res.data);
            setLoading(false);
          })
          .catch((err) => dispatch(error.actions.update({ message: axios.isCancel(err) ? 'Previous action cancelled.' : err.message })));
      }
    },
    [limit, loading]
  );

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    getKanjis({ page: 1 }, { cancelToken: cancelToken.token });

    return () => {
      cancelToken.cancel();
    };
  }, [limit]);

  return {
    data,
    loading,
    selectionMode,
    visible,
    dialog,
    setLimit,
    getKanjis,
    handleBack,
    handleSave,
    handlePress,
    handleReset,
    handleCancel,
    handleSelect,
    handleShowMenu,
    handleCloseMenu,
    handleCloseDialog,
  };
}
