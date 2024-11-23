import { Loading } from 'gatewayApp/shared';
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import KanjiDetailPage from './KanjiDetailPage';
import '../tailwind.css';

export default function KanjiDetailApp() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/kanji/:id" element={<KanjiDetailPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
