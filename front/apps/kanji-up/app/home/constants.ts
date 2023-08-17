export const menu = [
  {
    label: 'Select',
    screen: '/category',
    icon: 'cards',
    navOpt: null,
  },
  {
    label: 'Train',
    screen: '/flashcard',
    icon: 'cards-playing-heart-multiple',
    navOpt: { evaluation: false },
  },
  {
    label: 'Evaluate',
    screen: '/evaluation',
    icon: 'cards-playing-heart-multiple',
    navOpt: { evaluation: true },
  },
  {
    label: 'Search',
    screen: '/search',
    icon: 'book-search',
    navOpt: null,
  },
  {
    label: 'Settings',
    screen: '/settings',
    icon: 'application-settings',
    navOpt: { firstTime: false },
  },
];

export const labels = ['5000', '10000', '20000'];

export const list = [
  {
    id: 'select',
    image: require('./select.jpg'),
    title: 'Select',
    subtitle: 'Select the kanji you want to study',
    buttonTitle: 'Select',
    screen: '/category',
  },
  {
    id: 'flashcard',
    image: require('./flashcard.jpg'),
    title: 'Memorizing Kanji',
    subtitle: 'Practice your memory or learn new kanji with a flashcard system game',
    buttonTitle: 'Begin',
    screen: '/flashcard',
  },
  {
    id: 'evaluation',
    image: require('./evaluateBG.jpg'),
    title: 'Evaluate',
    subtitle: 'Evaluate your current level by drawing kanji',
    buttonTitle: 'Start',
    screen: '/evaluation',
  },
];
