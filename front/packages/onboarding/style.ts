import { StyleSheet } from 'react-native';

export default function initStyle(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: 700,
    },
    image: {
      resizeMode: 'cover',
    },
    title: {
      fontFamily: 'RobotoBold',
      fontSize: 36,
      color: colors.primary,
      textAlign: 'center',
      paddingTop: 64,
      paddingBottom: 32,
    },
    body: {
      fontFamily: 'Roboto',
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
    },
    buttons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  });
}
