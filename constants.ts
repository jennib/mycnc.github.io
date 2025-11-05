import { Macro, MachineSettings, Tool } from './types';

export const GRBL_ALARM_CODES: { [key: number | string]: { name: string; desc: string; resolution: string } } = {
    1: { name: 'Hard limit', desc: 'A limit switch was triggered. Usually due to machine travel limits.', resolution: 'Check for obstructions. The machine may need to be moved off the switch manually. Use the "$X" command to unlock after clearing the issue, then perform a homing cycle ($H).' },
    2: { name: 'G-code motion command error', desc: 'The G-code motion target is invalid or exceeds machine travel limits.', resolution: 'Check your G-code file for errors near the last executed line. Use the "$X" command to unlock.' },
    3: { name: 'Reset while in motion', desc: 'The reset button was pressed while the machine was moving.', resolution: 'This is expected. Use "$X" to unlock the machine and resume work.' },
    4: { name: 'Probe fail', desc: 'The probing cycle failed to make contact or the probe is already triggered.', resolution: 'Check your probe wiring and ensure it is properly positioned. Use the "$X" to unlock.' },
    5: { name: 'Probe fail, travel error', desc: 'The probing cycle failed to clear the probe switch.', resolution: 'Check probe wiring and setup. The machine may require a soft-reset (E-STOP). Use "$X" to unlock.' },
    8: { name: 'Homing fail, pull-off', desc: "The homing cycle failed because the machine couldn't move off the limit switches.", resolution: 'Check for mechanical issues or obstructions. Use "$X" to unlock.' },
    9: { name: 'Homing fail, not found', desc: 'The homing cycle failed because the limit switches were not triggered.', resolution: 'Check limit switch wiring and functionality. Use "$X" to unlock.' },
    'default': { name: 'Unknown Alarm', desc: 'An unspecified alarm has occurred.', resolution: 'Try unlocking with "$X". If that fails, a soft-reset (E-STOP button) may be required.' }
};

export const GRBL_ERROR_CODES: { [key: number]: string } = {
    1: 'G-code words consist of a letter and a value. Letter was not found.',
    2: 'Numeric value format is not valid or missing an expected value.',
    3: "Grbl '$' system command was not recognized or supported.",
    4: 'Negative value received for an expected positive value.',
    5: 'Homing cycle is not enabled via settings.',
    6: 'Minimum step pulse time must be greater than 3usec.',
    7: 'EEPROM read failed. Reset and restore factory settings.',
    8: 'Grbl not in idle state. Commands cannot be executed.',
    9: 'G-code locked out during alarm or jog state.',
    10: 'Soft limits cannot be enabled without homing being enabled.',
    11: 'Max characters per line exceeded. Line was not processed.',
    12: 'Grbl setting value exceeds the maximum step rate.',
    13: 'Safety door was detected as opened and door state initiated.',
    14: 'Build info or startup line exceeded EEPROM line length limit.',
    15: 'Jog target exceeds machine travel. Command ignored.',
    16: "Jog command with no '=' or contains prohibited g-code.",
    17: 'Laser mode requires PWM output.',
    20: 'Unsupported or invalid g-code command found in block.',
    21: 'More than one g-code command from same modal group found in block.',
    22: 'Feed rate has not been set or is undefined.',
    23: 'G-code command in block requires an integer value.',
    24: 'Two g-code commands that both require the use of the XYZ axis words were detected in the block.',
    25: 'A G-code word was repeated in the block.',
    26: 'A G-code command implicitly or explicitly requires XYZ axis words in the block, but none were detected.',
    27: 'N-line number value is not within the valid range of 1 - 9,999,999.',
    28: 'A G-code command was sent, but is missing some required P or L value words in the line.',
    29: 'Grbl supports six work coordinate systems G54-G59. G59.1, G59.2, and G59.3 are not supported.',
    30: 'The G53 G-code command requires either a G0 or G1 motion mode to be active. A different motion was active.',
    31: 'There are unused axis words in the block and G80 motion mode cancel is active.',
    32: 'A G2 or G3 arc was commanded but there is no XYZ axis word in the selected plane to trace the arc.',
    33: 'The motion command has an invalid target. G2, G3, and G38.2 generates this error.',
    34: 'A G2 or G3 arc, traced with the radius definition, had a mathematical error when computing the arc geometry. Try either breaking up the arc into multiple smaller arcs or turning on calculated arcs.',
    35: 'A G2 or G3 arc, traced with the offset definition, is missing the I or J router words in the selected plane to trace the arc.',
    36: 'There are unused axis words in the block and G80 motion mode cancel is active.',
    37: 'The G43.1 dynamic tool length offset command cannot apply an offset to an axis other than its configured axis.',
    38: 'Tool number greater than max supported value.',
};

export const DEFAULT_MACROS: Macro[] = [
    { name: 'Go to WCS Zero', commands: ['G90', 'G0 X0 Y0'] },
    { name: 'Safe Z & WCS Zero', commands: ['G90', 'G0 Z10', 'G0 X0 Y0'] },
    { name: 'Spindle On (1k RPM)', commands: ['M3 S1000'] },
    { name: 'Spindle Off', commands: ['M5'] },
    { name: 'Go to G54 Zero', commands: ['G54 G0 X0 Y0'] },
    { name: 'Reset All Offsets', commands: ['G92.1'] },
];

export const DEFAULT_TOOLS: Tool[] = [
    { id: 1, name: '1/8" Flat Endmill', diameter: 3.175 },
    { id: 2, name: '1/4" Flat Endmill', diameter: 6.35 },
    { id: 3, name: '60 Degree V-Bit', diameter: 12.7 },
    { id: 4, name: '90 Degree V-Bit', diameter: 12.7 },
];

export const DEFAULT_SETTINGS: MachineSettings = {
    workArea: { x: 300, y: 300, z: 80 },
    spindle: { min: 0, max: 12000 },
    probe: { xOffset: 3.0, yOffset: 3.0, zOffset: 15.0, feedRate: 25 },
    scripts: {
        startup: ['G21', 'G90'].join('\n'), // Set units to mm, absolute positioning
        toolChange: ['M5', 'G0 Z10'].join('\n'), // Stop spindle, raise Z
        shutdown: ['M5', 'G0 X0 Y0'].join('\n') // Stop spindle, go to WCS zero
    }
};