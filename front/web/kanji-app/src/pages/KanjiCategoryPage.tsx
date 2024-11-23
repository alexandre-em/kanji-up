import { PageLayout, Spacer } from 'gatewayApp/shared';

import CategoryItem from '@/components/CategoryItem';
import { categories } from '@/constants';

export default function KanjiCategory() {
  return (
    <PageLayout
      header={{
        title: 'Kanji categories',
        subtitle: 'The 13K differents characters are sorted by difficulties and in order of learning for students in japan',
      }}
    >
      {categories.map((category) => (
        <>
          <Spacer size={1} />
          <CategoryItem key={category.title} category={category} />
        </>
      ))}
    </PageLayout>
  );
}
