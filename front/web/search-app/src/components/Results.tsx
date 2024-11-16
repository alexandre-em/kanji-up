import { Spacer, useKanji, useUser, useWord } from 'gatewayApp/shared';
import { useCallback, useEffect } from 'react';
import KanjiListItem from './resultItem/KanjiItem';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

type Results = {
  query: string | null;
};

export default function Results({ query }: Results) {
  const { search: searchKanji, searchResult: searchKanjiResult, searchStatus: searchKanjiStatus } = useKanji();
  const { search: searchWord, searchResult: searchWordResult, searchStatus: searchWordStatus } = useWord();
  const { search: searchUser, searchResult: searchUserResult, searchStatus: searchUserStatus } = useUser();

  const handleChangeSearchType = useCallback(
    (type: string) => {
      if (!query) return;
      if (type === 'kanji' && searchKanjiStatus !== 'succeeded') {
        searchKanji(query);
        return;
      }
      if (type === 'word' && searchWordStatus !== 'succeeded') {
        searchWord(query);
        return;
      }
      if (type === 'user' && searchUserStatus !== 'succeeded') {
        searchUser(query);
        return;
      }
    },
    [searchKanjiStatus, searchUserStatus, searchWordStatus, query]
  );

  useEffect(() => {
    if (query && searchKanjiStatus !== 'succeeded') {
      searchKanji(query);
    }
  }, [query, searchKanjiStatus]);

  return (
    <div className="w-full">
      <Tabs defaultValue="kanji" className="w-full" onValueChange={handleChangeSearchType}>
        <TabsList className="w-full">
          <TabsTrigger value="kanji" className="w-full">
            Kanji
          </TabsTrigger>
          <TabsTrigger value="word" className="w-full">
            Word
          </TabsTrigger>
          <TabsTrigger value="user" className="w-full">
            User
          </TabsTrigger>
        </TabsList>
        <Spacer size={0.7} />
        <Button className="w-full">Search</Button>
        <Spacer size={0.7} />
        {query && (
          <>
            <TabsContent value="kanji">
              {searchKanjiStatus &&
                searchKanjiResult[query]?.results?.length > 0 &&
                searchKanjiResult[query].results.map((kanji, i) => (
                  <>
                    {i !== 0 && <Spacer size={1} />}
                    <KanjiListItem key={kanji.kanji_id} kanji={kanji} />
                  </>
                ))}
            </TabsContent>
            <TabsContent value="word">Change your password here.</TabsContent>
            <TabsContent value="user">Change your password here.</TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
