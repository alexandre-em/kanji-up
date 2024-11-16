import '../tailwind.css';
import { Loading, logger } from 'gatewayApp/shared';
import { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import SearchPage from './SearchPage';

export default function SearchAppPage() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
