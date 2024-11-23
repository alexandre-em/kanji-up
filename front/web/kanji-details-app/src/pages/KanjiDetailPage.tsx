import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Loading,
  PageLayout,
  Spacer,
  TypographyH3,
  TypographyH4,
  TypographyMuted,
  TypographyP,
  useKanji,
  useKanjiSelection,
} from 'gatewayApp/shared';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { kanjiApiUrl } from '../constants';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Brush, CircleCheckBig } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DetailsHeaders from '@/components/Headers';

export default function KanjiDetailPage() {
  const { id } = useParams();
  const { kanji, kanjiStatus, getOne } = useKanji();
  const { selectedKanji, initialize } = useKanjiSelection();

  const character = kanji && id ? kanji[id] : null;

  const isSelected = useMemo(() => !!selectedKanji[id!]?.kanji_id, [selectedKanji]);

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
    <>
      <DetailsHeaders character={character} id={id!} />
      <PageLayout header={{ title: `Detail of "${character?.kanji.character}"`, subtitle: character?.kanji_id }}>
        <Spacer size={1} />
        <div className="flex flex-wrap">
          <div className="relative">
            {isSelected && <CircleCheckBig className="top-2 right-2 absolute text-[#10b981]" />}
            <img
              src={`${kanjiApiUrl}/kanjis/image/${encodeURIComponent(character?.kanji.character || '')}`}
              alt={character?.kanji.character}
              className="w-[150px] h-[150px] text-7xl flex justify-center items-center border-muted border-2 shadow-lg"
            />
          </div>
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
            <Spacer size={1} />
            <div className="flex">
              <Button variant={!isSelected ? 'default' : 'outline'}>{!isSelected ? 'Select' : 'Unselect'}</Button>
              <Spacer size={1} direction="horizontal" />
              <Button className="rounded-md">
                <Brush />
                Train
              </Button>
            </div>
          </div>
        </div>

        <Spacer size={1} />

        <Card className="text-[#3f3d56] shadow-lg border-0">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyH3>Meanings</TypographyH3>
            <TypographyP>{character?.kanji.meaning?.join(', ')}</TypographyP>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Radical</AccordionTrigger>
                <AccordionContent>
                  <div>
                    <Avatar>
                      <AvatarImage src={character?.radical?.image} />
                      <AvatarFallback className="font-bold text-2xl text-primary">{character?.radical?.character}</AvatarFallback>
                    </Avatar>
                    <TypographyMuted>
                      <span className="font-bold">Strokes</span> : {character?.radical?.strokes}
                    </TypographyMuted>
                    <TypographyMuted>
                      <span className="font-bold">Meanings</span> : {character?.radical?.meaning?.join(', ')}
                    </TypographyMuted>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-2">
                <AccordionTrigger>Reference</AccordionTrigger>
                <AccordionContent>
                  <TypographyMuted>
                    <span className="font-bold">Grade</span> : {character?.reference?.grade}
                  </TypographyMuted>
                  <TypographyMuted>
                    <span className="font-bold">Kodansha</span> : {character?.reference?.kodansha}
                  </TypographyMuted>
                  <TypographyMuted>
                    <span className="font-bold">Classic Nelson</span> : {character?.reference?.classic_nelson}
                  </TypographyMuted>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-last">
                <AccordionTrigger>Example</AccordionTrigger>
                <AccordionContent>
                  {character?.examples?.map((exp, i) => (
                    <div key={`${character.kanji_id}-example-${i}`}>
                      {i !== 0 && (
                        <>
                          <Spacer size={0.5} />
                          <Separator />
                          <Spacer size={0.5} />
                        </>
                      )}
                      <TypographyH4>{exp.japanese}</TypographyH4>
                      <TypographyP>{exp.meaning}</TypographyP>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </PageLayout>
    </>
  );
}
