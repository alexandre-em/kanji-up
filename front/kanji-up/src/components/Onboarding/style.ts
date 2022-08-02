import { StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export const onboardingItemStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: .7,
    justifyContent: 'center',
  },
  text: {
    flex: .3,
  },
  title: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 10,
    color: colors.primary,
    textAlign: 'center',
  },
  description: {
    fontWeight: '300',
    color: colors.primary,
    textAlign: 'center',
    paddingHorizontal: 64,
  },
});

export const onboardingStyle = StyleSheet.create({

});

