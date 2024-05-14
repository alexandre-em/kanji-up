import { StyleSheet } from 'react-native';

import { colors } from '../../constants/Colors';

export default StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  kanjiSurface: {
    height: 60,
    width: 60,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  kanjiText: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
});
