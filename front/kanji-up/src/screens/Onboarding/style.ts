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
    fontWeight: '700',
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
    flexWrap: 'wrap',
    opacity: 0.75,
  },
});

export const onboardingStyle = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 700,
    height: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
  },
  button: {
    width: '80%',
    borderRadius: 25,
    margin: 25,
  },
});

