import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { configureMonaco } from "@mycnc/shared";
import * as monaco from "monaco-editor";

// Configure Monaco loader
configureMonaco();

import "./i18n";
import "./index.css";

// Import Inter font
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
