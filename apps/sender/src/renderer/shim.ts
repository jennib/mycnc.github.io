
import { io, Socket } from "socket.io-client";

// Cast window to any to avoid type declaration conflicts with electron-api.d.ts
const win = window as any;

let socket: Socket | null = null;

if (!win.electronAPI) {
    console.log("Remote access mode detected. Initializing Socket.IO shim for electronAPI.");

    // Connect to the server that served this page
    socket = io();

    socket.on("connect", () => {
        console.log("Connected to remote server via Socket.IO:", socket?.id);
    });

    socket.on("connect_error", (err) => {
        console.error("Socket.IO connection error:", err);
    });

    win.electronAPI = {
        isElectron: false,

        connectTCP: (ip: string, port: number): Promise<boolean> => {
            return new Promise((resolve, reject) => {
                if (!socket) {
                    reject(new Error("Socket not initialized"));
                    return;
                }
                socket.emit("connect-tcp", ip, port, (response: { success: boolean; error?: string }) => {
                    if (response.success) {
                        resolve(true);
                    } else {
                        console.error("TCP Connection failed via Socket.IO:", response.error);
                        reject(new Error(response.error || "Unknown error"));
                    }
                });
            });
        },

        sendTCP: (data: string) => {
            if (socket) {
                socket.emit("send-tcp", data);
            }
        },

        disconnectTCP: () => {
            if (socket) {
                socket.emit("disconnect-tcp");
            }
        },

        onTCPData: (callback: (data: string) => void) => {
            if (socket) {
                socket.on("tcp-data", callback);
            }
        },

        onTCPError: (callback: (error: { message: string; code: string }) => void) => {
            if (socket) {
                socket.on("tcp-error", callback);
            }
        },

        onTCPDisconnect: (callback: () => void) => {
            if (socket) {
                socket.on("tcp-disconnect", callback);
            }
        },

        toggleFullscreen: () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch((err) => {
                    console.warn(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        },

        getFullscreenState: () => {
            // No-op
        },

        onFullscreenChange: (callback: (isFullScreen: boolean) => void) => {
            const handler = () => {
                callback(!!document.fullscreenElement);
            };
            document.addEventListener("fullscreenchange", handler);
            callback(!!document.fullscreenElement);
            return () => {
                document.removeEventListener("fullscreenchange", handler);
            };
        },

        openCameraWindow: (params: { mode: "local" | "webrtc"; deviceId?: string; url?: string }) => {
            console.warn("Remote Camera Window is not supported in browser mode. Opening in new tab if URL provided.");
            if (params.url) {
                window.open(params.url, "_blank");
            }
        },

        closeCameraWindow: () => { },
        onCameraWindowClosed: (callback: () => void) => { },

        // State Sync
        sendStateUpdate: (storeName: string, state: any) => {
            if (socket) {
                socket.emit("state-update", { storeName, state });
            }
        },
        getInitialState: () => {
            return new Promise((resolve) => {
                if (socket) {
                    socket.once("initial-state", (state) => resolve(state));
                } else {
                    resolve({});
                }
            });
        },
        onStateUpdate: (callback: (update: { storeName: string, state: any }) => void) => {
            if (socket) {
                socket.on("state-update", callback);
            }
        },

        // Remote Actions
        sendRemoteAction: (action: any) => {
            if (socket) {
                socket.emit("state-action", action);
            }
        },
        onRemoteAction: (callback: (action: any) => void) => {
            if (socket) {
                socket.on("remote-action", callback);
            }
        },
    };
}
