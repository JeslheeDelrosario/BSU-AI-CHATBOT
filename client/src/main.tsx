// client/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { SidebarProvider } from './contexts/SidebarContext'; // New import

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SidebarProvider> {/* Wrap inside BrowserRouter */}
        <App />
      </SidebarProvider>
    </BrowserRouter>
  </React.StrictMode>
);