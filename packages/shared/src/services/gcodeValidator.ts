/**
 * G-code validator for Monaco Editor
 * Provides real-time validation and linting
 */

import * as monaco from 'monaco-editor';
import { MachineSettings } from '../types';
import { getCommand } from '../constants/gcodeCommands';

export interface ValidationError {
    severity: monaco.MarkerSeverity;
    message: string;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
}

/**
 * Parse a G-code line and extract command and parameters
 */
function parseGCodeLine(line: string): {
    command: string | null;
    parameters: Map<string, number>;
    rawLine: string;
} {
    // Remove comments
    let cleanLine = line.replace(/\(.*?\)/g, '').replace(/;.*$/, '').trim();

    const parameters = new Map<string, number>();
    let command: string | null = null;

    // Extract G or M command
    const commandMatch = cleanLine.match(/([GM]\d+(\.\d+)?)/i);
    if (commandMatch) {
        command = commandMatch[1].toUpperCase();
    }

    // Extract parameters (X, Y, Z, F, S, etc.)
    const paramRegex = /([A-Z])(-?\d+(\.\d+)?)/gi;
    let match;
    while ((match = paramRegex.exec(cleanLine)) !== null) {
        const param = match[1].toUpperCase();
        const value = parseFloat(match[2]);
        parameters.set(param, value);
    }

    return { command, parameters, rawLine: line };
}

/**
 * Validate G-code against machine settings
 */
export function validateGCode(
    content: string,
    machineSettings: MachineSettings
): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = content.split('\n');

    // Track state
    let currentFeedRate: number | null = null;
    let currentSpindleSpeed: number | null = null;
    let isAbsoluteMode = true; // G90 is default
    let isMetric = true; // G21 is default
    let currentX = 0;
    let currentY = 0;
    let currentZ = 0;

    lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('(') || trimmedLine.startsWith(';') || trimmedLine === '%') {
            return;
        }

        const parsed = parseGCodeLine(line);
        const { command, parameters } = parsed;

        if (!command) {
            // No command found, but has parameters - might be missing command
            if (parameters.size > 0) {
                errors.push({
                    severity: monaco.MarkerSeverity.Warning,
                    message: 'Parameters without a command. Using previous modal command.',
                    startLineNumber: lineNumber,
                    startColumn: 1,
                    endLineNumber: lineNumber,
                    endColumn: line.length + 1,
                });
            }
            return;
        }

        // Get command info
        const cmdInfo = getCommand(command);

        // Check if command is supported in GRBL
        if (cmdInfo && !cmdInfo.grblSupported) {
            errors.push({
                severity: monaco.MarkerSeverity.Error,
                message: `${command} is not supported in GRBL`,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }

        // Update state based on command
        if (command === 'G90') isAbsoluteMode = true;
        if (command === 'G91') isAbsoluteMode = false;
        if (command === 'G20') isMetric = false;
        if (command === 'G21') isMetric = true;

        // Track feed rate
        if (parameters.has('F')) {
            currentFeedRate = parameters.get('F')!;
        }

        // Track spindle speed
        if (parameters.has('S')) {
            currentSpindleSpeed = parameters.get('S')!;
        }

        // Validate motion commands (G0, G1, G2, G3)
        if (['G0', 'G1', 'G2', 'G3'].includes(command)) {
            // Check for feed rate on G1, G2, G3
            if (['G1', 'G2', 'G3'].includes(command) && currentFeedRate === null) {
                errors.push({
                    severity: monaco.MarkerSeverity.Warning,
                    message: `${command} without feed rate (F). Feed rate must be set before cutting moves.`,
                    startLineNumber: lineNumber,
                    startColumn: 1,
                    endLineNumber: lineNumber,
                    endColumn: line.length + 1,
                });
            }

            // Validate feed rate range
            if (currentFeedRate !== null) {
                if (currentFeedRate <= 0) {
                    errors.push({
                        severity: monaco.MarkerSeverity.Error,
                        message: `Invalid feed rate: ${currentFeedRate}. Feed rate must be positive.`,
                        startLineNumber: lineNumber,
                        startColumn: 1,
                        endLineNumber: lineNumber,
                        endColumn: line.length + 1,
                    });
                }
                if (currentFeedRate > machineSettings.jogFeedRate * 2) {
                    errors.push({
                        severity: monaco.MarkerSeverity.Warning,
                        message: `Feed rate ${currentFeedRate} is unusually high. Maximum jog feed rate is ${machineSettings.jogFeedRate}.`,
                        startLineNumber: lineNumber,
                        startColumn: 1,
                        endLineNumber: lineNumber,
                        endColumn: line.length + 1,
                    });
                }
            }

            // Update position and check bounds
            if (isAbsoluteMode) {
                if (parameters.has('X')) currentX = parameters.get('X')!;
                if (parameters.has('Y')) currentY = parameters.get('Y')!;
                if (parameters.has('Z')) currentZ = parameters.get('Z')!;
            } else {
                if (parameters.has('X')) currentX += parameters.get('X')!;
                if (parameters.has('Y')) currentY += parameters.get('Y')!;
                if (parameters.has('Z')) currentZ += parameters.get('Z')!;
            }

            // Check work area bounds
            // We cannot reliably check bounds without knowing the WCS offset (G54-G59)
            // G-code coordinates are relative to WCS, not Machine Zero.
            // For example, X-10 is valid if WCS Zero is at X100.
            /*
            if (machineSettings.workArea) {
                if (currentX < 0 || currentX > machineSettings.workArea.x) {
                    errors.push({
                        severity: monaco.MarkerSeverity.Error,
                        message: `X coordinate ${currentX.toFixed(2)} exceeds machine work area (0 to ${machineSettings.workArea.x})`,
                        startLineNumber: lineNumber,
                        startColumn: 1,
                        endLineNumber: lineNumber,
                        endColumn: line.length + 1,
                    });
                }
                if (currentY < 0 || currentY > machineSettings.workArea.y) {
                    errors.push({
                        severity: monaco.MarkerSeverity.Error,
                        message: `Y coordinate ${currentY.toFixed(2)} exceeds machine work area (0 to ${machineSettings.workArea.y})`,
                        startLineNumber: lineNumber,
                        startColumn: 1,
                        endLineNumber: lineNumber,
                        endColumn: line.length + 1,
                    });
                }
                if (currentZ < -machineSettings.workArea.z || currentZ > 0) {
                    errors.push({
                        severity: monaco.MarkerSeverity.Error,
                        message: `Z coordinate ${currentZ.toFixed(2)} exceeds machine work area (${-machineSettings.workArea.z} to 0)`,
                        startLineNumber: lineNumber,
                        startColumn: 1,
                        endLineNumber: lineNumber,
                        endColumn: line.length + 1,
                    });
                }
            }
            */

            // Warn about rapid moves at low Z
            if (command === 'G0' && currentZ < 0) {
                errors.push({
                    severity: monaco.MarkerSeverity.Warning,
                    message: `Rapid move (G0) at Z=${currentZ.toFixed(2)}. Consider using safe Z height for rapid moves.`,
                    startLineNumber: lineNumber,
                    startColumn: 1,
                    endLineNumber: lineNumber,
                    endColumn: line.length + 1,
                });
            }

            // Validate arc commands (G2, G3)
            if (['G2', 'G3'].includes(command)) {
                const hasIJK = parameters.has('I') || parameters.has('J') || parameters.has('K');
                const hasR = parameters.has('R');

                if (!hasIJK && !hasR) {
                    errors.push({
                        severity: monaco.MarkerSeverity.Error,
                        message: `${command} requires either I/J/K (arc center offset) or R (radius)`,
                        startLineNumber: lineNumber,
                        startColumn: 1,
                        endLineNumber: lineNumber,
                        endColumn: line.length + 1,
                    });
                }

                if (hasIJK && hasR) {
                    errors.push({
                        severity: monaco.MarkerSeverity.Warning,
                        message: `${command} has both I/J/K and R specified. R will be ignored.`,
                        startLineNumber: lineNumber,
                        startColumn: 1,
                        endLineNumber: lineNumber,
                        endColumn: line.length + 1,
                    });
                }
            }
        }

        // Validate spindle commands (M3, M4)
        if (['M3', 'M4'].includes(command)) {
            if (currentSpindleSpeed === null) {
                errors.push({
                    severity: monaco.MarkerSeverity.Warning,
                    message: `${command} without spindle speed (S). Spindle speed should be set.`,
                    startLineNumber: lineNumber,
                    startColumn: 1,
                    endLineNumber: lineNumber,
                    endColumn: line.length + 1,
                });
            } else {
                // Validate spindle speed range
                if (currentSpindleSpeed < machineSettings.spindle.min || currentSpindleSpeed > machineSettings.spindle.max) {
                    errors.push({
                        severity: monaco.MarkerSeverity.Warning,
                        message: `Spindle speed ${currentSpindleSpeed} is outside machine range (${machineSettings.spindle.min}-${machineSettings.spindle.max} RPM)`,
                        startLineNumber: lineNumber,
                        startColumn: 1,
                        endLineNumber: lineNumber,
                        endColumn: line.length + 1,
                    });
                }
            }
        }
    });

    return errors;
}

/**
 * Set validation markers in Monaco Editor
 */
export function setValidationMarkers(
    model: monaco.editor.ITextModel,
    errors: ValidationError[]
) {
    const markers: monaco.editor.IMarkerData[] = errors.map(error => ({
        severity: error.severity,
        message: error.message,
        startLineNumber: error.startLineNumber,
        startColumn: error.startColumn,
        endLineNumber: error.endLineNumber,
        endColumn: error.endColumn,
    }));

    monaco.editor.setModelMarkers(model, 'gcode-validator', markers);
}

/**
 * Clear validation markers
 */
export function clearValidationMarkers(model: monaco.editor.ITextModel) {
    monaco.editor.setModelMarkers(model, 'gcode-validator', []);
}
