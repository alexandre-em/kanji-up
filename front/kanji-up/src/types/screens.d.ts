import {NativeStackScreenProps} from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined,
  Onboarding: undefined,
  Category: undefined,
  KanjiList: { grade: string },
  KanjiDetail: { id: string },
  Search: undefined,
  Settings: { firstTime: boolean },
  Flashcard: { evaluation: boolean },
};

type OnboardingProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

type CategoryProps = NativeStackScreenProps<RootStackParamList, 'Category'>;

type KanjiListProps = NativeStackScreenProps<RootStackParamList, 'KanjiList'>;

type KanjiDetailProps = NativeStackScreenProps<RootStackParamList, 'KanjiDetail'>;

type SettingsProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

