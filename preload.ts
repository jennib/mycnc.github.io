import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * A simple method to check if the app is running in Electron.
   * This helps your React code conditionally render components or enable features.
   */
  isElectron: () => Promise.resolve(true),

  // We will implement the TCP methods in a future step.
  // For example:
  // tcpConnect: (host, port) => ipcRenderer.invoke('tcp:connect', host, port),
});
