import { Platform, StatusBar, StyleSheet } from 'react-native';

import { colors } from '../constants/Colors';

export default StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgb(248, 248, 248)',
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
  subtitle: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  header: {
    flex: 0.09,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    flexWrap: 'wrap',
  },
  headerTitle: {
    backgroundColor: colors.primary,
    padding: 5,
    borderRadius: 25,
  },
  search: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 25,
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 4px',
  },
});
