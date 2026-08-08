import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { ActionSheet, Assets, Button, Colors, ExpandableSection, Icon, ProgressBar, View } from 'react-native-ui-lib';
import Card from 'react-native-ui-lib/card';
import Text from 'react-native-ui-lib/text';

import AnimatedSvgRenderer from '../../../../../components/AnimatedSvgRenderer';
import Canvas from '../../../../../components/canvas.tsx';
import Layout from '../../../../../components/layout.tsx';
import Spacing from '../../../../../components/spacing.tsx';
import Lock from '../../../../../components/svg/lock';
import SvgSilhouette from '../../../../../components/svgSilhouette.tsx';
import { KANJI_PROGRESSION_MAX } from '../../../../../constants/progression.ts';
import { screenNames } from '../../../../../constants/screens.ts';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../../../constants/styles.ts';
import { PER_KANJI_UNLOCK_COST } from '../../../../../constants/unlockCosts.ts';
import { useAppDispatch, useAppSelector } from '../../../../../hooks/useStore.tsx';
import { useToaster } from '../../../../../providers/toaster.tsx';
import { core } from '../../../../../services/http.ts';
import { getOne, selectEntities, selectGetOneStatus } from '../../../../../store/slices/kanji.ts';
import { save, selectedKanji, selectSaveStatus, selectSelectedKanji } from '../../../../../store/slices/selectedKanji.ts';
import { selectUserState, unlockContent } from '../../../../../store/slices/user.ts';
import { getCheapestLockedTier, isKanjiLocked } from '../../../../../utils/kanjiLock.ts';
import UnlockModal from '../unlockModal.tsx';

type KanjiDetailsProps = RouteParamsProps<{
  character: string;
}>;

const { width } = Dimensions.get('window');

export default function KanjiDetail(props: KanjiDetailsProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const entities = useAppSelector(selectEntities);
  const getOneStatus = useAppSelector(selectGetOneStatus);
  const selectedKanjiState = useAppSelector(selectSelectedKanji);
  const selectedSaveStatus = useAppSelector(selectSaveStatus);
  const { character } = props.route.params;
  const [svg, setSvg] = useState<string>();
  const [isDrawMode, setIsDrawMode] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [showRadical, setShowRadical] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [isUnlockVisible, setIsUnlockVisible] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const toaster = useToaster();
  const userState = useAppSelector(selectUserState);

  console.log({ selectedKanjiState });

  const kanji = useMemo(() => entities[character], [entities[character]]);
  // undefined = never practiced yet, distinct from a real 0 — no bar shown in that case
  const progressionScore = userState.progression[character];
  const progressPercent =
    progressionScore !== undefined ? Math.min(100, Math.round((progressionScore / KANJI_PROGRESSION_MAX) * 100)) : null;
  // A kanji can belong to both a JLPT tier and a school grade tier — locked here only means
  // every classification it has is a paid, not-yet-unlocked one (see utils/kanjiLock)
  const locked = useMemo(() => (kanji ? isKanjiLocked(kanji, userState) : false), [kanji, userState]);
  const unlockTierKey = useMemo(() => (kanji ? getCheapestLockedTier(kanji, userState) : null), [kanji, userState]);
  const unlockCost = unlockTierKey ? PER_KANJI_UNLOCK_COST[unlockTierKey] : 0;

  const handleConfirmUnlock = useCallback(async () => {
    if (!unlockTierKey) return;

    setIsUnlocking(true);
    const action = await dispatch(
      unlockContent({ userId: userState.userId, scope: 'kanji', tier: unlockTierKey, kanjiId: character }),
    );
    setIsUnlocking(false);

    if (unlockContent.fulfilled.match(action)) {
      toaster?.show({ message: t('kanjiList.unlock.toast.success'), type: 'success' });
      setIsUnlockVisible(false);
    } else {
      toaster?.show({ message: t('kanjiList.unlock.toast.error'), type: 'failure' });
    }
  }, [unlockTierKey, dispatch, userState.userId, character, toaster, t]);

  const ViewMode = useMemo(
    () => (
      <View style={[styles.canvas, { backgroundColor: Colors.$backgroundNeutralLight, borderColor: Colors.$outlineNeutral }]}>
        {svg ? (
          <AnimatedSvgRenderer
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            svgString={svg}
            strokeColor={Colors.$textPrimary}
            loop
          />
        ) : (
          // Some advanced kanji have no animCJK stroke-order data — these are high-level enough
          // that the player is expected to already know stroke order, they just need the character
          <Text style={[styles.characterFallback, { color: Colors.$textPrimary }]}>{kanji?.kanji?.character}</Text>
        )}
      </View>
    ),
    [svg, kanji?.kanji?.character],
  );

  const CanvasMode = useMemo(
    () => (
      <View style={[styles.canvas, { backgroundColor: Colors.$backgroundNeutralLight, borderColor: Colors.$outlineNeutral }]}>
        <View style={[styles.canvasContainer, styles.character]}>
          <Canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} hideBackground />
        </View>
        <View style={[styles.svg, styles.character]}>
          {svg ? (
            <SvgSilhouette svgString={svg} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
          ) : (
            <Text style={styles.characterFallback}>{kanji?.kanji?.character}</Text>
          )}
        </View>
      </View>
    ),
    [svg, kanji?.kanji?.character],
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

  // Gate on the data itself, not just getOneStatus === 'pending' — status is a single flag shared
  // across every kanji fetch, so navigating straight from one detail page to another can read a
  // stale 'succeeded' from the previous character for a frame before the new fetch's 'pending' lands
  if (!kanji && getOneStatus === 'failed') {
    return (
      <Layout screen="kanji">
        <View style={styles.loadingContainer}>
          <Text text80M $textNeutral center>
            {t('kanjiDetails.loadError')}
          </Text>
        </View>
      </Layout>
    );
  }

  if (!kanji) {
    return <Layout screen="kanji" isLoading />;
  }

  if (locked) {
    // No applicable tier ("custom" kanji, no JLPT/grade classification) means there's nothing to
    // buy per-kanji — Premium is the only way in, not a credits unlock
    const isPremiumOnly = !unlockTierKey;

    return (
      <Layout screen="kanji">
        <View style={styles.lockedContainer}>
          <Lock size={48} color={Colors.$iconNeutral} />
          <Spacing y={16} />
          <Text text50BL $textDefault center>
            {kanji?.kanji?.character}
          </Text>
          <Spacing y={8} />
          <Text text80M $textNeutral center>
            {t(isPremiumOnly ? 'kanjiDetails.locked.premiumOnlyMessage' : 'kanjiDetails.locked.message')}
          </Text>
          <Spacing y={20} />
          {isPremiumOnly ? (
            <Button
              label={t('kanjiDetails.locked.premiumButton')}
              onPress={() => navigation.navigate(screenNames.PREMIUM as never)}
            />
          ) : (
            <Button
              label={t('kanjiDetails.locked.unlockButton', { cost: unlockCost })}
              onPress={() => setIsUnlockVisible(true)}
            />
          )}
        </View>
        {!isPremiumOnly && (
          <UnlockModal
            visible={isUnlockVisible}
            label={t('kanjiList.unlock.single.label')}
            cost={unlockCost}
            credits={userState.credits}
            isUnlocking={isUnlocking}
            onConfirm={handleConfirmUnlock}
            onClose={() => setIsUnlockVisible(false)}
          />
        )}
      </Layout>
    );
  }

  return (
    <Layout screen="kanji">
      <View style={styles.header}>{isDrawMode ? CanvasMode : ViewMode}</View>
      {progressPercent !== null && (
        <>
          <Spacing y={16} />
          <View row spread centerV>
            <Text text90M $textNeutral>
              {t('kanjiDetails.mastery.title')}
            </Text>
            <Text text90BO style={{ color: progressPercent >= 100 ? Colors.$textSuccess : Colors.$textPrimary }}>
              {progressPercent}%
            </Text>
          </View>
          <Spacing y={4} />
          <ProgressBar
            progress={progressPercent}
            style={{ backgroundColor: Colors.$backgroundNeutralMedium }}
            progressColor={progressPercent >= 100 ? Colors.$backgroundSuccessHeavy : Colors.$backgroundPrimaryHeavy}
          />
        </>
      )}
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
          <Card style={[styles.cardYomi, { backgroundColor: Colors.$backgroundGeneralLight, borderColor: Colors.$textPrimary }]}>
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
                  color: Colors.$textDefault,
                  style: { backgroundColor: Colors.$backgroundGeneralLight },
                },
              ]}
            />
          </Card>
          <Spacing x={15} />
          <Card style={[styles.cardYomi, { backgroundColor: Colors.$backgroundGeneralLight, borderColor: Colors.$textPrimary }]}>
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
                  color: Colors.$textDefault,
                  style: { backgroundColor: Colors.$backgroundGeneralLight },
                },
              ]}
            />
          </Card>
        </View>
        {entities[character]?.kanji?.meaning && (
          <>
            <Spacing y={15} />
            <Card style={[styles.card, { backgroundColor: Colors.$backgroundNeutralLight }]}>
              <Card.Section
                content={[
                  {
                    text: t('kanjiDetails.meanings'),
                    text70BL: true,
                    color: Colors.$textDefault,
                    style: { backgroundColor: Colors.$backgroundNeutralLight },
                  },
                  ...(entities[character]?.kanji?.meaning?.map((meaning) => ({
                    text: meaning,
                    style: { backgroundColor: Colors.$backgroundNeutralLight },
                    color: Colors.$textDefault,
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
                { text: t('kanjiDetails.grade.school'), text70BL: true, center: true, color: Colors.$textDefault },
                { text: kanji?.reference?.grade ?? '-', text70: true, center: true, color: Colors.$textNeutral },
              ]}
            />
          </Card>
          <Card enableShadow={false}>
            <Card.Section
              content={[
                { text: t('kanjiDetails.grade.jlpt'), text70BL: true, center: true, color: Colors.$textDefault },
                { text: kanji?.kanji?.jlpt ?? '-', text70: true, center: true, color: Colors.$textNeutral },
              ]}
            />
          </Card>
          <Card enableShadow={false}>
            <Card.Section
              content={[
                { text: t('kanjiDetails.strokes'), text70BL: true, center: true, color: Colors.$textDefault },
                { text: kanji?.kanji?.strokes, text70: true, center: true, color: Colors.$textNeutral },
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
                <Text text60 $textDefault>
                  {t('kanjiDetails.section.radical.title')}
                </Text>
                <Icon source={showRadical ? Assets.icons.down : Assets.icons.up} size={25} />
              </View>
            }>
            <View>
              <Spacing y={10} />
              <Card style={[styles.card, { backgroundColor: Colors.$backgroundNeutralLight }]}>
                <View row style={{ justifyContent: 'space-around', backgroundColor: Colors.$backgroundNeutralLight }}>
                  <Text text40BO $textPrimary>
                    {kanji.radical.character}
                  </Text>
                  <View style={{ backgroundColor: Colors.$backgroundNeutralLight }}>
                    <Text text70BL $textDefault>
                      {kanji.radical.name?.hiragana ?? ''}
                    </Text>
                    <Text text80 $textNeutral>
                      {kanji.radical.name?.romaji ?? ''}
                    </Text>
                  </View>
                </View>
                <Spacing y={10} />
                <Text text80BL $textDefault>
                  {t('kanjiDetails.meanings')}
                </Text>
                <Text text70 $textNeutral>
                  {kanji.radical.meaning?.join(',')}
                </Text>
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
                <Text text60 $textDefault>
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
                  <Card centerV style={[styles.card, { backgroundColor: Colors.$backgroundNeutralLight }]} enableShadow={false}>
                    <Text text70BL $textDefault>
                      {example.japanese}
                    </Text>
                    <Text text80 $textNeutral>
                      {example.meaning}
                    </Text>
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
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 10,
    borderWidth: 0.5,
  },
  character: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  // Stand-in for the missing animCJK stroke data — sized to roughly fill the canvas like the SVG
  // would. Color defaults to #ccc to match SvgSilhouette's own guide fill; ViewMode overrides it
  // to the brand color since there it's the whole reference, not a trace-over guide
  characterFallback: {
    fontSize: 260,
    lineHeight: 300,
    color: '#ccc',
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
    borderWidth: 0.25,
  },
  card: {
    width: '100%',
    padding: 10,
  },
});
