import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

try {
  const saved = localStorage.getItem('themeMode');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
} catch {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
