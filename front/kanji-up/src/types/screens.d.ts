import {NativeStackScreenProps} from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined,
  Onboarding: undefined,
};

type OnboardingProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

