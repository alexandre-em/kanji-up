import { PageLayout, TypographyH2, TypographyP, logger } from 'gatewayApp/shared';
import { useEffect } from 'react';
import '../tailwind.css';

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
      <div className="flex bg-red-500">
        <div>
          <TypographyP>Hello Alexandreさん</TypographyP>
          <TypographyH2>Let&apos;s practice !</TypographyH2>
        </div>
      </div>
    </PageLayout>
  );
}
