
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
