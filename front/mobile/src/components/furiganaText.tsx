import { StyleSheet, View as RNView } from 'react-native';
import { Text } from 'react-native-ui-lib';

type FuriganaTextProps = {
  text: string;
  reading: string;
};

export default function FuriganaText({ text, reading }: FuriganaTextProps) {
  return (
    <RNView style={styles.container}>
      <Text text100L $textNeutral>
        {reading}
      </Text>
      <Text text50BL $textPrimary center>
        {text}
      </Text>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
