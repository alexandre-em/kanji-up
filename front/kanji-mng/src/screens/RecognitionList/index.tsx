import React, {useMemo, useRef} from "react";
import {HighlightOff, TaskAlt} from "@mui/icons-material";
import {Avatar, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText, Pagination, Typography} from "@mui/material";

import AppNav from "../../components/AppNav";
import SearchBar from "../../components/SearchBar";
import {Content, Footer, Main, Title} from "./styles";
import useHandlers from "./useHandlers";

export default function RecognitionList() {
  const mainDivRef: React.MutableRefObject<HTMLDivElement | undefined> = useRef();
  const {recognition, page, handleSearch, handlePage, handleValidate, handleUnvalidate} = useHandlers();
  const [isConfirmed, setIsConfirmed] = React.useState<{ [key: string]: boolean }>({});

  const height = useMemo(() => {
    if (!mainDivRef || !mainDivRef.current) { return 0; }

    return mainDivRef.current.clientHeight - 89;
  }, [mainDivRef]);

  if (!recognition) { return null; }

  return (
    <div ref={mainDivRef as any}>
      <AppNav />
      <Main height={height}>
        <SearchBar handleSearch={handleSearch} />
        <Title>Result : {recognition.docs.length * recognition.page} out {recognition.totalDocs}</Title>
        <Content>
          <List sx={{ width: '100%' }}>
            {recognition.docs.map((r: RecognitionType, i: number) => (
              <>
                <ListItem alignItems="flex-start" sx={{ width: '100%', flexWrap: 'wrap' }}>
                  <ListItemAvatar>
                    <Avatar alt="-" src={r.image} />
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ flexWrap: 'wrap' }}
                    primary={`Expected: ${r.kanji}`}
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Results: 
                    </Typography>
                      {r.predictions.length < 0 || !r.predictions ? 'None' : r.predictions.map((p) => p.prediction).join(' ,') }
                    </React.Fragment>
                  }
                />
                {(!isConfirmed[r.recognition_id] && r.is_valid === undefined) && <div>
                  <IconButton onClick={() => handleValidate(r.recognition_id).then(() => setIsConfirmed((prev) => ({ ...prev, [r.recognition_id]: true })))}>
                    <TaskAlt sx={{ color: '#19c8a6' }} />
                  </IconButton>
                  <IconButton onClick={() => handleUnvalidate(r.recognition_id).then(() => setIsConfirmed((prev) => ({ ...prev, [r.recognition_id]: true })))}>
                    <HighlightOff sx={{ color: '#da4f49' }} />
                  </IconButton>
                </div>}
              </ListItem>
              {i < recognition.docs.length - 1 && <Divider />}
            </>
        ))}
      </List>
    </Content>
    <Footer>
      <Pagination count={recognition.totalPages}  page={page} onChange={handlePage} color="primary" />
    </Footer>
  </Main>
</div>
  );
};
