import { PageLayout, logger } from 'gatewayApp/shared';
import { useEffect } from 'react';
import '../tailwind.css';

export default function KanjiHome() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            logger.log(`Service worker successfully registered : ${registration}`);
          })
          .catch((error) => {
            logger.error(`Failed to register the service worker : ${error}`);
          });
      });
    }
  }, []);

  return (
    <PageLayout
      header={{
        title: 'Kanji categories',
        subtitle: 'The 13K differents characters are sorted by difficulties and in order of learning for students in japan',
      }}
    ></PageLayout>
  );
}
