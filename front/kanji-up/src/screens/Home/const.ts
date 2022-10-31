import colors from "../../constants/colors";

export const menu = [
  {
    label: 'Select',
    screen: 'Category',
    icon: 'cards',
    navOpt: null,
  },
  {
    label: 'Train',
    screen: 'Flashcard',
    icon: 'cards-playing-heart-multiple',
    navOpt: { evaluation: false },
  },
  {
    label: 'Evaluate',
    screen: 'Flashcard',
    icon: 'cards-playing-heart-multiple',
    navOpt: { evaluation: true },
  },
  {
    label: 'Search',
    screen: 'Search',
    icon: 'book-search',
    navOpt: null,
  },
  {
    label: 'Settings',
    screen: 'Settings',
    icon: 'application-settings',
    navOpt: { firstTime: false },
  },
];


export const labels = ['4000', '10000', '25000']; 

export const list = [
  {
    id: 'select',
    image: require('./select.jpg'),
    title: 'Select',
    subtitle: 'Select the kanji you want to study',
    buttonTitle: 'Select',
    screen: 'Category',
    screenOptions: { evaluation: false },
  },
  {
    id: 'flashcard',
    image: require('./flashcard.jpg'),
    title: 'Memorizing Kanji',
    subtitle: 'Practice your memory or learn new kanji with a flashcard system game',
    buttonTitle: 'Begin',
    screen: 'Flashcard',
    screenOptions: { evaluation: false },
  },
  {
    id: 'evaluation',
    image: require('./evaluateBG.jpg'),
    title: 'Evaluate',
    subtitle: 'Evaluate your current level by drawing kanji',
    buttonTitle: 'Start',
    screen: 'Flashcard',
    screenOptions: { evaluation: true },
  },
];

export const stepperStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: colors.primary,
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: colors.primary,
  stepStrokeUnFinishedColor: '#dedede',
  separatorFinishedColor: colors.primary,
  separatorUnFinishedColor: '#dedede',
  stepIndicatorFinishedColor: colors.primary,
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 0,
  currentStepIndicatorLabelFontSize: 0,
  stepIndicatorLabelCurrentColor: 'transparent',
  stepIndicatorLabelFinishedColor: 'transparent',
  stepIndicatorLabelUnFinishedColor: 'transparent',
  labelColor: '#999999',
  labelSize: 13,
  currentStepLabelColor: colors.primary,
};
