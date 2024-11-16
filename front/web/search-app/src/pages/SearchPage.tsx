import { PageLayout, Spacer, TypographyH1 } from 'gatewayApp/shared';
import { useLocation } from 'react-router-dom';

import Results from '@/components/Results';
import SearchBar from '@/components/SearchBar';

const QUERY_KEY = 'query';

export default function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get(QUERY_KEY);
  return (
    <PageLayout>
      <TypographyH1>Searching : "{query}" </TypographyH1>
      <Spacer size={0.7} />
      <SearchBar />
      <Spacer size={1} />
      <Results query={query} />
    </PageLayout>
  );
}
