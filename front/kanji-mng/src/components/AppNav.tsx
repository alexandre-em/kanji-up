import {AppBar, Box, Button, Toolbar, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';

export default function AppNav() {
  const navigate = useNavigate();

  return (
    <>
      <AppBar component="nav" color="primary" sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ fontWeight: '900' }}>
            Kanji-Up
          </Typography>
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
