import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#3b82f6',
      main: '#2563eb',
      dark: '#1d4ed8',
      contrastText: '#fff',
    },
    secondary: {
      light: '#4b5563',
      main: '#1f2937',
      dark: '#111827',
      contrastText: '#fff',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.375rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#2563eb',
          },
        },
      },
    },
  },
});

export default theme