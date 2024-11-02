import { useKanji } from 'gatewayApp/shared';
import { useEffect } from 'react';

type Results = {
  query: string | null;
};

export default function Results({ query }: Results) {
  const { search, searchResult } = useKanji();

  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query]);

  if (!query) return <div>No Results</div>;

  return (
    <div>
      Results
      {searchResult[query].docs.map((res) => (
        <div key={res.kanji_id}>{res.kanji.character}</div>
      ))}
    </div>
  );
}
