import { contextBridge, ipcRenderer } from "electron";



contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  send: (channel: string, data?: any) => ipcRenderer.send(channel, data),
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
});
