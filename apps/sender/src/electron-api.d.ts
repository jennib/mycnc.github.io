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
}

// Augment the Window interface to include electronAPI
interface Window {
    electronAPI?: ElectronAPI;
}
