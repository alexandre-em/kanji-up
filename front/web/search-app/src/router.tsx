import { Loading } from 'gatewayApp/shared';
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SearchAppPage from './pages/SearchAppPage';

export default function SearchRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/search" element={<SearchAppPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
