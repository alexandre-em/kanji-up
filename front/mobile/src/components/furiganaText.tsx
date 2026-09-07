import { StyleSheet, View as RNView } from 'react-native';
import { Text } from 'react-native-ui-lib';

type FuriganaSize = 'XS' | 'S' | 'L' | 'XL';

type FuriganaTextProps = {
  text: string;
  reading: string;
  size?: 'large' | 'small';
  furiganaSize?: FuriganaSize;
};

export default function FuriganaText({ text, reading, size = 'large', furiganaSize = 'XS' }: FuriganaTextProps) {
  const readingStyle =
    furiganaSize === 'XS'
      ? styles.readingXS
      : furiganaSize === 'S'
        ? styles.readingS
        : furiganaSize === 'L'
          ? styles.readingL
          : styles.readingXL;

  return (
    <RNView style={styles.container}>
      <Text $textNeutral style={readingStyle}>
        {reading}
      </Text>
      {size === 'large' ? (
        <Text text50BL $textPrimary center>
          {text}
        </Text>
      ) : (
        <Text text90BO $textPrimary center>
          {text}
        </Text>
      )}
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  readingXS: {
    fontSize: 8,
  },
  readingS: {
    fontSize: 10,
  },
  readingL: {
    fontSize: 12,
  },
  readingXL: {
    fontSize: 14,
  },
});
