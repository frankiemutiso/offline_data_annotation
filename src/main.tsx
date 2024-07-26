import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
	palette: {
		primary: {
			main: '#008B47',
		},
		secondary: {
			main: '#F8CD24',
		},
	},
	typography: {
		fontFamily: ['Poppins'].join(','),
		fontSize: 13,
	},
});

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<App />
		</ThemeProvider>
	</React.StrictMode>
);
