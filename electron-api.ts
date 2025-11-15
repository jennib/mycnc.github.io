export interface IElectronAPI {
  isElectron: () => Promise<boolean>;
  // We will add more methods here for TCP communication, like:
  // tcpConnect: (host: string, port: number) => Promise<void>;
  // tcpSend: (data: string) => Promise<void>;
  // onTcpData: (callback: (data: Uint8Array) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
