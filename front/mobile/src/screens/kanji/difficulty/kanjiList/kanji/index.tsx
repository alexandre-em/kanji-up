import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { ActionSheet, Assets, Button, Colors, View } from 'react-native-ui-lib';
import { useAppDispatch, useAppSelector } from '../../../../../hooks/useStore.tsx';
import Layout from '../../../../../components/layout.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getOne, selectEntities } from '../../../../../store/slices/kanji.ts';
import { core } from '../../../../../services/http.ts';
import SvgSilhouette from '../../../../../components/svgSilhouette.tsx';
import Canvas from '../../../../../components/canvas.tsx';
import AnimatedSvgRenderer from '../../../../../components/AnimatedSvgRenderer';
import Spacing from '../../../../../components/spacing.tsx';
import { save, selectedKanji, selectSaveStatus, selectSelectedKanji } from '../../../../../store/slices/selectedKanji.ts';
import { useToaster } from '../../../../../providers/toaster.tsx';

type KanjiDetailsProps = RouteParamsProps<{
  character: string;
}>;

const [CANVAS_WIDTH, CANVAS_HEIGHT] = [300, 300];

export default function KanjiDetail(props: KanjiDetailsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const entities = useAppSelector(selectEntities);
  const selectedKanjiState = useAppSelector(selectSelectedKanji);
  const selectedSaveStatus = useAppSelector(selectSaveStatus);
  const { character } = props.route.params;
  const [svg, setSvg] = useState<string>();
  const [isDrawMode, setIsDrawMode] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const toaster = useToaster();

  console.log({ selectedKanjiState });

  const ViewMode = useMemo(
    () => (
      <View style={styles.canvas}>
        {svg && (
          <AnimatedSvgRenderer
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            svgString={svg}
            strokeColor={Colors.$textPrimary}
            loop
          />
        )}
      </View>
    ),
    [svg],
  );

  const CanvasMode = useMemo(
    () => (
      <View style={styles.canvas}>
        <View style={[styles.canvasContainer, styles.character]}>
          <Canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} hideBackground />
        </View>
        <View style={[styles.svg, styles.character]}>
          {svg && <SvgSilhouette svgString={svg} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />}
        </View>
      </View>
    ),
    [svg],
  );

  const handleModeSelect = useCallback(() => {
    setIsDrawMode((prev) => !prev);
  }, []);

  const handleSelect = useCallback(() => {
    if (entities[character]) {
      if (!selectedKanjiState[character]) {
        dispatch(selectedKanji.actions.selectKanji(entities[character]));
        setShowModal(true);
      } else {
        dispatch(selectedKanji.actions.unSelectKanji(entities[character]));
        setShowModal(true);
      }
    }
  }, [entities[character], selectedKanjiState[character]]);

  const handleSubmit = useCallback(() => {
    dispatch(save());
    setShowModal(false);
  }, []);

  const handleCancel = useCallback(() => {
    dispatch(selectedKanji.actions.cancel());
    setShowModal(false);
  }, []);

  useEffect(() => {
    console.log(selectedSaveStatus);
    if (toaster) {
      if (selectedSaveStatus === 'succeeded') {
        toaster.show({ message: t('kanji.select.toast.success'), type: 'success' });
        dispatch(selectedKanji.actions.resetSaveStatus());
        setShowModal(false);
      }
      if (selectedSaveStatus === 'failed') {
        setShowModal(false);
      }
    }
  }, [selectedSaveStatus]);

  useEffect(() => {
    if (!entities[character]) dispatch(getOne(character));
  }, [character, entities[character]]);

  useEffect(() => {
    if (entities[character]?.kanji?.character) {
      core.kanjiService?.getOneImage({ kanji: entities[character].kanji.character }).then((res) => setSvg(res.data));
    }
  }, [entities[character]?.kanji?.character]);

  return (
    <Layout screen="kanji">
      <View style={styles.header}>{isDrawMode ? CanvasMode : ViewMode}</View>
      <Spacing y={20} />
      <View style={styles.buttonGroup}>
        <Button
          iconSource={isDrawMode ? Assets.icons.video : Assets.icons.draw}
          iconProps={{ size: 20 }}
          label={isDrawMode ? t('kanjiDetails.viewMode.button') : t('kanjiDetails.drawMode.button')}
          onPress={handleModeSelect}
        />
        <Spacing x={10} />
        <Button
          iconSource={isDrawMode ? Assets.icons.video : Assets.icons.draw}
          iconProps={{ size: 20 }}
          label={selectedKanjiState[character] ? t('kanjiDetails.unselect.button') : t('kanjiDetails.select.button')}
          onPress={handleSelect}
          outline
        />
      </View>
      <ActionSheet
        visible={showModal}
        title={'Confirmation'}
        cancelButtonIndex={2}
        destructiveButtonIndex={0}
        options={[
          { label: 'Save selection', onPress: handleSubmit },
          { label: 'Cancel', onPress: handleCancel },
        ]}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: Colors.$backgroundElevated,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.$textDefault + '30',
  },
  character: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  canvasContainer: {
    zIndex: 100,
  },
  svg: {
    position: 'absolute',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
