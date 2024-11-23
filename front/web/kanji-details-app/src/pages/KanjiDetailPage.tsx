import { Badge } from '@/components/ui/badge';
import { Loading, PageLayout, Spacer, TypographyH3, TypographyP, useKanji, useKanjiSelection } from 'gatewayApp/shared';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { kanjiApiUrl } from '../constants';

export default function KanjiDetailPage() {
  const { id } = useParams();
  const { kanji, kanjiStatus, getOne } = useKanji();
  const { selectedKanji, initialize } = useKanjiSelection();

  const character = kanji && id ? kanji[id] : null;

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (id) {
      getOne(id);
    }
  }, [id]);

  if (kanjiStatus === 'failed') return <div>An error occurred</div>;
  if (kanjiStatus === 'pending' || kanjiStatus === 'idle') return <Loading />;

  return (
    <PageLayout header={{ title: `Detail of "${character?.kanji.character}"`, subtitle: character?.kanji_id }}>
      <Spacer size={1} />
      <div className="flex flex-wrap">
        <img
          src={`${kanjiApiUrl}/kanjis/image/${encodeURIComponent(character?.kanji.character || '')}`}
          alt={character?.kanji.character}
          className="w-[150px] h-[150px] text-7xl flex justify-center items-center border-muted border-2 shadow-lg"
        />
        <Spacer size={2} direction="horizontal" />
        <div className="flex flex-col">
          <TypographyH3>Readings</TypographyH3>
          <div className="flex flex-wrap items-center">
            <Badge>音</Badge>
            <Spacer size={0.5} direction="horizontal" />
            <TypographyP>
              <span className="font-bold">{character?.kanji.onyomi?.join(', ')}</span>
            </TypographyP>
          </div>
          <Spacer size={0.5} />
          <div className="flex flex-wrap items-center">
            <Badge>訓</Badge>
            <Spacer size={0.5} direction="horizontal" />
            <TypographyP>
              <span className="font-bold">{character?.kanji.kunyomi?.join(', ')}</span>
            </TypographyP>
          </div>
        </div>
      </div>

      <Spacer size={1} />

      <TypographyH3>Meanings</TypographyH3>
      <TypographyP>{character?.kanji.meaning?.join(', ')}</TypographyP>
    </PageLayout>
  );
}
