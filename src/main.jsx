import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider, ThemeProvider } from './contexts/AuthContext';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App/>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
