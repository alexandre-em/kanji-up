import '../tailwind.css';
import { logger } from 'gatewayApp/shared';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Results from '@/components/Results';
import SearchBar from '@/components/SearchBar';

const QUERY_KEY = 'query';

export default function SearchAppPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get(QUERY_KEY);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/search-service-worker.js')
          .then((registration) => {
            logger.log(`Service worker successfully registered : ${registration}`);
          })
          .catch((error) => {
            logger.error(`Failed to register the service worker : ${error}`);
          });
      });
    }
  }, []);

  return (
    <div>
      Search App page
      <SearchBar />
      <Results query={query} />
    </div>
  );
}
