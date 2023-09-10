import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  iconsHeader: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    margin: 10,
    width: '100%',
  },
  contents: {
    width: width,
    margin: 10,
  },
});
