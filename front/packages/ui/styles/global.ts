import { StyleSheet } from 'react-native';

import { ColorType } from 'kanji-app-types';

export default function (colors: ColorType) {
  return StyleSheet.create({
    main: {
      flex: 1,
      width: '100%',
      maxWidth: 700,
      alignSelf: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background1,
      // boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px',
    },
  });
}
