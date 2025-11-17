import { ConnectionOptions, PortInfo } from '../types';
import { BasePortManager, PortManagerCallbacks } from './basePortManager';
import { Port } from './portInterface';
import { WebSerialPort } from './webSerialPort';
import { ElectronPort } from './electronPort';
import { TCPPort } from './tcpService';

export class SerialManager extends BasePortManager {
    private port: Port | null = null;
    private lineBuffer = '';
    private isConnecting = false;
    private statusInterval: number | null = null;
    private grblWelcomePromise: {
        resolve: (value: boolean) => void;
        reject: (reason?: any) => void;
    } | null = null;

    constructor(callbacks: PortManagerCallbacks) {
        super(callbacks);
    }

    private handleData(data: string) {
        this.lineBuffer += data;
        const lines = this.lineBuffer.split(/\r\n?|\n/);
        this.lineBuffer = lines.pop() || '';
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                this.processIncomingLine(trimmedLine);
            }
        }
    }

    private handleError(error: Error) {
        this.callbacks.onError(error.message);
    }

    private handleClose() {
        if (this.isConnecting) {
            return; // Ignore close events during the connection phase
        }
        this.callbacks.onDisconnect();
    }

    protected processIncomingLine(line: string) {
        // The first 'Grbl' message confirms a connection.
        if (this.grblWelcomePromise && (line.startsWith('Grbl') || line.startsWith('Welcome to GRBL'))) {
            this.grblWelcomePromise.resolve(true);
            this.grblWelcomePromise = null;
        }
        // All lines, including the welcome message, are passed to the base handler
        // for logging and other processing.
        super.processIncomingLine(line);
    }

    async connect(options: ConnectionOptions) {
        if (this.isConnecting || this.port?.isOpen) {
            return;
        }
        this.isConnecting = true;

        try {
            if (options.type === 'tcp') {
                if (window.electronAPI) {
                    this.port = new TCPPort();
                } else {
                    throw new Error('TCP connections are only supported in the Electron app.');
                }
            } else { // 'usb'
                this.port = window.electronAPI ? new ElectronPort() : new WebSerialPort();
            }

            this.port.onData = this.handleData.bind(this);
            this.port.onError = this.handleError.bind(this);
            this.port.onClose = this.handleClose.bind(this);

            await this.port.connect(options);
            this.isConnecting = false;

            // Wait a bit for the serial port to be ready before sending data
            await new Promise(resolve => setTimeout(resolve, 500));

            // Send a soft-reset to get the controller into a known state and elicit a welcome message.
            await this.sendRealtimeCommand('\x18');

            // Handshake: Wait for a moment, send a soft reset, and wait for 'ok' or 'Grbl'
            const handshakePromise = new Promise<boolean>((resolve, reject) => {
                this.grblWelcomePromise = { resolve, reject };
                setTimeout(() => {
                    if (this.grblWelcomePromise) {
                        this.grblWelcomePromise.reject(new Error("GRBL welcome message not received within 3 seconds."));
                        this.grblWelcomePromise = null;
                        this.disconnect(); // Clean up on timeout
                    }
                }, 10000);
            });

            await handshakePromise;

            const portInfo = this.getPortInfo(options);
            this.callbacks.onConnect(portInfo);

            this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), 3000);

        } catch (error) {
            this.isConnecting = false;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.callbacks.onError(errorMessage);
            await this.disconnect();
            throw error;
        }
    }

    async disconnect() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }
        if (this.port && this.port.isOpen) {
            await this.port.disconnect();
        }
        this.port = null;
        // onDisconnect is called by the port's onClose handler
    }

    protected async _sendLine(line: string): Promise<void> {
        if (!this.port || !this.port.isOpen) {
            throw new Error('Port is not open.');
        }
        await this.port.write(line);
    }

    protected async _sendRealtimeCommand(command: string): Promise<void> {
        if (!this.port || !this.port.isOpen) {
            throw new Error('Port is not open.');
        }
        // WebSerialPort doesn't have a separate realtime command, it sends it as normal data.
        // ElectronPort has a separate method, but we can handle that inside the ElectronPort class.
        if (this.port instanceof ElectronPort) {
            await this.port.writeRealtime(command);
        } else {
            await this.port.write(command);
        }
    }

    requestStatusUpdate() {
        if (this.port && this.port.isOpen) {
            this._sendRealtimeCommand('?');
        }
    }

    private getPortInfo(options: ConnectionOptions): PortInfo {
        if (options.type === 'tcp') {
            return { type: 'tcp', ip: options.ip, port: options.port };
        }
        if (this.port instanceof WebSerialPort) {
            const info = this.port.getInfo();
            if (info && info.usbVendorId && info.usbProductId) {
                return {
                    type: 'usb',
                    portName: `USB ${info.usbVendorId}-${info.usbProductId}`,
                    usbVendorId: info.usbVendorId,
                    usbProductId: info.usbProductId,
                };
            }
            return { type: 'usb', portName: 'Web Serial Port' };
        }
        if (this.port instanceof ElectronPort) {
            return { type: 'usb', portName: options.path };
        }
        return { type: 'usb', portName: 'Unknown' };
    }
}