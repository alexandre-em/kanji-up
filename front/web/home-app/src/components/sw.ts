import { logger } from 'gatewayApp/shared';

export const register = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: 'http://localhost:3009/' })
        .then((registration) => {
          logger.info('[Home-app] Service worker successfully registered :', registration);
        })
        .catch((error) => {
          logger.error('[Home-app] Failed to register the service worker :', error);
        });
    });
  }
};
