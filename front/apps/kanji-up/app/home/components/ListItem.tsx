import { Href, router } from 'expo-router';

import { GradientCard } from 'kanji-app-ui';

import { list } from '../constants';

export default function ListItem({ item }: { item: (typeof list)[0] }) {
  return (
    <GradientCard
      onPress={() => router.push(item.screen as Href<string>)}
      image={item.image}
      title={item.title}
      subtitle={item.subtitle}
      buttonTitle={item.buttonTitle}
      disabled={false}
    />
  );
}
