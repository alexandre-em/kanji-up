import { useCallback } from 'react';
import { Colors, Text, TextField, View } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../hooks/useStore';
import { selectUserName, user } from '../../store/slices/user';
import { StepProps } from '.';

export default function Step3({ step }: StepProps) {
  const userName = useSelector(selectUserName);
  const dispatch = useAppDispatch();

  const handleChange = useCallback(
    (value: string) => {
      dispatch(user.actions.update({ name: value }));
    },
    [dispatch],
  );

  if (step !== 2) return null;

  return (
    <View height="90%" paddingT-50 centerH>
      <Text h1 highlightString="こんにちは" highlightStyle={{ color: Colors.$textMajor }} marginB-10>
        こんにちは 👋
      </Text>
      <Text h3 marginB-20>
        how should we call you ?
      </Text>
      <View width="100%">
        <TextField
          label="Name"
          placeholder="John Smith"
          value={userName}
          onChangeText={handleChange}
          showClearButton
          showMandatoryIndication
          enableErrors
          validate={['required']}
          validateOnChange
          validationMessage={['Required']}
          validationMessagePosition={TextField.validationMessagePositions.BOTTOM}
          autoFocus
          preset="outline"
        />
      </View>
    </View>
  );
}
