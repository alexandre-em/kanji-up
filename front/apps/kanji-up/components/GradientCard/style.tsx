import { StyleSheet } from 'react-native';
import { colors } from '../../constants/Colors';

export default StyleSheet.create({
  card: {
    backgroundColor: '#efefef',
    height: 220,
    borderRadius: 15,
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
    margin: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    width: '100%',
    margin: 10,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginLeft: 10,
  },
  subtitle: {
    color: colors.text,
    fontSize: 17,
    marginLeft: 10,
    maxWidth: 280,
  },
});
