import {alpha, AppBar, Box, Button, InputBase, styled, Toolbar, Typography} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {useNavigate} from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));


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
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              onKeyDown={(e) => e.keyCode === 13 && console.log("Submit")}
            />
          </Search>
          <Button sx={{ color: '#fff' }} onClick={() => navigate('/')}>Home</Button>
          <Button sx={{ color: '#fff' }} onClick={() => navigate('/recognitions')}>Recognitions</Button>
        </Box>
      </AppBar>
      <Toolbar />
    </>
  )
}
