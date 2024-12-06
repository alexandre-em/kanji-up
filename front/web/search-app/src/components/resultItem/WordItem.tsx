import { Card, CardContent } from '../ui/card';
import { Spacer, TypographyLead, TypographyMuted, TypographyP } from 'gatewayApp/shared';

export type WordType = {
  word_id: string;
  word: string[];
  reading: string[];
  definition: { meaning: string[] }[];
};

type WordListItemProps = {
  word: WordType;
};

export default function WordListItem({ word }: WordListItemProps) {
  return (
    <Card>
      <CardContent>
        <Spacer size={1} />
        <div className="flex items-center">
          <Spacer size={1} direction="horizontal" />
          <div className="flex flex-col">
            <TypographyLead>
              <span className="text-primary">{word.word.join(',')}</span>
            </TypographyLead>
            <TypographyP>【{word.reading.join(', ')}】</TypographyP>
            <Spacer size={0.5} />
            {word.definition.length > 0 && (
              <TypographyMuted>
                ({word.definition.length} definition{word.definition.length > 1 && 's'}) {word.definition[0].meaning.join(', ')}
              </TypographyMuted>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
