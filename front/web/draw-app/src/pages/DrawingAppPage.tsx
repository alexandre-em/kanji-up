import React, { useEffect } from 'react';
import './tailwind.css';
import { logger } from 'gatewayApp/shared';

export default function DrawingAppPage() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/drawing-service-worker.js')
          .then((registration) => {
            logger.log(`Service worker successfully registered : ${registration}`);
          })
          .catch((error) => {
            logger.error(`Failed to register the service worker : ${error}`);
          });
      });
    }
  }, []);

  return <div>Welcome to Word app</div>;
}
