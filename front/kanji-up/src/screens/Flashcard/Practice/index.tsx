import React, {useCallback} from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';
import colors from '../../../constants/colors';

import styles from '../style';

export default function Practice({ kanji }: { kanji: KanjiType[] }) {
  const handleNext = useCallback(() => {

  }, []);

  const handleReverse = useCallback(() => {

  }, []);

  return (
    <View style={styles.content}>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button mode="outlined" icon="eraser-variant" color={colors.primary} style={styles.clearbutton} onPress={handleReverse}>
          Reverse
        </Button>
        <Button mode="contained" icon="checkbox-marked-circle-outline" color={colors.primary} style={styles.clearbutton} onPress={handleNext}>
          Next
        </Button>
      </View>
    </View>
  );
}
