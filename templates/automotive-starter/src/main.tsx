import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { applyBrand } from "@/config/brand";
import "./index.css";

// Pas de merk-tokens (kleuren, fonts, radius) toe vóór de eerste render,
// zodat één bestand (config/brand.ts) het hele thema stuurt.
applyBrand();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
