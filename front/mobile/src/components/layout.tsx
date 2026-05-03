import { useHeaderHeight } from '@react-navigation/elements';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { Colors, Text, View } from 'react-native-ui-lib';

import Spacing from './spacing';

type LayoutProps = {
  screen?: string;
};

const { height } = Dimensions.get('window');

export default function Layout({ screen, children }: LayoutProps & PropsWithChildren) {
  const { t } = useTranslation();

  const headerHeight = useHeaderHeight();

  const title = t(`${screen}.title`);
  const subtitle = t(`${screen}.subtitle`);

  return (
    <ScrollView style={styles.container}>
      <View height={height - headerHeight}>
        <Spacing y={20} />
        {title !== `${screen}.title` && <Text h1>{title}</Text>}
        {title !== `${screen}.title` && subtitle !== `${screen}.subtitle` && <Spacing y={5} />}
        {subtitle !== `${screen}.subtitle` && <Text text80L>{t(`${screen}.subtitle`)}</Text>}
        {title !== `${screen}.title` && subtitle !== `${screen}.subtitle` && <Spacing y={10} />}
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: Colors.$backgroundDefault,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
});
