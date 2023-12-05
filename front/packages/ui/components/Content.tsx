import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native';
import { Appbar } from 'react-native-paper';

import { useColor } from 'kanji-app-ui';

import global from '../styles/global';

type ContentType = {
  style?: object;
  header?: {
    title: string;
    right?: React.JSX.Element;
    style?: object;
    onBack: () => void;
  } | null;
  children: ReactNode;
};

export default function Content({ style, header = null, children }: ContentType) {
  const colors = useColor();

  if (!colors) return null;

  return (
    <SafeAreaView style={[global(colors).main, style]}>
      {header && (
        <Appbar.Header style={[{ backgroundColor: colors.primary }, header.style]}>
          <Appbar.BackAction onPress={header.onBack} />
          <Appbar.Content title={header.title} titleStyle={{ color: '#fff', fontWeight: '699', fontSize: 17 }} />
          {header.right}
        </Appbar.Header>
      )}
      {children}
    </SafeAreaView>
  );
}
