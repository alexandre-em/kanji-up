import { formatScore, TypographyH2, TypographyH3, TypographyLarge, TypographySmall } from 'gatewayApp/shared';
import Certification from './svg/Certification';
import Reminders from './svg/ReminderSvg';
import Trip from './svg/TripSvg';
import { Card, CardFooter, CardHeader } from './ui/card';
import { Progress } from './ui/progress';

const steps = [500, 1500, 5000];

const progression = (value: number) => {
  if (value > steps[2])
    return {
      svg: <Certification width={150} height={100} />,
    };

  if (value > steps[1])
    return {
      svg: <Reminders width={150} height={100} />,
    };

  return {
    svg: <Trip width={150} height={100} />,
  };
};

type DailyScoreProgressionProps = {
  score: number;
};

export default function DailyScoreProgression({ score }: DailyScoreProgressionProps) {
  const ProgressionSvg = ({ value }: { value: number }) => progression(value).svg;

  return (
    <Card className="bg-[#fde2e7]">
      <CardHeader className="flex flex-row justify-between">
        <div>
          <TypographyH2>Today&apos;s objectives</TypographyH2>
          <TypographyH3>Let&apos;s begin !</TypographyH3>
          <span className="flex">
            <TypographyLarge>
              <div className="text-primary font-light text-2xl">{formatScore(score)}</div>
            </TypographyLarge>
            <TypographySmall>pts</TypographySmall>
            <TypographyLarge>
              <div className="font-light text-2xl">/ {steps[2]}</div>
            </TypographyLarge>
          </span>
        </div>
        <ProgressionSvg value={score} />
      </CardHeader>
      <CardFooter>
        <Progress value={Math.min(score / steps[2], 1) * 100} className="bg-[#ffffff70]" />
      </CardFooter>
    </Card>
  );
}
