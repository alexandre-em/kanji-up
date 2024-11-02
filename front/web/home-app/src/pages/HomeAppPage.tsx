import { PageLayout, Spacer, formatDateKey, logger, useSession, useUserScore } from 'gatewayApp/shared';
import { useEffect, useMemo } from 'react';

import '../tailwind.css';
import SearchBar from 'searchApp/SearchBar';

import DailyScoreProgression from '@/components/DailyScoreProgression';
import Header from '@/components/Header';
import Menu from '@/components/Menu';

export default function HomeAppPage() {
  const { sub, name } = useSession();
  const { word, kanji, getWord, getKanji } = useUserScore();

  const totalScore = useMemo(() => {
    if (word && kanji) {
      return word.total_score + kanji.total_score || 0;
    }
    return 0;
  }, [word.total_score, kanji.total_score]);

  const dailyScore = useMemo(() => {
    if (word && kanji) {
      const formattedDate = formatDateKey();
      return (word.scores[formattedDate] || 0) + (kanji.scores[formattedDate] || 0);
    }
    return 0;
  }, [word.scores, kanji.scores]);

  useEffect(() => {
    if (sub) {
      getKanji(sub);
      getWord(sub);
    }
  }, [sub]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/home-service-worker.js')
          .then((registration) => {
            logger.log(`Service worker successfully registered : ${registration}`);
          })
          .catch((error) => {
            logger.error(`Failed to register the service worker : ${error}`);
          });
      });
    }
  });

  return (
    <PageLayout>
      <Header name={name} userId={sub} score={totalScore} />
      <Spacer size={1.2} />
      <SearchBar />
      <Spacer size={1.2} />
      <DailyScoreProgression score={dailyScore} />
      <Menu />
    </PageLayout>
  );
}
