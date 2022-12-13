import {AppBar, Box, Button, IconButton, Toolbar, Typography} from '@mui/material';
import {Logout} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {useCallback} from 'react';
import AUTH_URL from '../const/auth';

export default function AppNav() {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    localStorage.removeItem('access_token');
    window.location.replace(AUTH_URL);
  }, []);

  return (
    <>
      <AppBar component="nav" color="primary" sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ fontWeight: '900' }}>
            Kanji-Up
          </Typography>
          <IconButton onClick={handleClick}>
            <Logout />
          </IconButton>
        </Toolbar>
        <Box sx={{ display: { xs: 'none', sm: 'flex', flexDirection: 'row' } }}>
          <Button sx={{ color: '#fff' }} onClick={() => navigate('/')}>Home</Button>
          <Button sx={{ color: '#fff' }} onClick={() => navigate('/recognitions')}>Recognitions</Button>
        </Box>
      </AppBar>
      <Toolbar />
    </>
  )
}
