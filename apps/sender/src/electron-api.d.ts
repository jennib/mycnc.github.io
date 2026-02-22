interface ElectronAPI {
    isElectron: boolean;
    connectTCP: (ip: string, port: number) => Promise<boolean>;
    sendTCP: (data: string) => void;
    disconnectTCP: () => void;
    onTCPData: (callback: (data: string) => void) => void;
    onTCPError: (callback: (error: { message: string; code: string; }) => void) => void;
    onTCPDisconnect: (callback: () => void) => void;

    // Specific methods
    toggleFullscreen: () => void;
    getFullscreenState: () => void;
    onFullscreenChange: (callback: (isFullScreen: boolean) => void) => () => void;

    openCameraWindow: (params: { mode: 'local' | 'webrtc'; deviceId?: string; url?: string }) => void;
    closeCameraWindow: () => void;
    onCameraWindowClosed: (callback: () => void) => void;

    // State Sync
    sendStateUpdate: (storeName: string, state: any) => void;
    getInitialState: () => Promise<any>;
    onStateUpdate: (callback: (update: { storeName: string, state: any }) => void) => void;

    // Remote Actions
    sendRemoteAction?: (action: { type: string, payload?: any }) => void;
    onRemoteAction?: (callback: (action: { type: string, payload?: any }) => void) => void;

    // Startup file
    getStartupFile?: () => Promise<{ name: string; content: string } | null>;
    onLoadRemoteFile?: (callback: (file: { name: string; content: string }) => void) => void;
}

// Augment the Window interface to include electronAPI
interface Window {
    electronAPI?: ElectronAPI;
}
