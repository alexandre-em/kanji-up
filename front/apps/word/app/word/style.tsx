import { StyleSheet } from 'react-native';

import { colors } from 'constants/Colors';

export default StyleSheet.create({
  content: {},
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginHorizontal: 20,
    marginBottom: 5,
    backgroundColor: colors.secondary,
  },
  button: {
    width: '90%',
    borderRadius: 25,
    alignSelf: 'center',
    margin: 10,
  },
  details: {},
});
