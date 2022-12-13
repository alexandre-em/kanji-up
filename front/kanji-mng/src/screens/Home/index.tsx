import {useEffect, useMemo, useRef} from "react";
import {Pagination} from "@mui/material";
import {useNavigate, useSearchParams} from "react-router-dom";
import jwtDecode from "jwt-decode";

import useHandlers from './useHandlers';
import AppNav from "../../components/AppNav";
import {Main, Content, Item, Title, Footer} from "./styles";
import SearchBar from "../../components/SearchBar";
import AUTH_URL from "../../const/auth";

export default function Home() {
  const navigate = useNavigate();
  const mainDivRef: React.MutableRefObject<HTMLDivElement | undefined> = useRef();
  const { kanjis, page, handlePage, handleSearch } = useHandlers();
  const [searchParams] = useSearchParams();

  const height = useMemo(() => {
    if (!mainDivRef || !mainDivRef.current) { return 0; }

    return mainDivRef.current.clientHeight - 89;
  }, [mainDivRef]);

  useEffect(() => {
    const newToken = searchParams.get('access_token');

    if(!newToken) {
      const prevToken = localStorage.getItem('access_token') || '';

      if (!prevToken) {
        window.location.replace(AUTH_URL);
      }

      const decoded: any = jwtDecode(prevToken);

      if(!decoded || (decoded && decoded.exp && new Date() >= new Date(decoded.exp * 1000))) {
        localStorage.removeItem('access_token');
        window.location.replace(AUTH_URL);
      }

    } else {
      const decoded: any = jwtDecode(newToken);

      if(decoded && decoded.exp && new Date() >= new Date(decoded.exp * 1000)) {
        window.location.replace(AUTH_URL);
      }

      localStorage.setItem('access_token', newToken);
    }
  }, [searchParams])

  if (!kanjis) { return null; }

  return <div style={{ width: '100%', height: '100%' }} ref={mainDivRef as any}>
    <AppNav />
    <Main height={height}>
      <SearchBar handleSearch={handleSearch} />
      <Title>Result : {kanjis.docs.length * kanjis.page} out {kanjis.totalDocs}</Title>
      <Content>
        {kanjis.docs.map(({ kanji }) => (
          <Item key={kanji.character} elevation={6} onClick={() => navigate(`/draw/${kanji.character}`)}>
            {kanji.character}
          </Item>
        ))}
      </Content>
      <Footer>
        <Pagination count={kanjis.totalPages}  page={page} onChange={handlePage} color="primary" />
      </Footer>
    </Main>
  </div>;
};
