interface ElectronAPI {
    isElectron: boolean;
    connectTCP: (ip: string, port: number) => Promise<boolean>;
    sendTCP: (data: string) => void;
    disconnectTCP: () => void;
    onTCPData: (callback: (data: string) => void) => void;
    onTCPError: (callback: (error: { message: string; code: string; }) => void) => void;
    onTCPDisconnect: (callback: () => void) => void;
    on: (channel: string, listener: (...args: any[]) => void) => () => void;
    send: (channel: string, ...args: any[]) => void;
}

// Augment the Window interface to include electronAPI
interface Window {
    electronAPI?: ElectronAPI;
}
