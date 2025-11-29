


export interface GCodeAnalysisState {
    spindle: 'M3' | 'M4' | 'M5';
    speed: number | null;
    coolant: 'M7' | 'M8' | 'M9';
    workCoordinateSystem: string; // e.g., 'G54', 'G55', etc.
    unitMode: 'G20' | 'G21';
    distanceMode: 'G90' | 'G91';
    feedRate: number | null;
}

// Pre-compile regexes for efficiency
const sParamRegex = /S\s*([-+]?[0-9]*\.?[0-9]*)/i;
const fParamRegex = /F\s*([-+]?[0-9]*\.?[0-9]*)/i;
const g5xParamRegex = /G5[4-9]/;

const getParam = (gcode: string, regex: RegExp): number | null => {
    const match = gcode.match(regex);
    return match ? parseFloat(match[1]) : null;
};

export const getMachineStateAtLine = (gcodeLines: string[], lineNumber: number): GCodeAnalysisState => {
    const state: GCodeAnalysisState = {
        spindle: 'M5', // Default to spindle off
        speed: null,
        coolant: 'M9', // Default to coolant off
        workCoordinateSystem: 'G54', // Default WCS
        unitMode: 'G21', // Default to mm
        distanceMode: 'G90', // Default to absolute
        feedRate: null,
    };

    // Don't analyze if there are no lines or lineNumber is invalid
    if (!gcodeLines || gcodeLines.length === 0 || lineNumber <= 0) {
        return state;
    }

    const linesToAnalyze = gcodeLines.slice(0, lineNumber);

    linesToAnalyze.forEach(line => {
        const upperLine = line.toUpperCase().trim();

        // Spindle State (M3, M4, M5)
        if (upperLine.includes('M3') || upperLine.includes('M4')) {
            state.spindle = upperLine.includes('M3') ? 'M3' : 'M4';
            const s = getParam(upperLine, sParamRegex);
            if (s !== null) {
                state.speed = s;
            }
        } else if (upperLine.includes('M5')) {
            state.spindle = 'M5';
        }

        // Coolant State (M7, M8, M9)
        if (upperLine.includes('M7') || upperLine.includes('M8')) {
            state.coolant = upperLine.includes('M7') ? 'M7' : 'M8';
        } else if (upperLine.includes('M9')) {
            state.coolant = 'M9';
        }

        // Work Coordinate System (G54-G59)
        const wcsMatch = upperLine.match(g5xParamRegex);
        if (wcsMatch) {
            state.workCoordinateSystem = wcsMatch[0];
        }

        // Unit Mode (G20, G21)
        if (upperLine.includes('G20')) {
            state.unitMode = 'G20';
        } else if (upperLine.includes('G21')) {
            state.unitMode = 'G21';
        }

        // Distance Mode (G90, G91)
        if (upperLine.includes('G90')) {
            state.distanceMode = 'G90';
        } else if (upperLine.includes('G91')) {
            state.distanceMode = 'G91';
        }

        // Feed Rate
        const f = getParam(upperLine, fParamRegex);
        if (f !== null) {
            state.feedRate = f;
        }
    });

    return state;
};

// Create a new Web Worker instance
const analysisWorker = new Worker(new URL('../../services/gcodeAnalysisWorker.ts', import.meta.url), { type: 'module' });

export const analyzeGCodeWithWorker = (gcodeLines: string[], settings: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        analysisWorker.onmessage = (event) => {
            resolve(event.data);
        };
        analysisWorker.onerror = (error) => {
            reject(error);
        };
        analysisWorker.postMessage({ gcodeLines, settings });
    });
};
