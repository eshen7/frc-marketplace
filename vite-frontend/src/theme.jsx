import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#be3634',
      main: '#b02e32',
      dark: '#821c1e',
      contrastText: '#fff',
    },
    secondary: {
      light: '#f5f5f5',
      main: '#e9e9e9',
      dark: '#d9d9d9',
      contrastText: '#000',
    },
  },
});

export default theme