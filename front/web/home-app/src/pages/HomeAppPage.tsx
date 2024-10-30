import { PageLayout, Spacer, logger } from 'gatewayApp/shared';
import { useEffect } from 'react';

import Header from '@/components/Header';

import '../tailwind.css';
import DailyScoreProgression from '@/components/DailyScoreProgression';

export default function HomeAppPage() {
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
      <Header />
      <Spacer size={25} />
      <DailyScoreProgression />
    </PageLayout>
  );
}
