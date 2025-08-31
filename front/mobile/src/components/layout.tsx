import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

export default function Layout({ children }: PropsWithChildren) {
  return <ScrollView style={styles.container}>{children}</ScrollView>;
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: Colors.$backgroundDefault,
  },
});
