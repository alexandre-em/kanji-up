import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { KANJI_PROGRESSION_MAX, Spacer, useKanji, useSession, useUserScore } from 'gatewayApp/shared';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { Avatar } from './ui/avatar';

import 'react-circular-progressbar/dist/styles.css';
import { Skeleton } from './ui/skeleton';
import { useEffect } from 'react';

export default function RandomKanji() {
  const { random, randomStatus, getRandom } = useKanji();
  const { sub } = useSession();
  const { kanji, getKanji } = useUserScore();

  useEffect(() => {
    getRandom(1);
    if (sub) getKanji(sub);
  }, [sub]);

  if (random?.length < 1) return <Skeleton className="h-[66px] w-full bg-primary rounded-full" />;
  if (randomStatus !== 'succeeded') return <Skeleton className="h-[66px] w-full bg-primary rounded-full" />;

  return (
    <div className="w-full bg-primary flex justify-between items-center p-2 rounded-full shadow-md">
      <div className="flex flex-nowrap">
        <Spacer size={0.5} direction="horizontal" />
        <Avatar>
          <AvatarImage
            src={`${process.env.REACT_APP_KANJI_BASE_URL}/kanjis/image/${encodeURIComponent(random[0].kanji[0].character || '')}`}
            className="bg-white p-1"
          />
          <AvatarFallback>{random[0].kanji[0].character}</AvatarFallback>
        </Avatar>

        <Spacer size={0.5} direction="horizontal" />

        {/* detail */}
        <div className="flex flex-col justify-center">
          <div className="text-md font-semibold text-white">{random[0].kanji[0].character}</div>
          <div className="text-sm font-extralight text-muted">{random[0].kanji[0].meaning?.join(', ').substring(0, 30)}...</div>
        </div>
      </div>

      <div className="w-[50px] h-[50px]">
        <CircularProgressbar
          value={(kanji.progression[random[0].kanji_id] || 0) / KANJI_PROGRESSION_MAX}
          maxValue={1}
          text={`${((kanji.progression[random[0].kanji_id] || 0) / KANJI_PROGRESSION_MAX) * 100}%`}
          styles={buildStyles({ pathColor: 'white', trailColor: '#ffffff60', textColor: '#fff' })}
        />
      </div>
    </div>
  );
}
