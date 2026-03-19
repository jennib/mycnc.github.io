import net from 'net';

let tcpSocket: net.Socket | null = null;

export const connectToTcp = (ip: string, port: number, broadcast: (channel: string, ...args: any[]) => void): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (tcpSocket) {
            if (!tcpSocket.destroyed && !tcpSocket.connecting) {
                console.log("Using existing TCP connection.");
                resolve(true);
                return;
            }
            tcpSocket.destroy();
            tcpSocket = null;
        }

        tcpSocket = new net.Socket();

        const connectionTimeout = setTimeout(() => {
            broadcast("tcp-error", {
                message: "Connection timed out.",
                code: "CONNECTION_TIMEOUT",
            });
            reject(new Error("Connection timed out."));
            tcpSocket?.destroy();
            tcpSocket = null;
        }, 5000);

        tcpSocket.on("connect", () => {
            clearTimeout(connectionTimeout);
            console.log(`TCP Connected to ${ip}: ${port}`);
            resolve(true);
        });

        tcpSocket.on("data", (data) => {
            broadcast("tcp-data", data.toString());
        });

        tcpSocket.on("error", (err) => {
            clearTimeout(connectionTimeout);
            console.error("TCP Socket Error:", err.message);
            broadcast("tcp-error", {
                message: err.message,
                code: "TCP_SOCKET_ERROR",
            });
            reject(new Error(err.message));
            tcpSocket?.destroy();
            tcpSocket = null;
        });

        tcpSocket.on("close", () => {
            clearTimeout(connectionTimeout);
            console.log("TCP Socket Closed");
            broadcast("tcp-disconnect");
            tcpSocket?.destroy();
            tcpSocket = null;
        });

        tcpSocket.connect(port, ip);
    });
};

export const disconnectTcp = () => {
    if (tcpSocket) {
        tcpSocket.destroy();
        tcpSocket = null;
    }
};

export const sendTcp = (data: string, broadcast: (channel: string, ...args: any[]) => void) => {
    if (tcpSocket && !tcpSocket.destroyed) {
        tcpSocket.write(data);
    } else {
        console.warn("Attempted to send data on non-existent socket");
        broadcast("tcp-error", {
            message: "Not connected to TCP device.",
            code: "NOT_CONNECTED",
        });
    }
};
