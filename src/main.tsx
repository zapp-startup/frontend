import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import "./styles/index.css";

// console.log("ENV CHECK:", import.meta.env)
// console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL)

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
  