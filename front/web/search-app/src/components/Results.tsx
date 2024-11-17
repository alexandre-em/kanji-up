import { Spacer, TypographyH2, useKanji, useUser, useWord } from 'gatewayApp/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import KanjiListItem from './resultItem/KanjiItem';
import UserListItem from './resultItem/UserItem';
import WordListItem from './resultItem/WordItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

type Results = {
  query: string | null;
  type: string | null;
};

const PAGINATION_LIMIT = 10;

export default function Results({ query, type }: Results) {
  const { search: searchKanji, searchResult: searchKanjiResult, searchStatus: searchKanjiStatus } = useKanji();
  const { search: searchWord, searchResult: searchWordResult, searchStatus: searchWordStatus } = useWord();
  const { search: searchUser, searchResult: searchUserResult, searchStatus: searchUserStatus } = useUser();
  const [selectedType, setSelectedType] = useState(type || 'kanji');

  const handleChangeSearchType = useCallback(
    (type: string) => {
      setSelectedType(type);
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

  const handleLoad = useCallback(async () => {
    if (query) {
      switch (selectedType) {
        case 'kanji':
          if (
            searchKanjiResult[query].current < searchKanjiResult[query].totalPages &&
            searchKanjiResult[query].results.length !== searchKanjiResult[query].totalDocs
          )
            searchKanji(query, PAGINATION_LIMIT, searchKanjiResult[query].current + 1);
          break;
        case 'word':
          if (
            searchWordResult[query].current < searchWordResult[query].totalPages &&
            searchWordResult[query].results.length !== searchWordResult[query].totalDocs
          )
            searchWord(query, PAGINATION_LIMIT, searchWordResult[query].current + 1);
          break;
        default:
          break;
      }
    }
  }, [query, selectedType, searchKanjiResult, searchWordResult]);

  const resultCount = useMemo(() => {
    if (!query) return 0;
    switch (selectedType) {
      case 'kanji':
        return searchKanjiResult[query]?.totalDocs || 0;
      case 'word':
        return searchWordResult[query]?.totalDocs || 0;
      case 'user':
        return searchUserResult[query]?.length || 0;
      default:
        return 0;
    }
  }, [selectedType, query, searchUserResult, searchWordResult, searchKanjiResult]);

  useEffect(() => {
    if (query && searchKanjiStatus === 'idle') {
      searchKanji(query);
    }
  }, [query, searchKanjiStatus]);

  return (
    <div className="w-full h-full">
      <Tabs defaultValue={selectedType} className="w-full h-[calc(100dvh-400px)]" onValueChange={handleChangeSearchType}>
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
        <TypographyH2>Results ({resultCount}) :</TypographyH2>
        {query && (
          <>
            <ReactVirtualizedAutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <>
                  <TabsContent value="kanji">
                    {searchKanjiStatus === 'succeeded' && searchKanjiResult[query]?.totalDocs && (
                      <InfiniteLoader
                        isItemLoaded={(index) => index + 1 < searchKanjiResult[query].results.length}
                        itemCount={searchKanjiResult[query].results.length}
                        loadMoreItems={handleLoad}
                      >
                        {({ onItemsRendered, ref }) => (
                          <FixedSizeList
                            height={height}
                            width={width}
                            itemSize={150}
                            itemCount={searchKanjiResult[query].results.length}
                            onItemsRendered={onItemsRendered}
                            itemData={searchKanjiResult[query].results}
                            ref={ref}
                          >
                            {({ index, style }) => (
                              <div style={style} className="my-2">
                                <KanjiListItem kanji={searchKanjiResult[query].results[index]} />
                              </div>
                            )}
                          </FixedSizeList>
                        )}
                      </InfiniteLoader>
                    )}
                  </TabsContent>
                  <TabsContent value="word">
                    {searchWordStatus === 'succeeded' && searchWordResult[query]?.totalDocs && (
                      <InfiniteLoader
                        isItemLoaded={(index) => index + 1 < searchWordResult[query].results.length}
                        itemCount={searchWordResult[query].results.length}
                        loadMoreItems={handleLoad}
                      >
                        {({ onItemsRendered, ref }) => (
                          <FixedSizeList
                            height={height}
                            width={width}
                            itemSize={150}
                            itemCount={searchWordResult[query].results.length}
                            onItemsRendered={onItemsRendered}
                            itemData={searchWordResult[query].results}
                            ref={ref}
                          >
                            {({ index, style }) => (
                              <div style={style} className="my-2">
                                <WordListItem word={searchWordResult[query].results[index]} />
                              </div>
                            )}
                          </FixedSizeList>
                        )}
                      </InfiniteLoader>
                    )}
                  </TabsContent>
                </>
              )}
            </ReactVirtualizedAutoSizer>
            <TabsContent value="user">
              {searchUserResult[query]?.map((usr, i) => (
                <div key={usr.user_id}>
                  {i !== 0 && <Spacer size={1} />}
                  <UserListItem user={usr} />
                </div>
              ))}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
