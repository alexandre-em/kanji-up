import React, { Suspense, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { PrivateRoute } from './components';
import InstallButton from './components/InstallButton';
import usePwaInstalled from './hooks/usePwaInstalled';
import LoginPage from './pages/login';
import NotFoundPage from './pages/notFound';
import RedirectPage from './pages/redirect';
import { Loading } from './shared';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './shared/components/ui/dialog';

const HomePage = React.lazy(() => import('homeApp/HomeAppPage'));
const KanjiPage = React.lazy(() => import('kanjiApp/KanjiUpAppPage'));
const KanjiDetailAppPage = React.lazy(() => import('kanjiDetailApp/KanjiDetailAppPage'));
const SearchPage = React.lazy(() => import('searchApp/SearchAppPage'));

export default function GatewayRouter() {
  const isInstalled = usePwaInstalled();
  const [isOpen, setOpen] = useState(true);

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/redirect" element={<RedirectPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/kanjis" element={<KanjiPage />} />
            <Route path="/kanjis/category" element={<KanjiPage />} />
            <Route path="/kanji/:id" element={<KanjiDetailAppPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Dialog defaultOpen={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Installation</DialogTitle>
            <DialogDescription>You can install the application on your device</DialogDescription>
          </DialogHeader>
          <DialogFooter>{!isInstalled && <InstallButton />}</DialogFooter>
        </DialogContent>
      </Dialog>
    </Router>
  );
}
