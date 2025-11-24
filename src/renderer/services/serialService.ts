import { ConsoleLog, MachineState, PortInfo, MachinePosition } from '../types';

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    const arrCopy = [] as any[];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepClone(obj[i]);
    }
    return arrCopy as any;
  }

  const objCopy = {} as { [key: string]: any };
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      objCopy[key] = deepClone((obj as any)[key]);
    }
  }

  return objCopy as T;
}
import { parseGrblStatus } from './grblParser';

// Declare the Electron API on the Window object
declare global {
    interface Window {
        electronAPI?: {
            isElectron: boolean;
            connectTCP: (ip: string, port: number) => Promise<boolean>;
            sendTCP: (data: string) => void;
            disconnectTCP: () => void;
            onTCPData: (callback: (data: string) => void) => void;
            onTCPError: (callback: (error: string) => void) => void;
            onTCPDisconnect: (callback: () => void) => void;
        };
    }
}

interface SerialManagerCallbacks {
    onConnect: (info: PortInfo) => void;
    onDisconnect: () => void;
    onLog: (log: ConsoleLog) => void;
    onProgress: (p: { percentage: number; linesSent: number; totalLines: number; }) => void;
    onError: (message: string) => void;
    onStatus: (status: MachineState, raw: string) => void;
}

export class SerialManager {
    port: any = null; // For Web Serial API
    reader: any = null;
    writer: any = null;
    settings: MachineSettings;
    callbacks: SerialManagerCallbacks;

    isJobRunning = false;
    isPaused = false;

    isStopped = false;
    isDryRun = false;
    currentLineIndex = 0;
    totalLines = 0;
    gcode: string[] = [];
    statusInterval: number | null = null;
    normalPollingRate = 1000;
    alarmPollingRate = 1000;
    isPollingInAlarmState = false;
    
    // State is now managed within the service to handle partial updates correctly.
    spindleDirection: 'cw' | 'ccw' | 'off' = 'off';
    lastStatus: MachineState = {
        status: 'Idle',
        code: null,
        wpos: { x: 0, y: 0, z: 0 },
        mpos: { x: 0, y: 0, z: 0 },
        wco: { x: 0, y: 0, z: 0 },
        spindle: { state: 'off', speed: 0 },
        ov: [100, 100, 100],
    };

    linePromiseResolve: (() => void) | null = null;
    linePromiseReject: ((reason?: any) => void) | null = null;

    isDisconnecting = false;
    isHandshakeInProgress = false;
    isElectron: boolean;
    connectionType: 'usb' | 'tcp' | null = null;
    tcpBuffer: string = ''; // Buffer for incoming TCP data

    constructor(settings: MachineSettings, callbacks: SerialManagerCallbacks) {
        this.settings = settings;
        this.callbacks = callbacks;
        this.isElectron = !!window.electronAPI?.isElectron;
    }

    async connect(baudRate: number) {
        if (this.port) { // Already connected or connecting
            this.callbacks.onError("A connection attempt is already in progress.");
            return;
        }
        if (!('serial' in navigator)) {
            this.callbacks.onError("Web Serial API not supported.");
            return;
        }

        this.isHandshakeInProgress = true;
        try {
            this.port = await (navigator as any).serial.requestPort();
            await this.port.open({ baudRate });
            
            // Reset state for new connection
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

            const usbPortInfo = this.port.getInfo();
            this.connectionType = 'usb';
            
            this.port.addEventListener('disconnect', () => {
                this.disconnect();
            });

            this.reader = this.port.readable.getReader();
            this.writer = this.port.writable.getWriter();

            this.readLoop(); // Start reading immediately

            // Add a short delay to allow the serial port to initialize fully
            await new Promise(resolve => setTimeout(resolve, 1000));

            // GRBL Handshake: Send a soft-reset to get the welcome message
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Connection timed out. No GRBL welcome message received."));
                }, 2500); // 2.5 second timeout

                const originalOnLog = this.callbacks.onLog;
                this.callbacks.onLog = (log) => {
                    if (log.type === 'received' && log.message.toLowerCase().includes('grbl')) {
                        clearTimeout(timeout);
                        this.callbacks.onLog = originalOnLog; // Restore original handler
                        originalOnLog(log); // Log the welcome message
                        resolve();
                    } else {
                        originalOnLog(log);
                    }
                };

                // Send soft-reset character (Ctrl-X)
                this.sendRealtimeCommand('\x18').catch(reject);
            });

            this.isHandshakeInProgress = false;

            // If handshake is successful, proceed with connection setup
            this.callbacks.onConnect({
                type: 'usb',
                portName: usbPortInfo.usbProductId ? `USB (VID: ${usbPortInfo.usbVendorId}, PID: ${usbPortInfo.usbProductId})` : 'USB Device',
                usbVendorId: usbPortInfo.usbVendorId,
                usbProductId: usbPortInfo.usbProductId,
            });
            
            this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), this.normalPollingRate);
            this.isPollingInAlarmState = false;

        } catch (error) {
            this.isHandshakeInProgress = false;
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            this.callbacks.onError(`Failed to connect: ${errorMessage}`);
            if (this.port) {
                // Ensure we disconnect if any part of the connection process fails
                await this.disconnect();
            }
        }
    }

    async connectTCP(ip: string, port: number) {
        if (this.connectionType) { // Already connected or connecting
            this.callbacks.onError("A connection attempt is already in progress.");
            return;
        }
        if (!this.isElectron || !window.electronAPI) {
            this.callbacks.onError("TCP connection is only available in Electron environment.");
            return;
        }

        this.isHandshakeInProgress = true;
        try {
            // Reset state for new connection
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

            // Set up listeners for TCP data
            window.electronAPI.onTCPData((data) => {
                // TCP data might come in chunks, so we need to buffer and split by newline
                this.tcpBuffer += data;
                const lines = this.tcpBuffer.split('\n');
                this.tcpBuffer = lines.pop()!; // Keep the last, possibly incomplete, line
                lines.forEach(line => this.processIncomingData(line));
            });
            window.electronAPI.onTCPError((error) => {
                this.callbacks.onError(`TCP Error: ${error}`);
                this.disconnect();
            });
            window.electronAPI.onTCPDisconnect(() => {
                this.callbacks.onLog({ type: 'status', message: 'TCP connection lost.' });
                this.disconnect();
            });

            const connected = await window.electronAPI.connectTCP(ip, port);

            if (connected) {
                this.connectionType = 'tcp';

                // Add a short delay to allow the connection to stabilize
                await new Promise(resolve => setTimeout(resolve, 1000));

                // GRBL Handshake for TCP: Send a soft-reset to get the welcome message
                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error("Connection timed out. No GRBL welcome message received."));
                    }, 2500); // 2.5 second timeout

                    const originalOnLog = this.callbacks.onLog;
                    this.callbacks.onLog = (log) => {
                        if (log.type === 'received' && log.message.toLowerCase().includes('grbl')) {
                            clearTimeout(timeout);
                            this.callbacks.onLog = originalOnLog; // Restore original handler
                            originalOnLog(log); // Log the welcome message
                            resolve();
                        } else {
                            originalOnLog(log);
                        }
                    };

                    // Send soft-reset character (Ctrl-X)
                    this.sendRealtimeCommand('\x18').catch(reject);
                });
                
                this.isHandshakeInProgress = false;

                this.callbacks.onConnect({ type: 'tcp', ip, port });
                this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), this.normalPollingRate);
                this.isPollingInAlarmState = false;
            } else {
                this.callbacks.onError("Failed to establish TCP connection.");
                this.disconnect();
            }
        } catch (error) {
            this.isHandshakeInProgress = false;
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            this.callbacks.onError(`Failed to connect via TCP: ${errorMessage}`);
            this.disconnect();
        }
    }

    async disconnect() {
        if (this.isDisconnecting || (!this.port && this.connectionType !== 'tcp')) return;
        this.isDisconnecting = true;
    
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }

        // If a command is pending, reject it.
        if (this.linePromiseReject) {
            this.linePromiseReject(new Error('Connection disconnected.'));
            this.linePromiseResolve = null;
            this.linePromiseReject = null;
        }

        // If a job was running, send a soft-reset to stop the machine.
        if (this.isJobRunning) {
            this.isJobRunning = false;
            this.isPaused = false;
            this.isStopped = true;
            this.sendRealtimeCommand('\x18').catch(err => console.error("Failed to send soft-reset on disconnect:", err));
        }
    
        try {
            if (this.connectionType === 'usb' && this.port) {
                // Let port.close() handle the stream cancellations.
                await this.port.close();
            } else if (this.connectionType === 'tcp' && this.isElectron && window.electronAPI) {
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
            this.callbacks.onDisconnect();
        }
    }
    


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
                    this.callbacks.onError("Device disconnected unexpectedly. Please reconnect.");
                    this.disconnect();
                } else {
                    this.callbacks.onError("Error reading from serial port.");
                }
                break;
            }
        }
    }

    processIncomingData(line: string) {
        const trimmedValue = line.trim();
        if (trimmedValue.startsWith('<') && trimmedValue.endsWith('>')) {
            const previousStatus = this.lastStatus.status; // Capture state before processing new status
            const statusUpdate = parseGrblStatus(trimmedValue, this.lastStatus);
            if (statusUpdate) {
                // A more robust state update. Instead of merging with spread syntax,
                // we explicitly build the new state to prevent stale properties
                // (like an alarm 'code') from persisting incorrectly.
                this.lastStatus = {
                    status: statusUpdate.status,
                    code: statusUpdate.code,
                    wpos: statusUpdate.wpos || this.lastStatus.wpos,
                    mpos: statusUpdate.mpos || this.lastStatus.mpos,
                    wco: statusUpdate.wco || this.lastStatus.wco,
                    ov: statusUpdate.ov || this.lastStatus.ov,
                    spindle: {
                        ...this.lastStatus.spindle,
                        ...(statusUpdate.spindle || {}),
                    }
                };
        
                // Send a deep clone to React to ensure re-render
                this.callbacks.onStatus(deepClone(this.lastStatus), trimmedValue);

                const isAlarm = this.lastStatus.status === 'Alarm';

                if (isAlarm && !this.isPollingInAlarmState) {
                    // Transitioning to Alarm state polling
                    if (this.statusInterval) {
                        clearInterval(this.statusInterval);
                    }
                    this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), this.alarmPollingRate);
                    this.isPollingInAlarmState = true;
                    this.callbacks.onLog({ type: 'status', message: 'Machine in Alarm state. Reducing status polling rate.' });
            
                } else if (!isAlarm && this.isPollingInAlarmState) {
                    // Transitioning back from Alarm state
                    if (this.statusInterval) {
                        clearInterval(this.statusInterval);
                    }
                    this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), this.normalPollingRate);
                    this.isPollingInAlarmState = false;
                    this.callbacks.onLog({ type: 'status', message: 'Alarm cleared. Resuming normal status polling rate.' });
                }

                // If a jog just completed, request another status update to ensure we have the final position.
                if (previousStatus === 'Jog' && this.lastStatus.status === 'Idle') {
                    this.requestStatusUpdate();
                }
            }
        } else if (trimmedValue) {
            if (trimmedValue.startsWith('error:')) {
                if (this.isHandshakeInProgress) {
                    this.callbacks.onLog({ type: 'status', message: `GRBL error during handshake (squelched): ${trimmedValue}` });
                    if (this.linePromiseReject) {
                        this.linePromiseReject(new Error(trimmedValue));
                        this.linePromiseResolve = null;
                        this.linePromiseReject = null;
                    }
                    return; // Stop further processing of this error
                }

                // If a job is running (i.e., a promise is pending for an 'ok'),
                // reject the promise and let the job handler log the error contextually.
                // Otherwise, it's a manual command error, so report it directly.
                if (this.linePromiseReject) {
                    this.linePromiseReject(new Error(trimmedValue));
                    this.linePromiseResolve = null;
                    this.linePromiseReject = null;
                } else {
                    this.callbacks.onError(`GRBL Error: ${trimmedValue}`);
                }
            }
            else {
                this.callbacks.onLog({ type: 'received', message: trimmedValue });
                                                    if (trimmedValue.startsWith('ok')) {
                                                        if (this.linePromiseResolve) {
                                                            this.linePromiseResolve();
                                                            this.linePromiseResolve = null;
                                                            this.linePromiseReject = null;
                                                        }
                                                    }            }
        }
    }

    async sendLineAndWaitForOk(line: string, log = true, timeout = 10000) {
        return new Promise<void>((resolve, reject) => {
            if (this.linePromiseResolve) {
                return reject(new Error("Cannot send new line while another is awaiting 'ok'."));
            }
    
            const timeoutId = setTimeout(() => {
                this.linePromiseResolve = null;
                this.linePromiseReject = null;
                reject(new Error(`Command timed out after ${timeout / 1000}s: ${line}`));
            }, timeout);
    
            this.linePromiseResolve = () => {
                clearTimeout(timeoutId);
                resolve();
            };
    
            this.linePromiseReject = (reason) => {
                clearTimeout(timeoutId);
                reject(reason);
            };
    
            this.sendLine(line, log).catch(err => {
                this.linePromiseReject?.(err);
            });
        });
    }

    async sendLine(line: string, log = true) {
        // Guard against sending empty or whitespace-only lines to GRBL.
        if (!line || line.trim() === '') {
            return;
        }

        const upperLine = line.trim().toUpperCase();
        if (upperLine.startsWith('M3')) {
            this.spindleDirection = 'cw';
            this.lastStatus.spindle.state = 'cw';
        } else if (upperLine.startsWith('M4')) {
            this.spindleDirection = 'ccw';
            this.lastStatus.spindle.state = 'ccw';
        } else if (upperLine.startsWith('M5')) {
            this.spindleDirection = 'off';
            this.lastStatus.spindle.state = 'off';
        }


        if (this.connectionType === 'usb' && this.writer) {
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(line + '\n');
                await this.writer.write(data);
                if (log) {
                    this.callbacks.onLog({ type: 'sent', message: line });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                if (this.isDisconnecting) {
                    // Expected error during disconnect.
                } else if (errorMessage.includes("device has been lost") || errorMessage.includes("The port is closed.")) {
                    this.callbacks.onError("Device disconnected unexpectedly. Please reconnect.");
                    this.disconnect();
                } else {
                    this.callbacks.onError("Error writing to serial port.");
                }
                throw error;
            }
        } else if (this.connectionType === 'tcp' && this.isElectron && window.electronAPI) {
            try {
                window.electronAPI.sendTCP(line + '\n');
                if (log) {
                    this.callbacks.onLog({ type: 'sent', message: line });
                }
            } catch (error) {
                this.callbacks.onError("Error writing to TCP socket.");
                throw error;
            }
        } else {
            this.callbacks.onError("Not connected to any device.");
            throw new Error("Not connected.");
        }
    }

    async sendRealtimeCommand(command: string) {
        if (this.connectionType === 'usb' && this.writer) {
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(command);
                await this.writer.write(data);
                // Real-time commands are not logged to the console to avoid clutter.
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                if (this.isDisconnecting) {
                    // Expected error during disconnect.
                } else if (errorMessage.includes("device has been lost") || errorMessage.includes("The port is closed.")) {
                    this.callbacks.onError("Device disconnected unexpectedly. Please reconnect.");
                    this.disconnect();
                } else {
                    this.callbacks.onError("Error writing to serial port.");
                }
                throw error;
            }
        } else if (this.connectionType === 'tcp' && this.isElectron && window.electronAPI) {
            try {
                window.electronAPI.sendTCP(command);
            } catch (error) {
                this.callbacks.onError("Error writing real-time command to TCP socket.");
                throw error;
            }
        } else {
            this.callbacks.onError("Not connected to any device.");
            throw new Error("Not connected.");
        }
    }

    requestStatusUpdate() {
        if (this.connectionType === 'usb' && this.writer) {
            // This write is silent and doesn't need to be awaited
            const encoder = new TextEncoder();
            this.writer.write(encoder.encode('?')).catch(() => {});
        } else if (this.connectionType === 'tcp' && this.isElectron && window.electronAPI) {
            window.electronAPI.sendTCP('?');
        }
    }

    sendGCode(gcodeLines: string[], options: { startLine?: number; isDryRun?: boolean } = {}) {
        if (this.isJobRunning) {
            this.callbacks.onError("A job is already running.");
            return;
        }

        const { startLine = 0, isDryRun = false } = options;

        this.gcode = gcodeLines;
        this.totalLines = gcodeLines.length;
        this.currentLineIndex = startLine;
        this.isDryRun = isDryRun;
        this.isJobRunning = true;
        this.isPaused = false;
        this.isStopped = false;

        let logMessage = `Starting G-code job from line ${startLine + 1}: ${this.totalLines} total lines.`;
        if (isDryRun) {
            logMessage += ' (Dry Run enabled)';
        }
        this.callbacks.onLog({ type: 'status', message: logMessage });
        
        // Fire initial progress update
        this.callbacks.onProgress({
            percentage: (this.currentLineIndex / this.totalLines) * 100,
            linesSent: this.currentLineIndex,
            totalLines: this.totalLines
        });

        this.sendNextLine();
    }

    async sendNextLine() {
        if (this.isStopped) {
            this.isJobRunning = false;
            this.callbacks.onLog({ type: 'status', message: 'Job stopped by user.' });
            return;
        }



        if (this.isPaused) {
            return;
        }
        
        if (this.currentLineIndex >= this.totalLines) {
            this.isJobRunning = false;
            return;
        }

        const line = this.gcode[this.currentLineIndex];
        const upperLine = line.toUpperCase().trim();

        if (this.isDryRun && (upperLine.startsWith('M3') || upperLine.startsWith('M4') || upperLine.startsWith('M5'))) {
            this.callbacks.onLog({ type: 'status', message: `Skipped (Dry Run): ${line}` });
            this.currentLineIndex++;
            this.callbacks.onProgress({
                percentage: (this.currentLineIndex / this.totalLines) * 100,
                linesSent: this.currentLineIndex,
                totalLines: this.totalLines
            });
            setTimeout(() => this.sendNextLine(), 0);
            return;
        }

        try {
            await this.sendLineAndWaitForOk(line);

            if ((upperLine.startsWith('M3') || upperLine.startsWith('M4')) && this.settings.spindle.warmupDelay > 0) {
                const delayInSeconds = this.settings.spindle.warmupDelay / 1000;
                await this.sendLineAndWaitForOk(`G4 P${delayInSeconds}`);
            }
            
            this.currentLineIndex++;

            this.callbacks.onProgress({
                percentage: (this.currentLineIndex / this.totalLines) * 100,
                linesSent: this.currentLineIndex,
                totalLines: this.totalLines
            });

            // Schedule the next line to be sent on the next frame to avoid deep call stacks.
            setTimeout(() => this.sendNextLine(), 0); 
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            if (errorMessage.includes('Job paused by user.')) {
                // This is an expected interruption when pausing. We just stop the send loop.
                return;
            }

            this.isJobRunning = false;
            this.isStopped = true;
            
            if (errorMessage.includes("device has been lost") || errorMessage.includes("The port is closed.")) {
                this.callbacks.onLog({ type: 'error', message: `Job aborted due to disconnection.` });
            } else if (!errorMessage.includes('Job stopped by user.')) {
                this.callbacks.onLog({ type: 'error', message: `Job halted on line ${this.currentLineIndex + 1}: ${this.gcode[this.currentLineIndex]}` });
                this.callbacks.onError(`Job halted due to GRBL error: ${errorMessage}`);
            }
        }
    }

    async pause() {
        if (this.isJobRunning && !this.isPaused) {
            this.isPaused = true;

            // If a line is currently waiting for an 'ok', we need to interrupt it.
            if (this.linePromiseReject) {
                this.linePromiseReject(new Error('Job paused by user.'));
                this.linePromiseResolve = null;
                this.linePromiseReject = null;
            }

            // The UI will handle the warning about the spindle. We just send the command.
            await this.sendRealtimeCommand('!'); // Feed Hold
            this.callbacks.onLog({ type: 'status', message: 'Job paused.' });
        }
    }

    async resume() {
        if (this.isJobRunning && this.isPaused) {
            this.isPaused = false;
            this.callbacks.onLog({ type: 'status', message: 'Resuming job...' });

            /*
            // Run the resume script if it exists.
            const resumeScript = this.settings.scripts.jobResume.split('\n');
            for (const line of resumeScript) {
                if (line.trim()) {
                    await this.sendLineAndWaitForOk(line);
                }
            }
            */

            await this.sendRealtimeCommand('~'); // Cycle Resume
            this.callbacks.onLog({ type: 'status', message: 'Job resumed.' });
            // Give GRBL a moment to process the resume command before sending the next line.
            setTimeout(() => this.sendNextLine(), 250);
        }
    }



    async stopJob() {
        if (this.isJobRunning) {
            this.isStopped = true;
            this.isJobRunning = false;
            this.isPaused = false; // Reset pause state on stop
            
            if (this.linePromiseReject) {
                this.linePromiseReject(new Error('Job stopped by user.'));
                this.linePromiseResolve = null;
                this.linePromiseReject = null;
            }

            try {
                await this.sendRealtimeCommand('\x18'); // Soft-reset (Ctrl-X)
                await new Promise(resolve => setTimeout(resolve, 500)); // Give GRBL time to reset
                this.callbacks.onLog({ type: 'status', message: 'Soft reset sent. Attempting to unlock GRBL...' });
                
                // Send $X to unlock. This might fail if GRBL is still busy, so we catch the error.
                try {
                    await this.sendLineAndWaitForOk('$X');
                    this.callbacks.onLog({ type: 'status', message: 'GRBL unlocked successfully.' });
                } catch (unlockError) {
                    this.callbacks.onLog({ type: 'error', message: `Failed to unlock GRBL with $X: ${unlockError.message}. Manual unlock might be required.` });
                }
            } finally {
            }
        }
    }
    
    emergencyStop() {
        this.isStopped = true;
        this.isJobRunning = false;
        if (this.linePromiseReject) {
            this.linePromiseReject(new Error('Emergency Stop'));
            this.linePromiseResolve = null;
            this.linePromiseReject = null;
        }
        
        const command = '\x18'; // Soft Reset
        this.callbacks.onLog({ type: 'info', message: 'EMERGENCY STOP' });

        // Bypass normal checks to send e-stop if at all possible.
        try {
            if (this.connectionType === 'usb' && this.writer) {
                const encoder = new TextEncoder();
                const data = encoder.encode(command);
                this.writer.write(data).catch(err => {
                    console.warn("E-stop USB write failed, connection may be lost.", err);
                });
            } else if (this.connectionType === 'tcp' && window.electronAPI) {
                window.electronAPI.sendTCP(command);
            } else {
                // As a last resort, if we are in electron, try sending to TCP anyway
                if (window.electronAPI) {
                    window.electronAPI.sendTCP(command);
                }
            }
        } catch(e) {
            console.warn("Could not send e-stop command.", e);
        }
    }
}
