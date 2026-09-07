import { StyleSheet } from 'react-native';
import { Colors, Text, View } from 'react-native-ui-lib';

type ListSizeWarningProps = {
  message: string;
};

export default function ListSizeWarning({ message }: ListSizeWarningProps) {
  return (
    <View style={[styles.container, { backgroundColor: Colors.$backgroundGeneralLight }]}>
      <Text text90BO style={{ color: Colors.$textGeneral }}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});
