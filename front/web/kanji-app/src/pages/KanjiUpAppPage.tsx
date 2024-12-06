import '../tailwind.css';
import { Loading } from 'gatewayApp/shared';
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import KanjiCategoryPage from './KanjiCategoryPage';
import KanjiListPage from './KanjiListPage';
import { Toaster } from '@/components/ui/toaster';

export default function KanjiHome() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/kanjis" element={<KanjiCategoryPage />} />
          <Route path="/kanjis/category" element={<KanjiListPage />} />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
}
