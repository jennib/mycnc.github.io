interface ElectronAPI {
    isElectron: boolean;
    connectTCP: (ip: string, port: number) => Promise<void>;
    sendTCP: (data: string) => void;
    disconnectTCP: () => void;
    onTCPData: (callback: (data: string) => void) => void;
    onTCPError: (callback: (error: string) => void) => void;
    onTCPDisconnect: (callback: () => void) => void;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}
