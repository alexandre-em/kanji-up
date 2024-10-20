import React, { Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

const KanjiPage = React.lazy(() => import('kanjiApp/KanjiUpAppPage'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Chargement...</div>}>
        Gateway
        <Routes>
          <Route path="/" element={<KanjiPage />} />
          {/* Autres routes */}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
