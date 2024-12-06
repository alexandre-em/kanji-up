import { Loading } from 'gatewayApp/shared';
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import KanjiDetailPage from './KanjiDetailPage';
import '../tailwind.css';
import { HelmetProvider } from 'react-helmet-async';

export default function KanjiDetailApp() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/kanji/:id" element={<KanjiDetailPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}
