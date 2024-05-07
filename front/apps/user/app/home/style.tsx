import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  avatar: {
    margin: 10,
  },
  contents: {
    width: 'calc(100% - 200px)',
    minWidth: 300,
    margin: 10,
  },
  ranking: {},
});
