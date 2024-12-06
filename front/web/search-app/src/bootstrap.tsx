import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { register } from './components/sw';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('search-root') as HTMLElement);

register();

root.render(
  <React.StrictMode>
    Kanji
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
