import React, { Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { PrivateRoute } from './components';
import LoginPage from './pages/login';

const KanjiPage = React.lazy(() => import('kanjiApp/KanjiUpAppPage'));

export default function GatewayRouter() {
  return (
    <Router>
      <Suspense fallback={<div>Chargement...</div>}>
        Gateway
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<KanjiPage />} />
          </Route>
          {/* Autres routes */}
        </Routes>
      </Suspense>
    </Router>
  );
}
