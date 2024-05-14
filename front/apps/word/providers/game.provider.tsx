import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { GAME_LIFE, LEVEL_KEYS, TOTAL_QUESTIONS, kunyomi, levelSong, onyomi } from '../constants/game';

type GameContextValues = {
  skipUsed: boolean;
  life: number;
  selectedMode: GameMode[];
  current: ProblemType | null;
  problems: ProblemType[];
  initialize: (level: string) => void;
  setSelectedMode: React.Dispatch<React.SetStateAction<GameMode[]>>;
  onNext: (status: ProblemStatus) => void;
};

const GameContext = createContext<GameContextValues>({
  skipUsed: false,
  life: GAME_LIFE,
  selectedMode: [],
  current: null,
  problems: [],
  initialize: console.log,
  setSelectedMode: console.log,
  onNext: console.log,
});

export const useGameContext = () => {
  return useContext(GameContext);
};

export default function GameProvider({ children }) {
  const [skipUsed, setSkipUsed] = useState<boolean>(false);
  const [life, setLife] = useState<number>(GAME_LIFE);
  const [level, setLevel] = useState<string>('1');
  const [sound, setSound] = useState<Audio.Sound>();
  const [problemsInd, setProblemsInd] = useState<number>(0);
  const [problems, setProblems] = useState<ProblemType[]>([]);
  const [selectedMode, setSelectedMode] = useState<GameMode[]>([]);

  const initialize = useCallback(
    (lvl: string) => {
      if (selectedMode.length === 0) throw new Error('Please select a mode');

      if (lvl === '1' || lvl === '2' || lvl === '3' || lvl === '4' || lvl === '5') {
        const prob: ProblemType[] = [];

        const numberLevel = Math.min(5 - parseInt(lvl), 3) + 1;
        const numberQuestionPerLevel = Math.floor(TOTAL_QUESTIONS / numberLevel);
        const istart = parseInt(lvl) - 1;

        for (let i = istart; i < numberLevel + istart; i++) {
          let questions: typeof onyomi.levelOne = [];

          if (selectedMode.includes('onyomi')) questions = onyomi[LEVEL_KEYS[i]];
          if (selectedMode.includes('kunyomi')) questions = [...questions, ...kunyomi[LEVEL_KEYS[i]]];

          for (let j = 0; j < numberQuestionPerLevel; j++) {
            const index = Math.floor(Math.random() * questions.length);

            const question = questions.splice(index, 1).map((q) => ({
              ...q,
              answer: q.answer.split(';'),
              other_answer: q.other_answer ? q.other_answer.split(';') : undefined,
              meaning: q.meaning ? q.meaning.split(';') : undefined,
            }))[0];

            prob.push({ status: 'pending', question });
          }
        }

        prob[0].status = 'ongoing';

        setProblems(prob);
        setLevel(lvl);
        setProblemsInd(0);
        setLife(GAME_LIFE);
      } else {
        throw new Error('Incorrect level');
      }
    },
    [selectedMode]
  );

  console.log('problems', problems);

  const handleFinish = useCallback(() => {
    console.log('Result: show modal');
    router.push(`/game/${level}/results`);
  }, [level]);

  const onNext = useCallback(
    (stat: ProblemStatus) => {
      console.log('on next', stat, 'ind', problemsInd);
      if (problems[problemsInd] && level !== problems[problemsInd].question.level) setLevel(problems[problemsInd].question.level);
      if (stat === 'invalid') setLife((prev) => prev - 1);
      if (stat === 'skipped') setSkipUsed(true);
      if (problemsInd < problems.length) {
        setProblems((prev: ProblemType[]) =>
          prev.map((p, ind) => (ind === problemsInd ? { question: p.question, status: stat } : p))
        );
      }
      setProblemsInd((prev) => prev + 1);
      // Push into result screen or display modal
      if (problemsInd >= problems.length - 1) handleFinish();
    },
    [level, problems, problemsInd, life]
  );

  const playBackgroundSound = useCallback(
    async (lvl: string) => {
      const soundFile = levelSong[parseInt(lvl) - 1];
      if (sound) {
        console.log('Sound already loaded, unloading it');
        await sound.unloadAsync();
        console.log('Loading new sound');
        await sound.loadAsync(soundFile, { isLooping: true, volume: 0.5 });
        console.log('Playing Sound');
        await sound.playAsync();
      } else {
        console.log('Loading Sound');
        const { sound: newSound } = await Audio.Sound.createAsync(soundFile, { isLooping: true, volume: 0.5 });

        setSound(newSound);
        console.log('Playing Sound');
        await newSound.playAsync();
      }
    },
    [sound]
  );

  useEffect(() => {
    if (life <= 0) {
      setProblems((prev) => prev.map((p) => ({ ...p, status: p.status === 'pending' ? 'skipped' : p.status })));

      // Push into result screen or display modal
      // router.push('/home');
      handleFinish();
    }
  }, [life]);

  useEffect(() => {
    if (level) {
      // Play background sound
      playBackgroundSound(level);
    }
  }, [level]);

  useEffect(() => {
    if (life > 0 && problemsInd < problems.length) {
      setProblems((prev) => prev.map((p, i) => (i === problemsInd ? { ...p, status: 'ongoing' } : p)));
    }
  }, [problemsInd]);

  useEffect(() => {
    if (problems.filter((p) => p.status === 'pending').length === problems.length - 1 && problems[0].status === 'ongoing') {
      // When new game launch, reset skipUsed to false
      setSkipUsed(false);
    }
  }, [problems]);

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <GameContext.Provider
      value={{
        skipUsed,
        life,
        current: problems[problemsInd],
        selectedMode,
        problems,
        initialize,
        onNext,
        setSelectedMode,
      }}>
      {children}
    </GameContext.Provider>
  );
}
