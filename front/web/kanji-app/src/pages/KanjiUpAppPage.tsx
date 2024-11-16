import { PageLayout, logger } from 'gatewayApp/shared';
import { useEffect } from 'react';
import '../tailwind.css';

export default function KanjiHome() {
  return (
    <PageLayout
      header={{
        title: 'Kanji categories',
        subtitle: 'The 13K differents characters are sorted by difficulties and in order of learning for students in japan',
      }}
    ></PageLayout>
  );
}
