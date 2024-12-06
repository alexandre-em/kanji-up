import React, { useCallback } from 'react';

import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Spacer, TypographyLead, TypographyMuted, TypographyP } from 'gatewayApp/shared';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export type KanjiType = {
  kanji_id: string;
  kanji: {
    character_id: string;
    character: string;
    onyomi: string[];
    kunyomi: string[];
    meaning: string[];
  };
};

type KanjiListItemProps = {
  kanji: KanjiType;
};

export default function KanjiListItem({ kanji }: KanjiListItemProps) {
  const handleRedirection = useCallback(() => {
    window.location.href = `/kanji/${kanji.kanji_id}`;
  }, []);

  return (
    <Card className="cursor-pointer" onClick={handleRedirection}>
      <CardContent>
        <Spacer size={1} />
        <div className="flex items-center">
          <Avatar>
            <AvatarImage
              src={`${process.env.REACT_APP_KANJI_BASE_URL}/kanjis/image/${encodeURIComponent(kanji.kanji.character)}`}
            />
            <AvatarFallback>{kanji.kanji.character}</AvatarFallback>
          </Avatar>
          <Spacer size={1} direction="horizontal" />
          <div className="flex flex-col">
            <TypographyLead>
              <span className="text-primary">{kanji.kanji.character}</span>
            </TypographyLead>
            <div className="flex flex-wrap">
              <TypographyP>
                <Badge>On</Badge> {kanji.kanji.onyomi.join(', ')}
              </TypographyP>
              <Spacer size={1} direction="horizontal" />
              <TypographyP>
                <Badge>Kun</Badge> {kanji.kanji.kunyomi.join(', ')}
              </TypographyP>
            </div>
            <Spacer size={0.5} />
            <TypographyMuted>{kanji.kanji.meaning.join(', ')}</TypographyMuted>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
