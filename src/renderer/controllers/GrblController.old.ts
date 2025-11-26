import { MachineState, ConnectionOptions, ConsoleLog, PortInfo, MachineSettings } from '../types';
import { Controller } from './Controller';
import { parseGrblStatus } from '../services/grblParser';

// A simple event emitter
type Listener = (data: any) => void;

class EventEmitter {
    private listeners: { [event: string]: Listener[] } = {};

    on(event: string, listener: Listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    off(event: string, listener: Listener) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }

    emit(event: string, data: any) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(listener => listener(data));
    }
}

export class GrblController implements Controller {
    port: any = null;
    reader: any = null;
    writer: any = null;
    settings: MachineSettings;
    
    private emitter = new EventEmitter();
    isHandshakeInProgress = false;
    isDisconnecting = false;
    linePromiseResolve: (() => void) | null = null;
    linePromiseReject: ((reason?: any) => void) | null = null;
    lastStatus: MachineState = {
        status: 'Idle',
        code: null,
        wpos: { x: 0, y: 0, z: 0 },
        mpos: { x: 0, y: 0, z: 0 },
        wco: { x: 0, y: 0, z: 0 },
        spindle: { state: 'off', speed: 0 },
        ov: [100, 100, 100],
    };

    constructor(settings: MachineSettings) {
        this.settings = settings;
    }
    // ... (on, off, connect, disconnect methods)

    async readLoop() {
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
                    buffer = lines.pop()!; // Keep the last, possibly incomplete, line

                    lines.forEach(line => {
                        this.processIncomingData(line);
                    });
                }
            } catch (error) {
                if (this.linePromiseReject) {
                    this.linePromiseReject(new Error("Serial connection lost during read."));
                    this.linePromiseResolve = null;
                    this.linePromiseReject = null;
                }
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                 if (this.isDisconnecting) {
                    // Error is expected during a manual disconnect.
                } else if (errorMessage.includes("device has been lost") || errorMessage.includes("The port is closed.")) {
                    this.emitter.emit('error', "Device disconnected unexpectedly. Please reconnect.");
                    this.disconnect();
                } else {
                    this.emitter.emit('error', "Error reading from serial port.");
                }
                break;
            }
        }
    }

    processIncomingData(line: string) {
        const trimmedValue = line.trim();
        if (trimmedValue.startsWith('<') && trimmedValue.endsWith('>')) {
            const statusUpdate = parseGrblStatus(trimmedValue, this.lastStatus);
            if (statusUpdate) {
                this.lastStatus = {
                    ...this.lastStatus,
                    ...statusUpdate
                };
        
                this.emitter.emit('state', this.lastStatus);
            }
        } else if (trimmedValue) {
            if (trimmedValue.startsWith('error:')) {
                if (this.linePromiseReject) {
                    this.linePromiseReject(new Error(trimmedValue));
                    this.linePromiseResolve = null;
                    this.linePromiseReject = null;
                } else {
                    this.emitter.emit('error', `GRBL Error: ${trimmedValue}`);
                }
            }
            else {
                this.emitter.emit('data', { type: 'received', message: trimmedValue });
                if (trimmedValue.startsWith('ok')) {
                    if (this.linePromiseResolve) {
                        this.linePromiseResolve();
                        this.linePromiseResolve = null;
                        this.linePromiseReject = null;
                    }
                }
            }
        }
    }
}
