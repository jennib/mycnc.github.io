import http from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import os from 'os';

let _io: SocketIOServer | null = null;

export const broadcastStateToClients = (storeName: string, state: any) => {
    _io?.emit('state-update', { storeName, state });
};

export const startRemoteServer = (
    appState: Record<string, any>,
    broadcast: (channel: string, ...args: any[]) => void,
    connectToTcp: (ip: string, port: number, broadcast: (channel: string, ...args: any[]) => void) => Promise<boolean>,
    disconnectTcp: () => void,
    sendTcp: (data: string, broadcast: (channel: string, ...args: any[]) => void) => void,
    notifyPlugins: (storeName: string, state: any) => void,
    mainWindow: any
) => {
    const appServer = express();
    const httpServer = http.createServer(appServer);
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        maxHttpBufferSize: 1e8 // 100 MB
    });
    _io = io;

    // Configure Express
    appServer.use(express.json({ limit: '100mb' }));

    // CSP for remote browser clients — allow WebSocket back to this server
    appServer.use((_req, res, next) => {
        res.setHeader(
            'Content-Security-Policy',
            `default-src 'self'; connect-src 'self' ws:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' blob:; img-src 'self' data:; worker-src blob: 'self';`
        );
        next();
    });
    appServer.get('/api/is-remote', (_req, res) => {
        res.json({ isRemote: true });
    });

    appServer.post('/api/upload', (req: express.Request, res: express.Response) => {
        const { name, content } = req.body;
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("load-remote-file", { name, content });
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Main window not ready' });
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        // Proxy to Vite Dev Server
        appServer.use('/', createProxyMiddleware({
            target: process.env.VITE_DEV_SERVER_URL,
            changeOrigin: true,
            ws: true, // Proxy websockets
        } as any));
    } else {
        // Serve static files
        appServer.use(express.static(path.join(__dirname, '../renderer')));
    }

    io.on("connection", (socket) => {
        console.log("New remote connection:", socket.id);

        socket.on("connect-tcp", (ip, port, callback) => {
            connectToTcp(ip, port, broadcast)
                .then(() => callback({ success: true }))
                .catch((err) => callback({ success: false, error: err.message }));
        });

        socket.on("send-tcp", (data) => {
            sendTcp(data, broadcast);
        });

        socket.on("disconnect-tcp", () => {
            disconnectTcp();
        });

        // --- State Synchronization ---
        // Send current state when client requests it (avoids race condition with emit-on-connect)
        socket.on("get-initial-state", () => {
            socket.emit("initial-state", appState);
        });

        socket.on("state-update", ({ storeName, state }) => {
            // Update local cache
            appState[storeName] = { ...appState[storeName], ...state };

            notifyPlugins(storeName, state);

            // Broadcast to other remote clients (excluding sender)
            socket.broadcast.emit("state-update", { storeName, state });

            // Send to main window
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send("state-update", { storeName, state });
            }
        });

        socket.on("state-action", (action) => {
            // Forward actions from remote to main window to be executed
            // (Optional: if we want remote to trigger complex logic in main window)
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send("remote-action", action);
            }
        });
    });

    const PORT = 8080;
    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Remote access server listening on http://0.0.0.0:${PORT}`);
        const interfaces = os.networkInterfaces();
        console.log("Available remote access URLs:");
        Object.keys(interfaces).forEach((ifaceName) => {
            const iface = interfaces[ifaceName];
            if (iface) {
                iface.forEach((address) => {
                    if (address.family === 'IPv4' && !address.internal) {
                        console.log(`  http://${address.address}:${PORT}`);
                    }
                });
            }
        });
    });
};
