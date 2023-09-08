export const menu = [
  {
    label: 'Select',
    screen: '/category',
    icon: 'cards',
  },
  {
    label: 'Train',
    screen: '/flashcard',
    icon: 'cards-playing-heart-multiple',
  },
  {
    label: 'Evaluate',
    screen: '/evaluation',
    icon: 'cards-playing-heart-multiple',
  },
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
