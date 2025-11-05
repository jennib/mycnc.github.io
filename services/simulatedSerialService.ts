import { ConsoleLog, MachineState, PortInfo } from '../types';

const getParam = (gcode: string, param: string): number | null => {
    // Allows for optional whitespace between parameter and value
    const regex = new RegExp(`${param}\\s*([-+]?[0-9]*\\.?[0-9]*)`, 'i');
    const match = gcode.match(regex);
    return match ? parseFloat(match[1]) : null;
};

interface SimulatedSerialManagerCallbacks {
    onConnect: (info: PortInfo) => void;
    onDisconnect: () => void;
    onLog: (log: ConsoleLog) => void;
    onProgress: (p: { percentage: number; linesSent: number; totalLines: number; }) => void;
    onError: (message: string) => void;
    onStatus: (status: MachineState, raw: string) => void;
}

export class SimulatedSerialManager {
    callbacks: SimulatedSerialManagerCallbacks;
    statusInterval: number | null = null;
    position: MachineState = {
        status: 'Idle',
        code: null,
        wpos: { x: 0, y: 0, z: 0 },
        mpos: { x: 0, y: 0, z: 0 },
        wco: { x: 0, y: 0, z: 0 },
        spindle: { state: 'off', speed: 0 },
        ov: [100, 100, 100],
    };

    isJobRunning = false;
    isPaused = false;
    isStopped = false;
    isDryRun = false;
    currentLineIndex = 0;
    totalLines = 0;
    gcode: string[] = [];
    positioningMode: 'absolute' | 'incremental' = 'absolute'; // 'absolute' (G90) or 'incremental' (G91)
    
    constructor(callbacks: SimulatedSerialManagerCallbacks) {
        this.callbacks = callbacks;
    }

    async connect(_baudRate: number) {
        this.callbacks.onConnect({ usbVendorId: 0xAAAA, usbProductId: 0xBBBB });
        this.callbacks.onLog({ type: 'received', message: "Grbl 1.1h ['$' for help]" });
        this.statusInterval = window.setInterval(() => {
            // Deep clone the position object to ensure React detects a state change
            const newPosition = JSON.parse(JSON.stringify(this.position));
            const rawStatus = `<${newPosition.status}|MPos:${newPosition.mpos.x.toFixed(3)},${newPosition.mpos.y.toFixed(3)},${newPosition.mpos.z.toFixed(3)}|WPos:${newPosition.wpos.x.toFixed(3)},${newPosition.wpos.y.toFixed(3)},${newPosition.wpos.z.toFixed(3)}|FS:${newPosition.spindle.state === 'off' ? 0 : newPosition.spindle.speed},${newPosition.spindle.speed}|WCO:${newPosition.wco!.x.toFixed(3)},${newPosition.wco!.y.toFixed(3)},${newPosition.wco!.z.toFixed(3)}>`;
            this.callbacks.onStatus(newPosition, rawStatus);
        }, 250);
    }

    async disconnect() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }
        this.callbacks.onDisconnect();
    }

    async sendOk(delay = 50) {
        return new Promise(resolve => {
            setTimeout(() => {
                this.callbacks.onLog({ type: 'received', message: 'ok' });
                resolve(true);
            }, delay);
        });
    }

    async sendLineAndWaitForOk(line: string, log = true) {
        // The existing sendLine already simulates waiting for 'ok'.
        return this.sendLine(line, log);
    }

    async sendLine(line: string, log = true) {
        if (log) {
            this.callbacks.onLog({ type: 'sent', message: line });
        }

        const upperLine = line.toUpperCase().trim();

        if (upperLine.startsWith('G38.2')) {
            this.callbacks.onLog({ type: 'status', message: 'Probing Z... (simulated)' });
            // Simulate probe touching 5mm below current Z
            const touchPoint = this.position.wpos.z - 5;
            this.position.wpos.z = touchPoint;
            this.position.mpos.z = touchPoint;
            this.callbacks.onLog({ type: 'received', message: `[PRB:0.000,0.000,${touchPoint.toFixed(3)}:1]` });
            await this.sendOk();
            return;
        }

        if (upperLine === 'G90') {
            this.positioningMode = 'absolute';
            await this.sendOk();
            return;
        }
        
        if (upperLine === 'G91') {
            this.positioningMode = 'incremental';
            await this.sendOk();
            return;
        }

        if (upperLine.startsWith('G0') || upperLine.startsWith('G1')) {
            const x = getParam(upperLine, 'X');
            const y = getParam(upperLine, 'Y');
            const z = getParam(upperLine, 'Z');
            
            if (this.positioningMode === 'incremental') {
                if(x !== null) { this.position.wpos.x += x; this.position.mpos.x += x; }
                if(y !== null) { this.position.wpos.y += y; this.position.mpos.y += y; }
                if(z !== null) { this.position.wpos.z += z; this.position.mpos.z += z; }
            } else { // absolute
                if(x !== null) { this.position.wpos.x = x; this.position.mpos.x = x + this.position.wco!.x; }
                if(y !== null) { this.position.wpos.y = y; this.position.mpos.y = y + this.position.wco!.y; }
                if(z !== null) { this.position.wpos.z = z; this.position.mpos.z = z + this.position.wco!.z; }
            }
            await this.sendOk();
            return;
        }

        if (upperLine.startsWith('M3')) {
            const speed = getParam(upperLine, 'S') ?? this.position.spindle.speed ?? 1000;
            this.position.spindle.state = 'cw';
            this.position.spindle.speed = speed;
            this.callbacks.onLog({ type: 'status', message: `Spindle ON (CW) at ${speed} RPM.` });
            await this.sendOk();
            return;
        }

        if (upperLine.startsWith('M4')) {
            const speed = getParam(upperLine, 'S') ?? this.position.spindle.speed ?? 1000;
            this.position.spindle.state = 'ccw';
            this.position.spindle.speed = speed;
            this.callbacks.onLog({ type: 'status', message: `Spindle ON (CCW) at ${speed} RPM.` });
            await this.sendOk();
            return;
        }

        if (upperLine.startsWith('M5')) {
            this.position.spindle.state = 'off';
            this.position.spindle.speed = 0;
            this.callbacks.onLog({ type: 'status', message: `Spindle OFF.` });
            await this.sendOk();
            return;
        }

        if (upperLine === '$X') {
            if (this.position.status === 'Alarm') {
                this.position.status = 'Idle';
                this.position.code = null;
                this.callbacks.onLog({ type: 'status', message: '[MSG:Caution: Unlocked]' });
            }
            await this.sendOk();
            return;
        }
        
        if (upperLine.startsWith('$J=G91')) {
            const x = getParam(upperLine, 'X') || 0;
            const y = getParam(upperLine, 'Y') || 0;
            const z = getParam(upperLine, 'Z') || 0;
            
            this.position.status = 'Jog';
            
            // Simulate that the jog move takes some time to complete
            setTimeout(() => {
                this.position.wpos.x += x;
                this.position.wpos.y += y;
                this.position.wpos.z += z;
                this.position.mpos.x += x;
                this.position.mpos.y += y;
                this.position.mpos.z += z;
                this.position.status = 'Idle';
            }, 300);

            await this.sendOk(10); // Send 'ok' quickly, as real GRBL does
            return;
        }

        if (upperLine.startsWith('G10 L20 P1')) {
            const xParam = getParam(upperLine, 'X');
            const yParam = getParam(upperLine, 'Y');
            const zParam = getParam(upperLine, 'Z');
            
            if (xParam !== null) { this.position.wco!.x = this.position.mpos.x - xParam; this.position.wpos.x = xParam; }
            if (yParam !== null) { this.position.wco!.y = this.position.mpos.y - yParam; this.position.wpos.y = yParam; }
            if (zParam !== null) { this.position.wco!.z = this.position.mpos.z - zParam; this.position.wpos.z = zParam; }
            await this.sendOk();
            return;
        }

        if (upperLine.startsWith('$H')) {
            this.position.status = 'Home';
            // Simulate homing process running in the background
            setTimeout(() => {
                if (upperLine === '$H' || upperLine.includes('X')) { this.position.mpos.x = 0; }
                if (upperLine === '$H' || upperLine.includes('Y')) { this.position.mpos.y = 0; }
                if (upperLine === '$H' || upperLine.includes('Z')) { this.position.mpos.z = 0; }
                
                // After MPos is reset, WPos is calculated from the existing WCO
                this.position.wpos.x = this.position.mpos.x - this.position.wco!.x;
                this.position.wpos.y = this.position.mpos.y - this.position.wco!.y;
                this.position.wpos.z = this.position.mpos.z - this.position.wco!.z;

                this.position.status = 'Idle';
            }, 1000); // Homing takes time
            
            // GRBL sends 'ok' immediately after receiving the command
            await this.sendOk(100); 
            return;
        }
        
        await this.sendOk();
    }

    async sendRealtimeCommand(command: string) {
        let newFeed = this.position.ov[0];
        switch (command) {
            case '\x90': newFeed = 100; break; // 100%
            case '\x91': newFeed += 10; break; // +10%
            case '\x92': newFeed -= 10; break; // -10%
            case '\x93': newFeed += 1; break; // +1%
            case '\x94': newFeed -= 1; break; // -1%
        }
        // Clamp to user-requested range for simulation
        this.position.ov[0] = Math.max(25, Math.min(300, newFeed));
    }

    sendGCode(gcodeLines: string[], options: { startLine?: number; isDryRun?: boolean; } = {}) {
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
        this.position.status = 'Run';

        let logMessage = `Starting G-code job from line ${startLine + 1}: ${this.totalLines} total lines.`;
        if (isDryRun) {
            logMessage += ' (Dry Run enabled)';
        }
        this.callbacks.onLog({ type: 'status', message: logMessage });

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
            this.position.status = 'Idle';
            this.callbacks.onLog({ type: 'status', message: 'Job stopped by user.' });
            return;
        }

        if (this.isPaused) {
            return;
        }
        
        if (this.currentLineIndex >= this.totalLines) {
            this.isJobRunning = false;
            this.position.status = 'Idle';
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
            setTimeout(() => this.sendNextLine(), 50); // Maintain job speed
            return;
        }
        
        await this.sendLine(line, false); // Rely on sendLine to update machine state
        this.currentLineIndex++;
        
        this.callbacks.onProgress({
            percentage: (this.currentLineIndex / this.totalLines) * 100,
            linesSent: this.currentLineIndex,
            totalLines: this.totalLines
        });

        setTimeout(() => this.sendNextLine(), 50); 
    }

    pause() {
        if (this.isJobRunning && !this.isPaused) {
            this.isPaused = true;
            this.position.status = 'Hold';
            this.callbacks.onLog({ type: 'status', message: 'Job paused.' });
        }
    }

    resume() {
        if (this.isJobRunning && this.isPaused) {
            this.isPaused = false;
            this.position.status = 'Run';
            this.callbacks.onLog({ type: 'status', message: 'Job resumed.' });
            this.sendNextLine();
        }
    }

    stopJob() {
        if (this.isJobRunning) {
            this.isStopped = true;
            this.isJobRunning = false;
            this.position.status = 'Alarm';
            this.position.code = 3; // Reset while in motion
            this.callbacks.onLog({ type: 'status', message: 'Job stopped. Soft-reset sent to clear buffer and stop spindle.' });
        }
    }

    emergencyStop() {
        this.isStopped = true;
        this.isJobRunning = false;
        this.position.status = 'Alarm';
        this.position.code = 3; // Simulate a reset while in motion alarm
        this.callbacks.onLog({ type: 'sent', message: 'CTRL-X' });
    }
}