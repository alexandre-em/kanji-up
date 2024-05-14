import { StyleSheet } from 'react-native';

import { colors } from '../../constants/Colors';

export default StyleSheet.create({
  content: {
    justifyContent: 'space-between',
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearbutton: {
    borderRadius: 25,
    width: '45%',
  },
  text: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  surface: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fde2e7',
  },
  subtext: {
    color: colors.text,
    fontWeight: '700',
  },
  timer: {
    width: 80,
    height: 80,
    borderWidth: 10,
    borderColor: colors.primary,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
