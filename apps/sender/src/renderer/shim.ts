
import { io, Socket } from "socket.io-client";

const win = window as any;

let resolveMode: () => void;
export const modeReady = new Promise<void>((resolve) => { resolveMode = resolve; });

if (win.electronAPI) {
    // Electron host — already has electronAPI, nothing to set up
    resolveMode!();
} else {
    // Probe the remote server endpoint. If it exists we're a remote client;
    // if it 404s or errors we're a standalone web app.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    fetch('/api/is-remote', { signal: controller.signal })
        .then(async res => {
            if (!res.ok) return false;
            const ct = res.headers.get('content-type') ?? '';
            if (!ct.includes('application/json')) return false;
            const data = await res.json();
            return data?.isRemote === true;
        })
        .catch(() => false)
        .then((isRemote: boolean) => {
            clearTimeout(timeout);
            if (isRemote) {
                initRemoteMode();
            } else {
                initStandaloneMode();
            }
            resolveMode!();
        });
}

function initRemoteMode() {
    console.log("Remote client mode: connecting to Electron host via Socket.IO.");
    const socket: Socket = io();

    socket.on("connect", () => console.log("Connected to Electron host:", socket.id));
    socket.on("connect_error", (err) => console.error("Socket.IO error:", err));

    (window as any).electronAPI = {
        isElectron: false,
        isRemote: true,

        connectTCP: (ip: string, port: number): Promise<boolean> =>
            new Promise((resolve, reject) => {
                socket.emit("connect-tcp", ip, port, (response: { success: boolean; error?: string }) => {
                    if (response.success) resolve(true);
                    else reject(new Error(response.error || "Unknown error"));
                });
            }),

        sendTCP: (data: string) => socket.emit("send-tcp", data),
        disconnectTCP: () => socket.emit("disconnect-tcp"),
        onTCPData: (cb: (data: string) => void) => socket.on("tcp-data", cb),
        onTCPError: (cb: (error: { message: string; code: string }) => void) => socket.on("tcp-error", cb),
        onTCPDisconnect: (cb: () => void) => socket.on("tcp-disconnect", cb),

        toggleFullscreen: fullscreenToggle,
        getFullscreenState: () => {},
        onFullscreenChange: fullscreenChangeListener,
        openCameraWindow: (params: any) => { if (params.url) window.open(params.url, "_blank"); },
        closeCameraWindow: () => {},
        onCameraWindowClosed: () => {},

        sendStateUpdate: (storeName: string, state: any) => socket.emit("state-update", { storeName, state }),
        getInitialState: () => new Promise((resolve) => {
            socket.once("initial-state", resolve);
            socket.emit("get-initial-state");
        }),
        onStateUpdate: (cb: (update: { storeName: string; state: any }) => void) => socket.on("state-update", cb),

        sendRemoteAction: (action: any) => socket.emit("state-action", action),
        onRemoteAction: (cb: (action: any) => void) => socket.on("remote-action", cb),
        isRemoteConnected: () => socket.connected,
        getServerUrls: () => Promise.resolve([] as string[]),
    };
}

function initStandaloneMode() {
    console.log("Standalone web app mode: direct machine connection.");

    (window as any).electronAPI = {
        isElectron: false,
        isRemote: false,

        // TCP/Serial handled locally by serialService — these are no-ops or WebSocket-based
        connectTCP: () => Promise.reject(new Error("Use TCP via WebSocket in standalone mode")),
        sendTCP: () => {},
        disconnectTCP: () => {},
        onTCPData: () => {},
        onTCPError: () => {},
        onTCPDisconnect: () => {},

        toggleFullscreen: fullscreenToggle,
        getFullscreenState: () => {},
        onFullscreenChange: fullscreenChangeListener,
        openCameraWindow: (params: any) => { if (params.url) window.open(params.url, "_blank"); },
        closeCameraWindow: () => {},
        onCameraWindowClosed: () => {},

        sendStateUpdate: () => {},
        getInitialState: () => Promise.resolve({}),
        onStateUpdate: () => {},
        sendRemoteAction: () => {},
        onRemoteAction: () => {},
        isRemoteConnected: () => false,
        getServerUrls: () => Promise.resolve([] as string[]),
    };
}

function fullscreenToggle() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.warn(`Fullscreen error: ${err.message}`);
        });
    } else {
        document.exitFullscreen?.();
    }
}

function fullscreenChangeListener(callback: (isFullScreen: boolean) => void) {
    const handler = () => callback(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    callback(!!document.fullscreenElement);
    return () => document.removeEventListener("fullscreenchange", handler);
}
