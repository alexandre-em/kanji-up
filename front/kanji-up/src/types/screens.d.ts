import {NativeStackScreenProps} from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined,
  Onboarding: undefined,
  Category: undefined,
  KanjiList: { grade: string },
  Search: undefined,
  Settings: undefined,
  Flashcard: { evaluation: boolean },
};

type OnboardingProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

type CategoryProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

