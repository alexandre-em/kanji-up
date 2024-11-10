import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Spacer } from 'gatewayApp/shared';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { Avatar } from './ui/avatar';

import 'react-circular-progressbar/dist/styles.css';
import { Skeleton } from './ui/skeleton';

type RandomKanjiProps = {
  loading?: boolean;
};

export default function RandomKanji({ loading = false }: RandomKanjiProps) {
  if (loading) return <Skeleton className="h-[66px] w-full bg-primary rounded-full" />;

  return (
    <div className="w-full bg-primary flex justify-between items-center p-2 rounded-full shadow-md">
      <div className="flex flex-nowrap">
        <Avatar>
          <AvatarImage src="https://api.kanjiup.alexandre-em.fr/api/v1/kanjis/image/%E4%B8%80" alt="1" className="bg-white" />
          <AvatarFallback>1</AvatarFallback>
        </Avatar>

        <Spacer size={0.5} direction="horizontal" />

        {/* detail */}
        <div className="flex flex-col justify-center">
          <div className="text-md font-semibold text-white">One</div>
          <div className="text-sm font-extralight text-muted">ichi, hitotsu</div>
        </div>
      </div>

      <div className="w-[50px] h-[50px]">
        <CircularProgressbar
          value={0.5}
          maxValue={1}
          text={`10%`}
          styles={buildStyles({ pathColor: 'white', trailColor: '#ffffff60', textColor: '#fff' })}
        />
      </div>
    </div>
  );
}
