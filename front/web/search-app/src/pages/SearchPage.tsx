import { useLocation } from 'react-router-dom';

import Results from '@/components/Results';
import SearchBar from '@/components/SearchBar';

const QUERY_KEY = 'query';

export default function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get(QUERY_KEY);
  return (
    <div>
      Search App page
      <SearchBar />
      <Results query={query} />
    </div>
  );
}
