import React from 'react';
import ReactDOM from 'react-dom/client';

import './tailwind.css';
import KanjiHome from './pages/KanjiUpAppPage';
import reportWebVitals from './reportWebVitals';
import { logger } from 'gatewayApp/shared';

const root = ReactDOM.createRoot(document.getElementById('search-root') as HTMLElement);

root.render(
  <React.StrictMode>
    Kanji
    <KanjiHome />
  </React.StrictMode>
);

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
