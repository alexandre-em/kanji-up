import { Platform, StatusBar, StyleSheet } from 'react-native';

import { colors } from '../constants/Colors';

export default StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    margin: 10,
    marginLeft: 20,
    color: colors.text,
  },
});
