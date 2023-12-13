import { View } from 'react-native';
import React from 'react';
import { Button, IconButton, TextInput } from 'react-native-paper';

import { useGameContext } from 'providers/game.provider';

type ContentType = {
  input: string;
  error: boolean;
  onChange: (arg: string) => void;
  onSkip: () => void;
  onValidate: () => void;
};

export default function Content({ input, error, onSkip, onValidate, onChange }: ContentType) {
  const GameContext = useGameContext();

  // TODO: Remove (for testing purpose)
  // React.useEffect(() => {
  //   if (GameContext.current) {
  //     onChange(GameContext.current?.question.answer[0]);
  //   }
  // }, [GameContext.current]);

  return (
    <View style={{ padding: 15, backgroundColor: '#fff', borderRadius: 15 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          placeholder="Insert your answer"
          value={input}
          onChangeText={onChange}
          error={error}
          mode="outlined"
          style={{ backgroundColor: '#fff' }}
        />
        <IconButton icon="send" mode="outlined" onPress={onValidate} />
      </View>
      <Button onPress={onSkip} disabled={GameContext.skipUsed}>
        Skip
      </Button>
    </View>
  );
}
