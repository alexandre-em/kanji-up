import { PageLayout, TypographyH1, TypographyP, logger, useSession } from 'gatewayApp/shared';
import React, { useCallback, useEffect, useState } from 'react';
import '../tailwind.css';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export default function HomeAppPage() {
  const session = useSession();
  const [app, setApp] = useState<'kanji' | 'word'>('kanji');

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger.log('Submit', e);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/home-service-worker.js')
          .then((registration) => {
            logger.log(`Service worker successfully registered : ${registration}`);
          })
          .catch((error) => {
            logger.error(`Failed to register the service worker : ${error}`);
          });
      });
    }
  });

  return (
    <PageLayout>
      <div className="flex justify-between items-center m-2">
        <div>
          <TypographyP>
            Hello <span className="font-bold text-primary">Alexandre</span>さん,
          </TypographyP>
          <TypographyH1>Let&apos;s practice !</TypographyH1>
        </div>

        <Avatar className="border-[#3f3d5670] border-[1px]">
          <AvatarImage src={`https://auth.kanjiup.alexandre-em.fr/users/profile/image/${session?.sub}`} />
          <AvatarFallback>{session.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>

      <form onSubmit={handleSearch} className="mx-5">
        <Input type="search" placeholder="Search..." className="rounded-full shadow-md" autoFocus={false} />
      </form>
    </PageLayout>
  );
}
