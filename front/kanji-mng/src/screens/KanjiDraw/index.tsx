import {ArrowBackIos, FormatColorReset, Send} from '@mui/icons-material';
import {Button, Paper} from '@mui/material';
import {Box} from '@mui/system';
import React, {useCallback, useMemo, useRef} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import AppNav from '../../components/AppNav';
import Sketch, {SketchFunctions} from '../../components/Sketch';
import {recognitionService} from '../../services';
import {Content, Main} from './styles';

const url = 'https://www.miraisoft.de/anikanjivgx/?svg=';

export default function KanjiDraw() {
  const {id} = useParams();
  const navigate = useNavigate();
  const mainDivRef: React.MutableRefObject<HTMLDivElement | undefined> = useRef();
  const canvasRef: React.MutableRefObject<SketchFunctions | undefined>  = useRef();

  const height = useMemo(() => {
    if (!mainDivRef || !mainDivRef.current) { return 0; }

    return mainDivRef.current.clientHeight - 89;
  }, [mainDivRef]);

  const handleReset = useCallback(() => {
    if (canvasRef && canvasRef.current) {
      canvasRef.current.handleClear();
    }
  }, [canvasRef]);

  const handleSend = useCallback(() => {
    if (canvasRef && canvasRef.current && id) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          recognitionService.uploadData(id, blob)
            .finally(() => {
              navigate('/');
            })
        }
      });
    }
  }, [id, navigate]);

  return <div style={{ width: '100%', height: '100%' }} ref={mainDivRef as any}>
    <AppNav />
    <Main height={height}>
      <Button onClick={() => navigate('/')} sx={{ margin: 2 }} startIcon={<ArrowBackIos />}>Go back</Button>
      <Content>
        <Paper elevation={3} sx={{ width: 110, height: 110, marginRight: 3 }}>
          <img alt={id} src={url+id} width={105} height={105} />
        </Paper>
        <Sketch visible ref={canvasRef} />
      </Content>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="outlined" onClick={handleReset} sx={{ margin: 2 }} endIcon={<FormatColorReset />}>Clear</Button>
        <Button variant="contained" onClick={handleSend} sx={{ margin: 2 }} endIcon={<Send />}>Send</Button>
      </Box>
    </Main>
  </div>;
};
