import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ONBOARDING_FINISHED_KEY } from '../constants/storage';
import { fileServiceInstance } from '../services/file';
import Home from './home';
import Onboarding from './onboarding';

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  groups: {
    Onboarding: {
      if: () => !fileServiceInstance.read(ONBOARDING_FINISHED_KEY),
      screens: {
        Onboarding,
      },
    },
    Home: {
      if: () => fileServiceInstance.read(ONBOARDING_FINISHED_KEY),
      screens: {
        Home,
      },
    },
  },
});

export const RootNavigation = createStaticNavigation(RootStack);
