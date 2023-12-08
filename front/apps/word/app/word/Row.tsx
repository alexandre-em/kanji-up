import { View, Text } from 'react-native';
import React from 'react';
import { colors } from 'constants';
import { Divider } from 'react-native-paper';

type Row = {
  title: string;
  description: string;
};

export default function Row({ title, description }) {
  return (
    <View>
      <View style={{ margin: 10, marginLeft: 15 }}>
        <Text style={{ color: colors.text }}>{title}</Text>
        <Text style={{ color: colors.text, opacity: 0.5 }}>{description}</Text>
      </View>
      <Divider />
    </View>
  );
}
