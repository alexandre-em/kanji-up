import { StyleSheet } from 'react-native';

import { colors } from 'constants/Colors';

export default StyleSheet.create({
  content: {
    height: '100%',
    width: '100%',
    padding: 20,
    paddingBottom: 0,
  },
  surface: {
    margin: 10,
    padding: 10,
    width: '90%',
    borderRadius: 15,
    alignSelf: 'center',
  },
  search: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fde2e7',
  },
  icon: {
    width: 45,
    height: 45,
    marginRight: 10,
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: colors.primary,
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 45,
  },
});
