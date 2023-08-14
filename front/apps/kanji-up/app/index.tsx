import { Image, SafeAreaView, Text } from 'react-native';
import { Button } from 'react-native-paper';

export default function Page() {
  return (
    <SafeAreaView style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Image source={require('../assets/images/adaptive-icon.png')} style={{ width: 200, height: 200 }} />
      <Text style={{ marginTop: 0 }}>Welcome on KanjiUp application</Text>
      <Button icon="account" mode="contained" style={{ borderRadius: 25, width: '70%' }}>
        Sign in
      </Button>
    </SafeAreaView>
  );
}
