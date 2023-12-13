import { colors } from 'constants/Colors';

export * as kunyomi from './kunyomiQuestions';
export * as onyomi from './onyomiQuestions';

export const GAME_LIFE = 3;
export const QUESTION_TIMER = 25;
export const TOTAL_QUESTIONS = 20;
export const GAME_MODE: GameMode[] = ['onyomi', 'kunyomi'];
export const LEVEL_KEYS = ['levelOne', 'levelTwo', 'levelThree', 'levelFour', 'levelFive'];
export const USER_WORD_SCORE_KEY = 'ADVANCED_READING_GAME';
export const SCORE_DATE_LIMIT = 30; // Day

export const colorStatus: Record<ProblemStatus, string> = {
  pending: '#bababa',
  valid: colors.success,
  invalid: colors.error,
  ongoing: colors.primary,
  skipped: colors.warning,
};

export const iconsStatus: Record<ProblemStatus, string> = {
  pending: 'timelapse',
  valid: 'check-circle',
  invalid: 'close-circle',
  ongoing: 'timer',
  skipped: 'skip-next-circle-outline',
};

export const scoringByStatus: Record<ProblemStatus, number> = {
  pending: 0,
  valid: 10,
  invalid: -2,
  ongoing: 0,
  skipped: 0,
};

export const levels = [
  {
    id: '1',
    image: require('../../assets/images/gameLevel/sebastian-svenson-1.jpg'),
    title: 'Level 1',
    subtitle: 'Basic words, used in every day context. You must have seen them somewhere',
    buttonTitle: 'Start',
    screen: `/game/1`,
  },
  {
    id: '2',
    image: require('../../assets/images/gameLevel/sebastian-svenson-2.jpg'),
    title: 'Level 2',
    subtitle: 'Difficult words that worry all beginner student',
    buttonTitle: 'Start',
    screen: `/game/2`,
  },
  {
    id: '3',
    image: require('../../assets/images/gameLevel/sebastian-svenson-3.jpg'),
    title: 'Level 3',
    subtitle: 'Difficult words well known of confirmed persons',
    buttonTitle: 'Start',
    screen: `/game/3`,
  },
  {
    id: '4',
    image: require('../../assets/images/gameLevel/sebastian-svenson-4.jpg'),
    title: 'Level 4',
    subtitle: 'Pronunciation used in the past, different usages or definitions difficult to determine',
    buttonTitle: 'Start',
    screen: `/game/4`,
  },
  {
    id: '5',
    image: require('../../assets/images/gameLevel/sebastian-svenson-5.jpg'),
    title: 'Level 5',
    subtitle: 'Difficult words that may not appear at exams and are not important. Just for fun.',
    buttonTitle: 'Start',
    screen: `/game/5`,
  },
];

export const levelSong = [
  require('../../assets/sounds/Monplaisir_Soundtrack.mp3'),
  require('../../assets/sounds/Kubbi_UpInMyJam.mp3'),
  require('../../assets/sounds/Kubbi_UpInMyJam.mp3'),
  require('../../assets/sounds/c152_GhostFromTheFuture.mp3'),
  require('../../assets/sounds/TheWholeOther_8_BitDreamscape.mp3'),
];
