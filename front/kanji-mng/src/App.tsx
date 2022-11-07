import {createTheme, ThemeProvider} from '@mui/material';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import colors from './const/colors';
import HomeScreen from './screens/Home';
import RecognitionListScreen from './screens/RecognitionList';
import KanjiDrawScreen from './screens/KanjiDraw';

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: colors.primary, 
      },
      secondary: {
        main: colors.secondary,
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomeScreen />} />
          <Route path='/recognitions' element={<RecognitionListScreen />} />
          <Route path='/draw/:id' element={<KanjiDrawScreen />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
