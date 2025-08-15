import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Service Worker pour PWA (optionnel mais recommandé)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker enregistré'))
      .catch(err => console.log('Service Worker erreur:', err));
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);