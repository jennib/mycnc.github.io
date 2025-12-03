import { PortInfo, ConnectionOptions } from '@/types';
import { Simulator } from './simulators/Simulator';

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
    private connectionType: 'usb' | 'tcp' | 'simulator' | null = null;
    private tcpBuffer: string = '';
    private simulator: Simulator | null = null;

    constructor(callbacks: SerialServiceCallbacks) {
        this.callbacks = callbacks;
    }

    get isConnected(): boolean {
        return (this.port !== null || this.connectionType === 'tcp' || this.connectionType === 'simulator');
    }

    async connect(options: ConnectionOptions): Promise<PortInfo> {
        if (this.isConnected) {
            throw new Error("A connection is already active.");
        }

        if (options.type === 'usb') {
            return this.connectUSB(options.baudRate || 115200);
        } else if (options.type === 'tcp') {
            if (!options.ip || !options.port) {
                throw new Error("IP and Port are required for TCP connection.");
            }
            return this.connectTCP(options.ip, options.port);
        } else if (options.type === 'simulator') {
            // The controller is responsible for creating the simulator and passing it to connectSimulator
            // But here we are in connect().
            // We need a way to pass the simulator instance or create it here?
            // The plan said: "In GrblController.connect(), if options.type === 'simulator', instantiate GrblSimulator and call serialService.connectSimulator()."
            // But SerialService.connect() is called by GrblController.connect().
            // So GrblController should call connectSimulator INSTEAD of connect?
            // Or connect() should handle it?
            // If I change connect() signature, I break the interface.
            // Let's make connect() throw if type is simulator, and expect connectSimulator to be called directly?
            // Or better, let connect() handle it if we can pass the simulator?
            // But ConnectionOptions doesn't have the simulator instance.
            // So GrblController should call connectSimulator directly.
            // But GrblController.connect takes ConnectionOptions.
            // So GrblController will see type='simulator', create the simulator, and call connectSimulator.
            // So here in SerialService.connect, we might not need to handle 'simulator' if GrblController handles it.
            // BUT, SerialService.connect is the main entry point.
            // Let's add a check here to throw or return dummy info if called with simulator type, 
            // but really GrblController should call connectSimulator.
            // Actually, let's allow connect() to be called with type='simulator' IF we have a way to get the simulator.
            // But we don't.
            // So let's throw an error here saying "Use connectSimulator for simulation".
            throw new Error("Use connectSimulator for simulation.");
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

    async connectSimulator(simulator: Simulator): Promise<PortInfo> {
        if (this.isConnected) {
            throw new Error("A connection is already active.");
        }

        this.simulator = simulator;
        this.simulator.on('data', (data) => {
            // Simulator sends raw data (lines or partial lines).
            // We should buffer it like we do for TCP/USB?
            // GrblSimulator emits full lines with \r\n usually.
            // But let's assume it behaves like a stream.
            // Actually GrblSimulator emits 'data' which are strings.
            // Let's just pass them to onData.
            // But wait, SerialService usually splits by newline.
            // GrblSimulator emits "ok\r\n".
            // If we just pass "ok\r\n" to onData, does onData handle it?
            // onData expects a line.
            // So we should probably split by newline here too.
            const lines = data.split('\n');
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed) {
                    this.callbacks.onData(trimmed);
                }
            });
        });

        await this.simulator.connect();
        this.connectionType = 'simulator';

        return {
            type: 'simulator',
            portName: 'Simulator',
        };
    }

    disconnect() {
        if (this.isDisconnecting || !this.isConnected) return;
        this.isDisconnecting = true;

        try {
            if (this.connectionType === 'usb' && this.port) {
                this.port.close();
            } else if (this.connectionType === 'tcp' && window.electronAPI) {
                window.electronAPI.disconnectTCP();
            } else if (this.connectionType === 'simulator' && this.simulator) {
                this.simulator.disconnect().catch(console.error);
            }
        } catch (error) {
            console.error("Error during disconnect:", error);
        } finally {
            this.port = null;
            this.reader = null;
            this.writer = null;
            this.simulator = null;
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
        } else if (this.connectionType === 'simulator' && this.simulator) {
            try {
                await this.simulator.write(data);
            } catch (error) {
                this.callbacks.onError("Error writing to simulator.");
                throw error;
            }
        }
    }
}
