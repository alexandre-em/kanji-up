import React, {useCallback, useEffect, useState} from "react";
import axios, {AxiosRequestConfig} from "axios";

import {recognitionService} from '../../services';

export default function useHandlers() {
  const [recognition, setRecognition] = useState<Pagination<RecognitionType>>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const searchRecognition = useCallback(async (page: number, query: string, options?: AxiosRequestConfig) => {
    const res = await recognitionService.getRecognitions({ page, limit: 20, query }, options)
    setRecognition(res.data);
    setPage(page);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = (e.currentTarget.elements[0] as HTMLInputElement).value;
    setSearchQuery(query);
    searchRecognition(1, query)
      .catch(console.error);
  }, [searchRecognition]);

  const handlePage = useCallback((e: React.ChangeEvent<unknown>, value: number) => {
      searchRecognition(value, searchQuery)
        .catch(console.error);
  }, [searchRecognition, searchQuery]);

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    searchRecognition(1, '', { cancelToken: cancelToken.token })
      .catch(console.error);

    return () => cancelToken.cancel();
    // eslint-disable-next-line
  }, []);

  const handleValidate = useCallback((recognitionId: string) => {
    return recognitionService.userValidation(true, recognitionId);
  }, []);

  const handleUnvalidate = useCallback((recognitionId: string) => {
    return recognitionService.userValidation(false, recognitionId);
  }, []);


  return ({
    recognition, page,
    handlePage,
    handleSearch,
    handleValidate,
    handleUnvalidate,
  });
};
