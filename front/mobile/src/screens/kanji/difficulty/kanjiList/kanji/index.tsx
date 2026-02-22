import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Colors, Text, View } from 'react-native-ui-lib';
import { useAppDispatch, useAppSelector } from '../../../../../hooks/useStore.tsx';
import Layout from '../../../../../components/layout.tsx';
import { useEffect, useMemo, useState } from 'react';
import { getOne, selectEntities } from '../../../../../store/slices/kanji.ts';
import { core } from '../../../../../services/http.ts';
import SvgSilhouette from '../../../../../components/svgSilhouette.tsx';
import Canvas from '../../../../../components/canvas.tsx';
import Frame from '../../../../../components/frame.tsx';
import AnimatedSvgRenderer from '../../../../../components/AnimatedSvgRenderer';

type KanjiDetailsProps = RouteParamsProps<{
  character: string;
}>;

export default function KanjiDetail(props: KanjiDetailsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const entities = useAppSelector(selectEntities);
  const navigation = useNavigation();
  const { character } = props.route.params;
  const [svg, setSvg] = useState<string>();
  const [isDrawMode, setIsDrawMode] = useState<boolean>(false);

  const ViewMode = useMemo(
    () => (
      <View style={styles.canvas}>
        {svg && <AnimatedSvgRenderer width={300} height={300} svgString={svg} strokeColor={Colors.$textPrimary} loop />}
      </View>
    ),
    [svg],
  );

  const CanvasMode = useMemo(
    () => (
      <View style={styles.canvas}>
        <View style={[styles.canvasContainer, styles.character]}>
          <Canvas width={300} height={300} hideBackground />
        </View>
        <View style={[styles.svg, styles.character]}>{svg && <SvgSilhouette svgString={svg} />}</View>
      </View>
    ),
    [svg],
  );

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
      <Text>{character}</Text>
      {isDrawMode ? CanvasMode : ViewMode}
    </Layout>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  character: {
    width: '100%',
    height: '100%',
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
});
