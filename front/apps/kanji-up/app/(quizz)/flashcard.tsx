import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Button, Divider, ProgressBar, Surface, TouchableRipple } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { SVGUriPlatform } from 'kanji-app-svg-ui';
import { router } from 'expo-router';

import styles from './style';
import { colors } from 'constants/Colors';
import { RootState } from 'store';
import { useQuizzContext } from './_layout';

export default function Practice() {
  const { width } = useWindowDimensions();
  const spin = useSharedValue<number>(0);
  const [counter, setCounter] = useState<number>(0);
  const [reverse, setReverse] = useState<boolean>(false);
  const settingsState = useSelector((state: RootState) => state.settings);
  const QuizzContext = useQuizzContext();

  const imgSize = useMemo(() => Math.min(width * 0.7, 500), [width]);

  const kanjiQueue = useMemo(() => {
    if (QuizzContext.kanjis) {
      const kanjis = QuizzContext.kanjis;

      return Array.from(Array(settingsState.evaluationCardNumber).keys()).map(
        () => kanjis[Math.floor(Math.random() * kanjis.length)]
      );
    }
    return [];
  }, [QuizzContext.kanjis, settingsState.evaluationCardNumber]);

  const cardBackContent = useMemo(() => {
    if (!kanjiQueue || (kanjiQueue && !kanjiQueue[counter])) return null;
    return (
      <View style={{ padding: 30, justifyContent: 'center', height: '100%' }}>
        <Text style={{ color: colors.primary, fontSize: 30, fontWeight: '900', alignSelf: 'center' }}>
          {kanjiQueue[counter].kanji!.character}
        </Text>
        <Text style={styles.text}>on: {kanjiQueue[counter].kanji!.onyomi}</Text>
        <Text style={styles.text}>kun: {kanjiQueue[counter].kanji!.kunyomi}</Text>
        <Text style={styles.text}>meaning: {kanjiQueue[counter].kanji!.meaning}</Text>
        <Divider style={{ marginVertical: 15, width: '80%', alignSelf: 'center' }} />
        {kanjiQueue[counter].examples && <Text style={styles.text}>Examples</Text>}
        {kanjiQueue[counter].examples &&
          kanjiQueue[counter].examples
            ?.map((k) => (
              <View key={k.japanese}>
                <Text style={{ fontWeight: '100', color: colors.text }}>{k.japanese}</Text>
                <Text style={{ fontWeight: '100', color: colors.text }}>{k.meaning}</Text>
              </View>
            ))
            .filter((_, index) => index < 3)}
      </View>
    );
  }, [counter, kanjiQueue]);

  const cardFrontContent = useMemo(() => {
    return (
      <SVGUriPlatform
        width={imgSize}
        height={imgSize}
        uri={`https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(kanjiQueue[counter].kanji!.character as string)}`}
      />
    );
  }, [imgSize, counter, kanjiQueue, reverse]);

  const handleReverse = useCallback(() => {
    setReverse((p) => !p);
    spin.value = spin.value ? 0 : 1;
  }, []);

  const handleNext = useCallback(() => {
    setCounter((prev) => prev + 1);
  }, []);

  const animatedFrontStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], reverse ? [0, 180] : [180, 360]);
    return {
      transform: [
        {
          rotateY: withTiming(`${spinVal}deg`, { duration: 500 }),
        },
      ],
    };
  }, [reverse]);

  const animatedBackStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], reverse ? [180, 360] : [0, 180]);
    return {
      transform: [
        {
          rotateY: withTiming(`${spinVal}deg`, { duration: 500 }),
        },
      ],
    };
  }, [reverse]);

  useEffect(() => {
    if (counter >= settingsState.flashcardNumber) {
      router.replace('/home');
    }
  }, [counter, settingsState.flashcardNumber]);

  return (
    <View style={styles.content}>
      <Surface style={styles.surface}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.subtext}>Progression</Text>
          <Text style={styles.subtext}>
            {counter}/{settingsState.flashcardNumber}
          </Text>
        </View>
        <ProgressBar
          progress={counter / settingsState.flashcardNumber}
          style={{ backgroundColor: '#fff', marginTop: 10, borderRadius: 25 }}
          color={colors.secondary}
        />
      </Surface>
      <TouchableRipple style={{ width: imgSize, height: imgSize, alignSelf: 'center' }} onPress={handleReverse}>
        {reverse ? (
          <Animated.View style={[animatedFrontStyle]}>
            <Surface style={{ width: imgSize, height: imgSize }}>{cardFrontContent}</Surface>
          </Animated.View>
        ) : (
          <Animated.View style={[animatedBackStyle]}>
            <Surface style={{ width: imgSize, height: imgSize }}>{cardBackContent}</Surface>
          </Animated.View>
        )}
      </TouchableRipple>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button mode="outlined" icon="reload" color={colors.primary} style={styles.clearbutton} onPress={handleReverse}>
          Reverse
        </Button>
        <Button
          mode="contained"
          icon="checkbox-marked-circle-outline"
          color={colors.primary}
          style={styles.clearbutton}
          onPress={handleNext}>
          Next
        </Button>
      </View>
    </View>
  );
}
