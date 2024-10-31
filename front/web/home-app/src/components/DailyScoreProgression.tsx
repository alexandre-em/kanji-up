import { TypographyH2, TypographyH3, TypographyLarge } from 'gatewayApp/shared';
import Certification from './svg/Certification';
import Reminders from './svg/ReminderSvg';
import Trip from './svg/TripSvg';
import { Card, CardFooter, CardHeader } from './ui/card';
import { Progress } from './ui/progress';

const steps = [2000, 5000, 10000];

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

export default function DailyScoreProgression() {
  const ProgressionSvg = ({ value }: { value: number }) => progression(value).svg;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <TypographyH2>Today&apos;s objectives</TypographyH2>
          <TypographyH3>Let&apos;s begin !</TypographyH3>
          <TypographyLarge>{}</TypographyLarge>
        </div>
        <ProgressionSvg value={1000} />
      </CardHeader>
      <CardFooter>
        <Progress value={33} />
      </CardFooter>
    </Card>
  );
}
