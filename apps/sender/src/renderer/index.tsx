import { modeReady } from './shim';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./i18n";
import "./index.css";

import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import { remoteSync } from './services/RemoteSync';

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element to mount to");

modeReady.then(() => {
  remoteSync.init();

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
