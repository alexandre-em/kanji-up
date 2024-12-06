import { TypographyH1, TypographyP, formatScore } from 'gatewayApp/shared';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from './ui/badge';

type HeaderProps = {
  name: string;
  userId: string;
  score: number;
};

export default function Header({ name, userId, score }: HeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <TypographyP>
          Hello <span className="font-bold text-primary">{name}</span>さん,
        </TypographyP>
        <TypographyH1>Let&apos;s practice !</TypographyH1>
      </div>

      <div className="flex items-center">
        <Badge className="mr-2 h-8">{formatScore(score)}</Badge>
        <Avatar className="border-[#3f3d5670] border-[1px]">
          <AvatarImage src={`https://auth.kanjiup.alexandre-em.fr/users/profile/image/${userId}`} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
