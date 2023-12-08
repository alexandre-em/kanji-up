export const menu = [
  {
    label: 'Word List',
    screen: '/words',
    icon: 'format-letter-case',
  },
  // {
  //   label: 'Game',
  //   screen: '/game',
  //   icon: 'gamepad-variant',
  // },
  // {
  //   label: 'Evaluate',
  //   screen: '/evaluation',
  //   icon: 'progress-question',
  // },
  {
    label: 'Search',
    screen: '/search',
    icon: 'book-search',
  },
  {
    label: 'Settings',
    screen: '/settings',
    icon: 'application-settings',
  },
];

export const labels = ['1000', '2000', '5000'];

export const list = [
  {
    id: 'random',
    // image: require('./select.jpg'),
    title: 'Random words',
    subtitle: 'Selection of 10 random words',
    buttonTitle: 'Show words',
  },
  {
    id: 'words',
    // image: require('./flashcard.jpg'),
    title: 'Words',
    subtitle: 'All words list',
    buttonTitle: 'See all',
    screen: '/words',
  },
  {
    id: 'evaluation',
    // image: require('./evaluateBG.jpg'),
    title: 'Evaluate',
    subtitle: 'Evaluate your word usage on a sentence',
    buttonTitle: 'Start',
    screen: '/evaluation',
  },
  {
    id: 'quizz',
    // image: require('./flashcard.jpg'),
    title: 'Word game',
    subtitle: "Word read's typing game. The more you progress the more it gets harder",
    buttonTitle: 'Begin',
    screen: '/game',
  },
];
