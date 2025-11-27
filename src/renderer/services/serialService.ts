import { PortInfo, ConnectionOptions } from '@/types';

interface SerialServiceCallbacks {
    onData: (data: string) => void;
    onError: (error: string) => void;
}

export class SerialService {
    private port: any = null; // For Web Serial API
    private reader: any = null;
    private writer: any = null;
    private callbacks: SerialServiceCallbacks;
    private isDisconnecting = false;
    private connectionType: 'usb' | 'tcp' | null = null;
    private tcpBuffer: string = '';

    constructor(callbacks: SerialServiceCallbacks) {
        this.callbacks = callbacks;
    }

    get isConnected(): boolean {
        return (this.port !== null || this.connectionType === 'tcp');
    }

    async connect(options: ConnectionOptions): Promise<PortInfo> {
        if (this.isConnected) {
            throw new Error("A connection is already active.");
        }

        if (options.type === 'usb') {
            return this.connectUSB(options.baudRate);
        } else if (options.type === 'tcp') {
            return this.connectTCP(options.ip, options.port);
        } else {
            throw new Error("Unsupported connection type.");
        }
    }

    private async connectUSB(baudRate: number): Promise<PortInfo> {
        if (!('serial' in navigator)) {
            throw new Error("Web Serial API not supported.");
        }

        try {
            this.port = await (navigator as any).serial.requestPort();
            await this.port.open({ baudRate });
            
            this.connectionType = 'usb';
            
            this.port.addEventListener('disconnect', () => {
                this.disconnect();
            });

            this.reader = this.port.readable.getReader();
            this.writer = this.port.writable.getWriter();

            this.readLoop();

            const portInfo = this.port.getInfo();
            return {
                type: 'usb',
                portName: portInfo.usbProductId ? `USB (VID: ${portInfo.usbVendorId}, PID: ${portInfo.usbProductId})` : 'USB Device',
                usbVendorId: portInfo.usbVendorId,
                usbProductId: portInfo.usbProductId,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            if (this.port) {
                await this.disconnect();
            }
            throw new Error(`Failed to connect: ${errorMessage}`);
        }
    }

    private async connectTCP(ip: string, port: number): Promise<PortInfo> {
        if (!window.electronAPI?.isElectron) {
            throw new Error("TCP connection is only available in Electron environment.");
        }

        try {
            window.electronAPI.onTCPData((data) => {
                this.tcpBuffer += data;
                const lines = this.tcpBuffer.split('\n');
                this.tcpBuffer = lines.pop()!;
                lines.forEach(line => this.callbacks.onData(line));
            });
            window.electronAPI.onTCPError((error) => {
                this.callbacks.onError(`TCP Error: ${error}`);
                this.disconnect();
            });
            window.electronAPI.onTCPDisconnect(() => {
                this.disconnect();
            });

            const connected = await window.electronAPI.connectTCP(ip, port);

            if (connected) {
                this.connectionType = 'tcp';
                return { type: 'tcp', ip, port };
            } else {
                throw new Error("Failed to establish TCP connection.");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            throw new Error(`Failed to connect via TCP: ${errorMessage}`);
        }
    }

    disconnect() {
        if (this.isDisconnecting || !this.isConnected) return;
        this.isDisconnecting = true;
    
        try {
            if (this.connectionType === 'usb' && this.port) {
                this.port.close();
            } else if (this.connectionType === 'tcp' && window.electronAPI) {
                window.electronAPI.disconnectTCP();
            }
        } catch (error) {
            console.error("Error during disconnect:", error);
        } finally {
            this.port = null;
            this.reader = null;
            this.writer = null;
            this.connectionType = null;
            this.isDisconnecting = false;
        }
    }

    private async readLoop() {
        const decoder = new TextDecoder();
        let buffer = '';
        while (this.port?.readable && this.reader) {
            try {
                const { value, done } = await this.reader.read();
                if (done) {
                    this.reader.releaseLock();
                    break;
                }
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop()!;

                    lines.forEach(line => {
                        this.callbacks.onData(line);
                    });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                 if (!this.isDisconnecting) {
                    this.callbacks.onError(errorMessage);
                }
                break;
            }
        }
    }

    async send(data: string) {
        if (!this.isConnected) {
            throw new Error("Not connected.");
        }

        if (this.connectionType === 'usb' && this.writer) {
            try {
                const encoder = new TextEncoder();
                const encodedData = encoder.encode(data);
                await this.writer.write(encodedData);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                this.callbacks.onError(errorMessage);
                throw error;
            }
        } else if (this.connectionType === 'tcp' && window.electronAPI) {
            try {
                window.electronAPI.sendTCP(data);
            } catch (error) {
                this.callbacks.onError("Error writing to TCP socket.");
                throw error;
            }
        }
    }
}
