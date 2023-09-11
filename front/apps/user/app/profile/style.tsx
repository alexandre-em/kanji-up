import { colors } from 'constants';
import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  avatar: {
    margin: 10,
    width: '100%',
  },
  contents: {
    width: width,
    margin: 10,
  },
  score: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  ranking: {},
  follow: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', alignSelf: 'center' },
  numberText: { fontWeight: '900', color: colors.text, fontSize: 20, textAlign: 'center' },
});
