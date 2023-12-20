import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform } from 'react-native';
import { AVPlaybackSource, Audio } from 'expo-av';

import { QUESTION_TIMER } from 'constants';
import { useGameContext } from 'providers/game.provider';

export default function useGameLevel() {
  const GameContext = useGameContext();
  const [timer, setTimer] = useState<number>(QUESTION_TIMER);
  const [input, setInput] = useState<string>('');
  const [dialog, setDialog] = useState<boolean>(false);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const textAnimRef = useRef(new Animated.Value(30)).current;

  const playSound = useCallback(async (soundFile: AVPlaybackSource) => {
    const { sound } = await Audio.Sound.createAsync(soundFile, { volume: 1.0 });
    await sound.playAsync();

    await new Promise((r) => setTimeout(r, 1000));

    await sound.unloadAsync();
  }, []);

  const handleValidate = useCallback(() => {
    // If answer is correct, then put current status to success by calling onNext
    if (GameContext.current) {
      const answers = GameContext.current.question.answer.concat(GameContext.current.question.other_answer || []);

      if (answers.includes(input) && GameContext.life > 0) {
        setDialog(true);
        GameContext.onNext('valid');
        playSound(require('../../../assets/sounds/hero_decorative-celebration-01.wav'));
      } else {
        playSound(require('../../../assets/sounds/alert_error-01.wav'));
        setIsWrong(true);
      }
      setInput('');
    }
  }, [input, GameContext.current, GameContext.life]);

  const handleNext = useCallback(() => {
    setDialog(false);
  }, []);

  const handleSkip = useCallback(() => {
    setInput('');
    GameContext.onNext('skipped');
    setDialog(true);
  }, [GameContext.onNext]);

  const textAnimation = useMemo(
    () =>
      Animated.timing(textAnimRef, {
        toValue: 60,
        duration: QUESTION_TIMER * 1000,
        useNativeDriver: true,
      }),
    [textAnimRef]
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      let interval;
      if (timer > 0) {
        interval = setInterval(() => {
          if (!dialog) setTimer((prev: number) => prev - 1);
        }, 1000);
      } else {
        if (!dialog) {
          setDialog(true);
          GameContext.onNext('invalid');
        }
      }

      return () => {
        clearInterval(interval);
      };
    }

    return () => {};
  }, [timer, dialog]);

  useEffect(() => {
    if (GameContext.current?.status === 'ongoing' && GameContext.life > 0) {
      console.log('reset animation');
      textAnimation.reset();
      setTimer(QUESTION_TIMER);
      setIsWrong(false);
      textAnimation.start();
    }
  }, [GameContext.current, GameContext.life, textAnimation]);

  return {
    dialog,
    input,
    isWrong,
    timer,
    textAnimRef,
    handleChangeInput: setInput,
    handleNext,
    handleSkip,
    handleValidate,
    hideDialog: () => setDialog(false),
  };
}
