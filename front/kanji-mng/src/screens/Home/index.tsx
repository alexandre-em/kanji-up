import {useMemo, useRef} from "react";
import {Pagination} from "@mui/material";

import useHandlers from './useHandlers';
import AppNav from "../../components/AppNav";
import {Main, Content, Item, Title, Footer} from "./styles";
import SearchBar from "../../components/SearchBar";

export default function Home() {
  const mainDivRef: React.MutableRefObject<HTMLDivElement | undefined> = useRef();
  const { kanjis, page, handlePage, handleSearch } = useHandlers();

  const height = useMemo(() => {
    if (!mainDivRef || !mainDivRef.current) { return 0; }

    return mainDivRef.current.clientHeight - 89;
  }, [mainDivRef]);


  if (!kanjis) { return null; }

  return <div style={{ width: '100%', height: '100%' }} ref={mainDivRef as any}>
    <AppNav />
    <Main height={height}>
      <SearchBar handleSearch={handleSearch} />
      <Title>Result : {kanjis.docs.length} out {kanjis.totalDocs}</Title>
      <Content>
        {kanjis.docs.map(({ kanji }) => (
          <Item key={kanji.character} elevation={6} onClick={() => console.log(kanji.character, kanji.strokes)}>
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
