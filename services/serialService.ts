import { ConsoleLog, MachineState, PortInfo, MachinePosition, SerialPortInfo, ConnectionOptions } from '../types';
import { BasePortManager, PortManagerCallbacks } from './basePortManager';
export class SerialManager extends BasePortManager {
    statusInterval: number | null = null;
    isDisconnecting = false;
    private activePortInfo: PortInfo | null = null;

    constructor(callbacks: PortManagerCallbacks) {
        super(callbacks);

        if (window.electronAPI) {
            window.electronAPI.onSerialData((data) => {
                this.handleSerialData(data);
            });
            window.electronAPI.onSerialError((message) => {
                this.callbacks.onError(`Serial Port Error: ${message}`);
                this.disconnect();
            });
            window.electronAPI.onSerialDisconnect(() => {
                this.disconnect();
            });

            window.electronAPI.onTCPConnect((info) => {
                this.activePortInfo = info; // Set activePortInfo here
                this.callbacks.onConnect(info);
                this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), 100);
            });
            window.electronAPI.onTCPDisconnect(() => {
                this.disconnect();
            });
            window.electronAPI.onTCPLog((log) => {
                this.callbacks.onLog(log);
            });
            window.electronAPI.onTCPProgress((p) => {
                this.callbacks.onProgress(p);
            });
            window.electronAPI.onTCPError((message) => {
                this.callbacks.onError(`TCP Error: ${message}`);
                this.disconnect();
            });
            window.electronAPI.onTCPStatus((status, raw) => {
                this.lastStatus = status;
                this.callbacks.onStatus(status, raw);
            });
        }
    }

    async connect(options: ConnectionOptions) {
        if (!window.electronAPI) {
            this.callbacks.onError("Electron API not available for communication.");
            return;
        }

        if (options.type === 'usb') {
            if (!options.path || !options.baudRate) {
                this.callbacks.onError("USB connection requires a port path and baud rate.");
                return;
            }
            try {
                await window.electronAPI.openSerialPort(options.path, options.baudRate);
                
                this.lastStatus = {
                    status: 'Idle',
                    code: null,
                    wpos: { x: 0, y: 0, z: 0 },
                    mpos: { x: 0, y: 0, z: 0 },
                    wco: { x: 0, y: 0, z: 0 },
                    spindle: { state: 'off', speed: 0 },
                    ov: [100, 100, 100],
                };
                this.spindleDirection = 'off';

                this.activePortInfo = { 
                    portName: options.path, 
                    type: 'usb', 
                    usbVendorId: undefined, 
                    usbProductId: undefined 
                };
                this.callbacks.onConnect(this.activePortInfo);
                
                this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), 100);

            } catch (error) {
                if (error instanceof Error) {
                    this.callbacks.onError(error.message);
                }
                throw error;
            }
        } else if (options.type === 'tcp') {
            if (!options.ip || !options.port) {
                this.callbacks.onError("TCP connection requires IP address and port.");
                return;
            }
            try {
                await window.electronAPI.connectTCP(options.ip, options.port);
                this.activePortInfo = { type: 'tcp', ip: options.ip, port: options.port };
            } catch (error) {
                if (error instanceof Error) {
                    this.callbacks.onError(error.message);
                }
                throw error;
            }
        }
    }

    async disconnect() {
        if (this.isDisconnecting) return;
        this.isDisconnecting = true;
    
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }
        if (this.isJobRunning) {
            this.stopJob();
        }
    
        try {
            if (window.electronAPI) {
                if (this.activePortInfo?.type === 'usb') {
                    await window.electronAPI.closeSerialPort();
                } else if (this.activePortInfo?.type === 'tcp') {
                    window.electronAPI.disconnectTCP();
                }
            }
        } catch (error) {
            // Log error but don't prevent finally block from executing
            console.error("Error during disconnect:", error);
        } finally {
            this.isDisconnecting = false;
            this.callbacks.onDisconnect();
            this.activePortInfo = null; // Clear active port info on disconnect
        }
    }
    
    handleSerialData(data: string) {
        const lines = data.split('\n');
        lines.forEach(line => {
            this.processIncomingLine(line.trim());
        });
    }

    protected async _sendLine(line: string): Promise<void> {
        if (!window.electronAPI) {
            this.callbacks.onError("Electron API not available for communication.");
            throw new Error("Electron API not available.");
        }
        try {
            if (this.activePortInfo?.type === 'tcp') {
                window.electronAPI.sendTCP(line);
            } else {
                window.electronAPI.writeSerialPort(line);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            if (this.isDisconnecting) {
            } else if (errorMessage.includes("device has been lost") || errorMessage.includes("The port is closed.")) {
                this.callbacks.onError("Device disconnected unexpectedly. Please reconnect.");
                this.disconnect();
            } else {
                this.callbacks.onError("Error writing to port.");
            }
            throw error;
        }
    }

    protected async _sendRealtimeCommand(command: string): Promise<void> {
        if (!window.electronAPI) {
            this.callbacks.onError("Electron API not available for communication.");
            throw new Error("Electron API not available.");
        }
        try {
            if (this.activePortInfo?.type === 'tcp') {
                window.electronAPI.sendTCPRealtime(command);
            } else {
                window.electronAPI.writeSerialPort(command);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            if (this.isDisconnecting) {
            } else if (errorMessage.includes("device has been lost") || errorMessage.includes("The port is closed.")) {
                this.callbacks.onError("Device disconnected unexpectedly. Please reconnect.");
                this.disconnect();
            } else {
                this.callbacks.onError("Error writing to port.");
            }
            throw error;
        }
    }

    requestStatusUpdate() {
        if (window.electronAPI) {
            if (this.activePortInfo?.type === 'tcp') {
                window.electronAPI.sendTCPRealtime('?');
            } else {
                window.electronAPI.writeSerialPort('?');
            }
        }
    }
}

