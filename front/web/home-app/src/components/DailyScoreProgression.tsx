import { TypographyH2, TypographyH3 } from 'gatewayApp/shared';
import { Card, CardFooter, CardHeader } from './ui/card';
import { Progress } from './ui/progress';

export default function DailyScoreProgression() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <TypographyH2>Today&apos;s objectives</TypographyH2>
          <TypographyH3>Let&apos;s begin !</TypographyH3>
        </div>
      </CardHeader>
      <CardFooter>
        <Progress value={33} />
      </CardFooter>
    </Card>
  );
}
