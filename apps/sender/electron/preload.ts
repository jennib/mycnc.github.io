import { contextBridge, ipcRenderer } from "electron";

console.log("Preload script loaded and executing!");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  connectTCP: (ip: string, port: number) =>
    ipcRenderer.invoke("connect-tcp", ip, port),
  sendTCP: (data: string) => ipcRenderer.send("send-tcp", data),
  disconnectTCP: () => ipcRenderer.send("disconnect-tcp"),
  onTCPData: (callback: (data: string) => void) =>
    ipcRenderer.on("tcp-data", (_event, data) => callback(data)),
  onTCPError: (callback: (error: string) => void) =>
    ipcRenderer.on("tcp-error", (_event, error) => callback(error)),
  onTCPDisconnect: (callback: () => void) =>
    ipcRenderer.on("tcp-disconnect", callback),

  // Specific methods instead of generic send
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),
  getFullscreenState: () => ipcRenderer.send("get-fullscreen-state"),
  onFullscreenChange: (callback: (isFullScreen: boolean) => void) => {
    const subscription = (_event: any, value: boolean) => callback(value);
    ipcRenderer.on("is-fullscreen", subscription);
    return () => {
      ipcRenderer.removeListener("is-fullscreen", subscription);
    };
  },
  openCameraWindow: (params: any) => ipcRenderer.send('open-camera-window', params),
  closeCameraWindow: () => ipcRenderer.send('close-camera-window'),
});
