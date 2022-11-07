import {AxiosRequestConfig} from "axios";
import {useCallback, useEffect, useState} from "react";
import {kanjiService} from "../../services";

export default function useHandlers() {
  const [kanjis, setKanjis] = useState<Pagination<KanjiType> | undefined>();
  const [page, setPage] = useState<number>(1);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchKanjis = useCallback(async (page: number, options?: AxiosRequestConfig) => {
    const results = await kanjiService.getKanjis({ page, limit: 100 }, options);
    setKanjis(results.data);
    setPage(page);
  }, []);

  const searchKanjis = useCallback(async (page: number, query: string) => {
    const res = await kanjiService.searchKanjis({ page, limit: 100, query })
    setKanjis(res.data);
    setPage(page);
    setIsSearching(true);
  }, []);

  const handlePage = useCallback((e: React.ChangeEvent<unknown>, value: number) => {
    if (!isSearching) {
      fetchKanjis(value)
        .catch(console.error);
    } else {
      searchKanjis(value, searchQuery)
        .catch(console.error);
    }
  }, [fetchKanjis, isSearching, searchKanjis, searchQuery]);

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = (e.currentTarget.elements[0] as HTMLInputElement).value;
    setSearchQuery(query);
    searchKanjis(1, query)
      .catch(console.error);
  }, [searchKanjis]);

  useEffect(() => {
    fetchKanjis(1);
    // eslint-disable-next-line
  }, []);

  return {
    kanjis, page,
    handlePage,
    handleSearch
  };
};
