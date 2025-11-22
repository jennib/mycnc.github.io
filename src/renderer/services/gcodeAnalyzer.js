
import { parseGCode } from './gcodeParser.js';

const getParam = (gcode, param) => {
    const regex = new RegExp(`${param}\\s*([-+]?[0-9]*\\.?[0-9]*)`, 'i');
    const match = gcode.match(regex);
    return match ? parseFloat(match[1]) : null;
};

export const analyzeGCode = (gcodeLines, settings) => {
    const warnings = [];
    // Don't analyze if there are no lines
    if (!gcodeLines || gcodeLines.length === 0) {
        return warnings;
    }
    const { bounds } = parseGCode(gcodeLines);

    // 1. Work Area Check
    if (bounds.maxX > settings.workArea.x) {
        warnings.push({ type: 'error', message: `Toolpath exceeds machine X+ travel (${bounds.maxX.toFixed(2)}mm > ${settings.workArea.x}mm).` });
    }
     if (bounds.minX < 0) {
        warnings.push({ type: 'warning', message: `Toolpath contains negative X coordinates (${bounds.minX.toFixed(2)}mm). Ensure WCS is set correctly.` });
    }
    if (bounds.maxY > settings.workArea.y) {
        warnings.push({ type: 'error', message: `Toolpath exceeds machine Y+ travel (${bounds.maxY.toFixed(2)}mm > ${settings.workArea.y}mm).` });
    }
     if (bounds.minY < 0) {
        warnings.push({ type: 'warning', message: `Toolpath contains negative Y coordinates (${bounds.minY.toFixed(2)}mm). Ensure WCS is set correctly.` });
    }
    if (bounds.maxZ > settings.workArea.z) {
        warnings.push({ type: 'warning', message: `Toolpath exceeds machine Z+ travel (${bounds.maxZ.toFixed(2)}mm > ${settings.workArea.z}mm).` });
    }
     if (bounds.minZ < 0) {
        warnings.push({ type: 'warning', message: `Toolpath plunges below Z0 (${bounds.minZ.toFixed(2)}mm). This is normal for cutting, but confirm your Z-zero is on the stock top.` });
    }
    
    // 2. Spindle Speed Check
    let maxSpindle = 0;
    let minSpindle = Infinity;
    let spindleFound = false;

    gcodeLines.forEach(line => {
        const upperLine = line.toUpperCase();
        if (upperLine.includes('M3') || upperLine.includes('M4')) {
            const s = getParam(upperLine, 'S');
            if (s !== null) {
                spindleFound = true;
                if (s > maxSpindle) maxSpindle = s;
                // Only consider non-zero speeds for minimum check
                if (s > 0 && s < minSpindle) minSpindle = s;
            }
        }
    });

    if (spindleFound) {
        if (maxSpindle > settings.spindle.max) {
            warnings.push({ type: 'error', message: `Job requests spindle speed of ${maxSpindle} RPM, but max is ${settings.spindle.max} RPM.` });
        }
        if (minSpindle < settings.spindle.min) {
            warnings.push({ type: 'warning', message: `Job requests spindle speed of ${minSpindle} RPM, but configured min is ${settings.spindle.min} RPM.` });
        }
    }

    return warnings;
};

export const getMachineStateAtLine = (gcodeLines, lineNumber) => {
    const state = {
        spindle: 'M5', // Default to spindle off
        speed: null,
        coolant: 'M9', // Default to coolant off
        workCoordinateSystem: 'G54', // Default WCS
        unitMode: 'G21', // Default to mm
        distanceMode: 'G90', // Default to absolute
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
            const s = getParam(upperLine, 'S');
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
        const wcsMatch = upperLine.match(/G5[4-9]/);
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
    });

    return state;
};
