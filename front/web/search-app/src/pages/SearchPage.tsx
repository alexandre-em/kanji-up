import { PageLayout, Spacer } from 'gatewayApp/shared';
import { useLocation } from 'react-router-dom';

import Library from '../assets/library.jpg';

import Results from '@/components/Results';
import SearchBar from '@/components/SearchBar';

const QUERY_KEY = 'query';
const TYPE_KEY = 'type';

export default function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get(QUERY_KEY);
  const type = searchParams.get(TYPE_KEY);
  return (
    <PageLayout canScroll={false}>
      <img
        src={Library}
        className="h-[100px] w-full object-cover rounded-br-3xl rounded-tl-3xl rounded-bl-md rounded-tr-md shadow-lg"
      />
      <Spacer size={0.7} />
      <SearchBar query={query} />
      <Spacer size={1} />
      <Results query={query} type={type} />
    </PageLayout>
  );
}
