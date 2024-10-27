import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import store from './store';

const KanjiPage = React.lazy(() => import('kanjiApp/KanjiUpAppPage'));

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Suspense fallback={<div>Chargement...</div>}>
          Gateway
          <Routes>
            <Route path="/" element={<KanjiPage />} />
            {/* Autres routes */}
          </Routes>
        </Suspense>
      </Router>
    </Provider>
  );
}
