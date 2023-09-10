import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  avatar: {
    margin: 10,
  },
  contents: {
    width: width > height ? width - 200 : width,
    margin: 10,
  },
  score: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  ranking: {},
});
