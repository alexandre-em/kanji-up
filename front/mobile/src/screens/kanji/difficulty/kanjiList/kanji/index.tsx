import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { ActionSheet, Assets, Button, Colors, ExpandableSection, Icon, View } from 'react-native-ui-lib';
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
import Card from 'react-native-ui-lib/card';
import Text from 'react-native-ui-lib/text';

type KanjiDetailsProps = RouteParamsProps<{
  character: string;
}>;

const [CANVAS_WIDTH, CANVAS_HEIGHT] = [300, 300];
const { width } = Dimensions.get('window');

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
  const [showRadical, setShowRadical] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const toaster = useToaster();

  console.log({ selectedKanjiState });

  const kanji = useMemo(() => entities[character], [entities[character]]);

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
      <Spacing y={20} />
      <ScrollView>
        <View row centerH>
          <Card style={styles.cardYomi}>
            <Card.Section
              content={[
                {
                  text: 'Onyomi',
                  text70BL: true,
                  color: Colors.$textPrimary,
                  style: { backgroundColor: Colors.$backgroundGeneralLight },
                },
                {
                  text: entities[character]?.kanji?.onyomi?.join(', ') ?? '',
                  text70M: true,
                  style: { backgroundColor: Colors.$backgroundGeneralLight },
                },
              ]}
            />
          </Card>
          <Spacing x={15} />
          <Card style={styles.cardYomi}>
            <Card.Section
              content={[
                {
                  text: 'Kunyomi',
                  text70BL: true,
                  color: Colors.$textPrimary,
                  style: { backgroundColor: Colors.$backgroundGeneralLight },
                },
                {
                  text: entities[character]?.kanji?.kunyomi?.join(', ') ?? '',
                  text70M: true,
                  style: { backgroundColor: Colors.$backgroundGeneralLight },
                },
              ]}
            />
          </Card>
        </View>
        {entities[character]?.kanji?.meaning && (
          <>
            <Spacing y={15} />
            <Card style={[styles.card]}>
              <Card.Section
                content={[
                  {
                    text: t('kanjiDetails.meanings'),
                    text70BL: true,
                    style: { backgroundColor: Colors.$backgroundElevatedLight },
                  },
                  ...(entities[character]?.kanji?.meaning?.map((meaning) => ({
                    text: meaning,
                    style: { backgroundColor: Colors.$backgroundElevatedLight },
                    text80L: true,
                  })) ?? []),
                ]}
              />
            </Card>
          </>
        )}
        <Spacing y={20} />
        <View row style={{ justifyContent: 'space-around' }}>
          <Card enableShadow={false}>
            <Card.Section
              content={[
                { text: t('kanjiDetails.grade.school'), text70BL: true, center: true },
                { text: kanji?.reference?.grade ?? '-', text70: true, center: true },
              ]}
            />
          </Card>
          <Card enableShadow={false}>
            <Card.Section
              content={[
                { text: t('kanjiDetails.grade.jlpt'), text70BL: true, center: true },
                { text: kanji?.kanji?.jlpt ?? '-', text70: true, center: true },
              ]}
            />
          </Card>
          <Card enableShadow={false}>
            <Card.Section
              content={[
                { text: t('kanjiDetails.strokes'), text70BL: true, center: true },
                { text: kanji?.kanji?.strokes, text70: true, center: true },
              ]}
            />
          </Card>
        </View>

        <Spacing y={20} />

        {kanji?.radical && (
          <ExpandableSection
            expanded={showRadical}
            onPress={() => {
              setShowRadical((prev) => !prev);
            }}
            sectionHeader={
              <View row centerV style={{ justifyContent: 'space-between' }}>
                <Text grey10 text60>
                  {t('kanjiDetails.section.radical.title')}
                </Text>
                <Icon source={showRadical ? Assets.icons.down : Assets.icons.up} size={25} />
              </View>
            }>
            <View>
              <Spacing y={10} />
              <Card style={styles.card}>
                <View row style={{ justifyContent: 'space-around', backgroundColor: Colors.$backgroundElevatedLight }}>
                  <Text text40BO $textPrimary>
                    {kanji.radical.character}
                  </Text>
                  <View style={{ backgroundColor: Colors.$backgroundElevatedLight }}>
                    <Text text70BL>{kanji.radical.name?.hiragana ?? ''}</Text>
                    <Text text80>{kanji.radical.name?.romaji ?? ''}</Text>
                  </View>
                </View>
                <Spacing y={10} />
                <Text text80BL>{t('kanjiDetails.meanings')}</Text>
                <Text text70>{kanji.radical.meaning?.join(',')}</Text>
              </Card>
            </View>
          </ExpandableSection>
        )}

        <Spacing y={20} />

        {kanji?.examples && (
          <ExpandableSection
            expanded={showExample}
            onPress={() => {
              setShowExample((prev) => !prev);
            }}
            sectionHeader={
              <View row centerV style={{ justifyContent: 'space-between' }}>
                <Text grey10 text60>
                  {t('kanjiDetails.section.example.title')}
                </Text>
                <Icon source={showRadical ? Assets.icons.down : Assets.icons.up} size={25} />
              </View>
            }>
            <View>
              <Spacing y={10} />
              {kanji.examples.map((example, i) => (
                <View key={example.japanese + example.meaning}>
                  {i !== 0 && <Spacing y={10} />}
                  <Card centerV style={styles.card} enableShadow={false}>
                    <Text text70BL>{example.japanese}</Text>
                    <Text text80>{example.meaning}</Text>
                  </Card>
                </View>
              ))}
            </View>
          </ExpandableSection>
        )}
      </ScrollView>
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
  cardYomi: {
    width: width / 2 - 30,
    padding: 10,
    backgroundColor: Colors.$backgroundGeneralLight,
    borderColor: Colors.$textPrimary,
    borderWidth: 0.25,
  },
  card: {
    width: '100%',
    padding: 10,
    backgroundColor: Colors.$backgroundElevatedLight,
  },
});
