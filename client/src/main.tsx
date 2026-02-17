// client/src/main.tsx
import React, { Suspense } from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { SidebarProvider } from './contexts/SidebarContext'; // New import
import ScrollToTop from "./components/ScrollToTop";
import GlobalLoader from "./components/GlobalLoader";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Suspense fallback={<GlobalLoader />}>
        <ScrollToTop />
        <SidebarProvider>
          {" "}
          {/* Wrap inside BrowserRouter */}
          <App />
        </SidebarProvider>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
);