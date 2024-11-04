import React, { Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { PrivateRoute } from './components';
import LoginPage from './pages/login';
import RedirectPage from './pages/redirect';
import { Loading } from './shared';

const HomePage = React.lazy(() => import('homeApp/HomeAppPage'));
// const KanjiPage = React.lazy(() => import('kanjiApp/KanjiUpAppPage'));

export default function GatewayRouter() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/redirect" element={<RedirectPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/kanji" element={<KanjiPage />} /> */}
          </Route>
          {/* Autres routes */}
        </Routes>
      </Suspense>
    </Router>
  );
}
