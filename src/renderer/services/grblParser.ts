import { MachineState } from '@/types';

export function parseGrblStatus(statusStr: string, lastStatus: MachineState): Partial<MachineState> | null {
    try {
        const content = statusStr.slice(1, -1);
        const parts = content.split('|');
        const statusPart = parts[0];
        const parsed: Partial<MachineState> = {};

        const rawStatus = statusPart.split(':')[0].toLowerCase();
        let status: MachineState['status'];

        if (rawStatus.startsWith('home')) { // Catches 'home', 'homing', 'homing cycle', etc.
            status = 'Home';
        } else if (rawStatus.startsWith('idle')) {
            status = 'Idle';
        } else if (rawStatus.startsWith('run')) {
            status = 'Run';
        } else if (rawStatus.startsWith('hold')) {
            status = 'Hold';
        } else if (rawStatus.startsWith('jog')) {
            status = 'Jog';
        } else if (rawStatus.startsWith('alarm')) {
            status = 'Alarm';
        } else if (rawStatus.startsWith('door')) {
            status = 'Door';
        } else if (rawStatus.startsWith('check')) {
            status = 'Check';
        } else if (rawStatus.startsWith('sleep')) {
            status = 'Sleep';
        } else {
            // Default to Idle for unknown states
            status = 'Idle';
        }

        let code: number | undefined = undefined;
        if (status === 'Alarm') {
            const alarmMatch = statusPart.match(/Alarm:(\d+)/);
            if (alarmMatch) {
                code = parseInt(alarmMatch[1], 10);
            }
        }

        // Always include status and code to ensure state is fully updated.
        parsed.status = status;
        parsed.code = code;

        // Log significant status changes (not every status report)
        if (status !== lastStatus.status) {
            console.log(`[Machine Status] ${lastStatus.status} → ${status}`);
        }

        for (const part of parts) {
            if (part.startsWith('WPos:')) {
                const coords = part.substring(5).split(',');
                const wpos = lastStatus.wpos ? { ...lastStatus.wpos } : { x: 0, y: 0, z: 0 };
                if (coords.length > 0 && coords[0] !== '' && !isNaN(parseFloat(coords[0]))) wpos.x = parseFloat(coords[0]);
                if (coords.length > 1 && coords[1] !== '' && !isNaN(parseFloat(coords[1]))) wpos.y = parseFloat(coords[1]);
                if (coords.length > 2 && coords[2] !== '' && !isNaN(parseFloat(coords[2]))) wpos.z = parseFloat(coords[2]);
                parsed.wpos = wpos;
            } else if (part.startsWith('MPos:')) {
                const coords = part.substring(5).split(',');
                const mpos = lastStatus.mpos ? { ...lastStatus.mpos } : { x: 0, y: 0, z: 0 };
                if (coords.length > 0 && coords[0] !== '' && !isNaN(parseFloat(coords[0]))) mpos.x = parseFloat(coords[0]);
                if (coords.length > 1 && coords[1] !== '' && !isNaN(parseFloat(coords[1]))) mpos.y = parseFloat(coords[1]);
                if (coords.length > 2 && coords[2] !== '' && !isNaN(parseFloat(coords[2]))) mpos.z = parseFloat(coords[2]);
                parsed.mpos = mpos;
            } else if (part.startsWith('WCO:')) {
                const coords = part.substring(4).split(',');
                const wco = lastStatus.wco ? { ...lastStatus.wco } : { x: 0, y: 0, z: 0 };
                if (coords.length > 0 && coords[0] !== '' && !isNaN(parseFloat(coords[0]))) wco.x = parseFloat(coords[0]);
                if (coords.length > 1 && coords[1] !== '' && !isNaN(parseFloat(coords[1]))) wco.y = parseFloat(coords[1]);
                if (coords.length > 2 && coords[2] !== '' && !isNaN(parseFloat(coords[2]))) wco.z = parseFloat(coords[2]);
                parsed.wco = wco;
            } else if (part.startsWith('FS:')) {
                const speeds = part.substring(3).split(',');
                // Preserve existing spindle state, only update speed
                const currentSpindleState = lastStatus.spindle?.state || 'off';
                if (!parsed.spindle) parsed.spindle = { state: currentSpindleState, speed: 0 };
                if (speeds.length > 1) {
                    parsed.spindle.speed = parseFloat(speeds[1]);
                }
            } else if (part.startsWith('A:')) {
                // Accessory State - contains spindle direction (S for CW, C for CCW)
                // Format: A:SFM where S=Spindle CW, C=Spindle CCW, F=Flood, M=Mist
                const accessoryState = part.substring(2);
                if (!parsed.spindle) parsed.spindle = { state: 'off', speed: lastStatus.spindle?.speed || 0 };

                if (accessoryState.includes('S')) {
                    parsed.spindle.state = 'cw';
                } else if (accessoryState.includes('C')) {
                    parsed.spindle.state = 'ccw';
                } else {
                    // If neither S nor C, spindle is off
                    parsed.spindle.state = 'off';
                }
            } else if (part.startsWith('Ov:')) {
                const ovParts = part.substring(3).split(',');
                if (ovParts.length === 3) {
                    parsed.ov = ovParts.map((p: string) => parseInt(p, 10)) as [number, number, number];
                }
            }
        }

        // If WPos wasn't in the status string, calculate it from MPos and WCO
        if (!parsed.wpos && parsed.mpos && (parsed.wco || lastStatus.wco)) {
            const wcoToUse = parsed.wco || lastStatus.wco!;
            parsed.wpos = {
                x: parsed.mpos.x - wcoToUse.x,
                y: parsed.mpos.y - wcoToUse.y,
                z: parsed.mpos.z - wcoToUse.z,
            };
        }

        return parsed;
    } catch (e) {
        console.error("Failed to parse GRBL status:", statusStr, e);
        return null; // Failed to parse
    }
}
