import { logger } from 'gatewayApp/shared';

export const register = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('../service-worker.js')
        .then((registration) => {
          logger.log('[Kanji-app] Service worker successfully registered :', registration);
        })
        .catch((error) => {
          logger.error('[Kanji-app] Failed to register the service worker :', error);
        });
    });
  }
};
