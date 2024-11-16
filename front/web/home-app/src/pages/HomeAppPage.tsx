import { PageLayout, Spacer, TypographyH2, formatDateKey, logger, useSession, useUserScore } from 'gatewayApp/shared';
import { useEffect, useMemo } from 'react';

import '../tailwind.css';
import SearchBar from 'searchApp/SearchBar';

import DailyScoreProgression from '@/components/DailyScoreProgression';
import Header from '@/components/Header';
import Menu from '@/components/Menu';
import RandomKanji from '@/components/RandomKanji';

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

  return (
    <PageLayout>
      <Header name={name} userId={sub} score={totalScore} />
      <div className="overflow-y-auto">
        <Spacer size={1.2} />
        <SearchBar />
        <Spacer size={1.2} />
        <DailyScoreProgression score={dailyScore} />
        <Spacer size={1.2} />
        <TypographyH2>Random kanji</TypographyH2>
        <Spacer size={0.5} />
        <RandomKanji />
        <Spacer size={1.2} />
        <TypographyH2>Menu</TypographyH2>
        <Menu />
      </div>
    </PageLayout>
  );
}
