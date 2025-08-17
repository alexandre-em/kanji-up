import { Colors, Text, View } from 'react-native-ui-lib';

import Welcome from '../../components/svg/welcome';
import { StepProps } from '.';

export default function Step1({ step }: StepProps) {
  if (step !== 0) return null;

  return (
    <View height="90%" center>
      <Text h1 highlightString="KanjiUp" highlightStyle={{ color: Colors.$textMajor }} marginB-20>
        Welcome to KanjiUp
      </Text>
      <Welcome width={300} height={300} />
      <Text h4 center highlightString="Level up" highlightStyle={{ color: Colors.$textMajor }}>
        Level up your kanji knowledge with KanjiUp!
      </Text>
    </View>
  );
}
