import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'

// Pre-cache critical image assets for instant mobile rendering
if (typeof window !== 'undefined') {
  const criticalAssets = [
    '/profile.jpeg',
    '/about.png',
    '/logo.png',
    '/aboutpic.png',
    '/app1.png',
    '/app2.png'
  ];
  criticalAssets.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
