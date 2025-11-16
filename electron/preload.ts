import { contextBridge, ipcRenderer } from 'electron';
import { ConsoleLog, MachineState, PortInfo } from '../types';

console.log('Preload script loaded and executing!');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  connectTCP: (host: string, port: number) => ipcRenderer.invoke('connect-tcp', host, port),
  sendTCP: (data: string) => ipcRenderer.send('send-tcp', data),
  disconnectTCP: () => ipcRenderer.send('disconnect-tcp'),
  sendTCPRealtime: (data: string) => ipcRenderer.send('send-tcp-realtime', data),
  sendTCPGCode: (gcodeLines: string[], options: { startLine?: number; isDryRun?: boolean }) => ipcRenderer.send('send-tcp-gcode', gcodeLines, options),
  tcpPauseJob: () => ipcRenderer.send('tcp-pause-job'),
  tcpResumeJob: () => ipcRenderer.send('tcp-resume-job'),
  tcpStopJob: () => ipcRenderer.send('tcp-stop-job'),
  tcpGracefulStopJob: () => ipcRenderer.send('tcp-graceful-stop-job'),
  tcpEmergencyStop: () => ipcRenderer.send('tcp-emergency-stop'),

  onTCPConnect: (callback: (info: PortInfo) => void) => ipcRenderer.on('tcp-connect', (_event, info) => callback(info)),
  onTCPDisconnect: (callback: () => void) => ipcRenderer.on('tcp-disconnect', callback),
  onTCPLog: (callback: (log: ConsoleLog) => void) => ipcRenderer.on('tcp-log', (_event, log) => callback(log)),
  onTCPProgress: (callback: (p: { percentage: number; linesSent: number; totalLines: number; }) => void) => ipcRenderer.on('tcp-progress', (_event, p) => callback(p)),
  onTCPError: (callback: (message: string) => void) => ipcRenderer.on('tcp-error', (_event, message) => callback(message)),
  onTCPStatus: (callback: (status: MachineState, raw: string) => void) => ipcRenderer.on('tcp-status', (_event, status, raw) => callback(status, raw)),

  // Serial Port API
  listSerialPorts: () => ipcRenderer.invoke('list-serial-ports'),
  requestSerialPort: () => ipcRenderer.invoke('request-serial-port'),
  openSerialPort: (path: string, baudRate: number) => ipcRenderer.invoke('open-serial-port', path, baudRate),
  closeSerialPort: () => ipcRenderer.invoke('close-serial-port'),
  writeSerialPort: (data: string) => ipcRenderer.send('write-serial-port', data),
  onSerialData: (callback: (data: string) => void) => ipcRenderer.on('serial-data', (_event, data) => callback(data)),
  onSerialError: (callback: (message: string) => void) => ipcRenderer.on('serial-error', (_event, message) => callback(message)),
  onSerialDisconnect: (callback: () => void) => ipcRenderer.on('serial-disconnect', callback),
});

