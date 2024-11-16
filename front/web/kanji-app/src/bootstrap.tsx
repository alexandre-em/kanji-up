import React from 'react';
import ReactDOM from 'react-dom/client';
import { register } from './components/sw';

import KanjiAppPage from './pages/KanjiUpAppPage';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('kanji-root') as HTMLElement);

register();

root.render(
  <React.StrictMode>
    <KanjiAppPage />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
