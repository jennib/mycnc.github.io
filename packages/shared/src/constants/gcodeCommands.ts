/**
 * Comprehensive G-code command database for IntelliSense and validation
 */

export interface GCodeCommand {
    code: string;
    category: 'motion' | 'spindle' | 'coolant' | 'program' | 'coordinate' | 'canned' | 'other';
    name: string;
    description: string;
    parameters: string[];
    examples: string[];
    grblSupported: boolean;
    notes?: string;
}

export const GCODE_COMMANDS: GCodeCommand[] = [
    // Motion Commands
    {
        code: 'G0',
        category: 'motion',
        name: 'Rapid Positioning',
        description: 'Moves the tool to the specified position at maximum speed (non-cutting move)',
        parameters: ['X', 'Y', 'Z', 'A', 'B', 'C'],
        examples: ['G0 X10 Y20', 'G0 Z5', 'G0 X0 Y0 Z10'],
        grblSupported: true,
        notes: 'Use for non-cutting moves. Tool will move at maximum speed regardless of feed rate.'
    },
    {
        code: 'G1',
        category: 'motion',
        name: 'Linear Interpolation',
        description: 'Moves the tool in a straight line at the specified feed rate',
        parameters: ['X', 'Y', 'Z', 'F'],
        examples: ['G1 X10 Y20 F500', 'G1 Z-2 F100', 'G1 X50 Y50 Z-5 F300'],
        grblSupported: true,
        notes: 'Requires feed rate (F) to be set. Used for cutting moves.'
    },
    {
        code: 'G2',
        category: 'motion',
        name: 'Clockwise Arc',
        description: 'Moves the tool in a clockwise arc at the specified feed rate',
        parameters: ['X', 'Y', 'Z', 'I', 'J', 'K', 'R', 'F'],
        examples: ['G2 X10 Y10 I5 J0 F500', 'G2 X20 Y0 R10 F300'],
        grblSupported: true,
        notes: 'Use I, J, K for arc center offset or R for radius. I=X offset, J=Y offset, K=Z offset.'
    },
    {
        code: 'G3',
        category: 'motion',
        name: 'Counter-Clockwise Arc',
        description: 'Moves the tool in a counter-clockwise arc at the specified feed rate',
        parameters: ['X', 'Y', 'Z', 'I', 'J', 'K', 'R', 'F'],
        examples: ['G3 X10 Y10 I5 J0 F500', 'G3 X20 Y0 R10 F300'],
        grblSupported: true,
        notes: 'Use I, J, K for arc center offset or R for radius. I=X offset, J=Y offset, K=Z offset.'
    },
    {
        code: 'G4',
        category: 'other',
        name: 'Dwell',
        description: 'Pauses program execution for a specified time',
        parameters: ['P'],
        examples: ['G4 P2', 'G4 P0.5'],
        grblSupported: true,
        notes: 'P specifies dwell time in seconds. Useful for spindle warmup or chip clearing.'
    },

    // Coordinate System Commands
    {
        code: 'G17',
        category: 'other',
        name: 'XY Plane Selection',
        description: 'Selects XY plane for arc moves',
        parameters: [],
        examples: ['G17'],
        grblSupported: true,
        notes: 'Default plane. Most common for 2.5D machining.'
    },
    {
        code: 'G18',
        category: 'other',
        name: 'XZ Plane Selection',
        description: 'Selects XZ plane for arc moves',
        parameters: [],
        examples: ['G18'],
        grblSupported: true,
        notes: 'Used for lathe-style operations or vertical arcs.'
    },
    {
        code: 'G19',
        category: 'other',
        name: 'YZ Plane Selection',
        description: 'Selects YZ plane for arc moves',
        parameters: [],
        examples: ['G19'],
        grblSupported: true,
        notes: 'Less commonly used. For vertical arcs in YZ plane.'
    },
    {
        code: 'G20',
        category: 'other',
        name: 'Inch Units',
        description: 'Sets units to inches',
        parameters: [],
        examples: ['G20'],
        grblSupported: true,
        notes: 'All subsequent coordinates will be interpreted as inches.'
    },
    {
        code: 'G21',
        category: 'other',
        name: 'Metric Units',
        description: 'Sets units to millimeters',
        parameters: [],
        examples: ['G21'],
        grblSupported: true,
        notes: 'All subsequent coordinates will be interpreted as millimeters. Recommended default.'
    },
    {
        code: 'G28',
        category: 'motion',
        name: 'Go to Predefined Position',
        description: 'Moves to a predefined position (usually home)',
        parameters: ['X', 'Y', 'Z'],
        examples: ['G28', 'G28 Z0'],
        grblSupported: true,
        notes: 'In GRBL, G28 goes to the predefined G28 position. Use G28.1 to set the position.'
    },
    {
        code: 'G30',
        category: 'motion',
        name: 'Go to Predefined Position 2',
        description: 'Moves to a second predefined position',
        parameters: ['X', 'Y', 'Z'],
        examples: ['G30', 'G30 Z0'],
        grblSupported: true,
        notes: 'Similar to G28 but for a second position. Use G30.1 to set the position.'
    },

    // Work Coordinate Systems
    {
        code: 'G54',
        category: 'coordinate',
        name: 'Work Coordinate System 1',
        description: 'Selects work coordinate system 1',
        parameters: [],
        examples: ['G54'],
        grblSupported: true,
        notes: 'Default work coordinate system. Most commonly used.'
    },
    {
        code: 'G55',
        category: 'coordinate',
        name: 'Work Coordinate System 2',
        description: 'Selects work coordinate system 2',
        parameters: [],
        examples: ['G55'],
        grblSupported: true,
    },
    {
        code: 'G56',
        category: 'coordinate',
        name: 'Work Coordinate System 3',
        description: 'Selects work coordinate system 3',
        parameters: [],
        examples: ['G56'],
        grblSupported: true,
    },
    {
        code: 'G57',
        category: 'coordinate',
        name: 'Work Coordinate System 4',
        description: 'Selects work coordinate system 4',
        parameters: [],
        examples: ['G57'],
        grblSupported: true,
    },
    {
        code: 'G58',
        category: 'coordinate',
        name: 'Work Coordinate System 5',
        description: 'Selects work coordinate system 5',
        parameters: [],
        examples: ['G58'],
        grblSupported: true,
    },
    {
        code: 'G59',
        category: 'coordinate',
        name: 'Work Coordinate System 6',
        description: 'Selects work coordinate system 6',
        parameters: [],
        examples: ['G59'],
        grblSupported: true,
    },

    // Distance Mode
    {
        code: 'G90',
        category: 'coordinate',
        name: 'Absolute Positioning',
        description: 'All coordinates are absolute (relative to work zero)',
        parameters: [],
        examples: ['G90'],
        grblSupported: true,
        notes: 'Recommended mode. Coordinates are measured from work zero.'
    },
    {
        code: 'G91',
        category: 'coordinate',
        name: 'Incremental Positioning',
        description: 'All coordinates are incremental (relative to current position)',
        parameters: [],
        examples: ['G91'],
        grblSupported: true,
        notes: 'Coordinates are relative to current position. Use with caution.'
    },
    {
        code: 'G92',
        category: 'coordinate',
        name: 'Set Position',
        description: 'Sets the current position to the specified coordinates without moving',
        parameters: ['X', 'Y', 'Z'],
        examples: ['G92 X0 Y0 Z0', 'G92 Z0'],
        grblSupported: true,
        notes: 'Use carefully. Prefer G10 L20 for setting work coordinates in GRBL.'
    },
    {
        code: 'G93',
        category: 'other',
        name: 'Inverse Time Feed Mode',
        description: 'Feed rate is specified as inverse time',
        parameters: [],
        examples: ['G93'],
        grblSupported: true,
        notes: 'Rarely used. F value represents 1/time for the move.'
    },
    {
        code: 'G94',
        category: 'other',
        name: 'Units Per Minute Feed Mode',
        description: 'Feed rate is specified in units per minute (default)',
        parameters: [],
        examples: ['G94'],
        grblSupported: true,
        notes: 'Default mode. F value is in mm/min or in/min.'
    },

    // Spindle Commands (M-codes)
    {
        code: 'M0',
        category: 'program',
        name: 'Program Stop',
        description: 'Stops program execution (requires manual restart)',
        parameters: [],
        examples: ['M0'],
        grblSupported: true,
        notes: 'Pauses program. User must manually resume.'
    },
    {
        code: 'M1',
        category: 'program',
        name: 'Optional Stop',
        description: 'Stops program execution if optional stop is enabled',
        parameters: [],
        examples: ['M1'],
        grblSupported: false,
        notes: 'Not supported in GRBL.'
    },
    {
        code: 'M2',
        category: 'program',
        name: 'Program End',
        description: 'Ends program execution',
        parameters: [],
        examples: ['M2'],
        grblSupported: true,
        notes: 'Stops spindle, turns off coolant, ends program.'
    },
    {
        code: 'M3',
        category: 'spindle',
        name: 'Spindle On (Clockwise)',
        description: 'Turns spindle on in clockwise direction',
        parameters: ['S'],
        examples: ['M3 S12000', 'M3 S8000'],
        grblSupported: true,
        notes: 'S specifies spindle speed in RPM. Most common direction for milling.'
    },
    {
        code: 'M4',
        category: 'spindle',
        name: 'Spindle On (Counter-Clockwise)',
        description: 'Turns spindle on in counter-clockwise direction',
        parameters: ['S'],
        examples: ['M4 S12000', 'M4 S8000'],
        grblSupported: true,
        notes: 'S specifies spindle speed in RPM. Used for tapping or special operations.'
    },
    {
        code: 'M5',
        category: 'spindle',
        name: 'Spindle Off',
        description: 'Turns spindle off',
        parameters: [],
        examples: ['M5'],
        grblSupported: true,
        notes: 'Always turn off spindle before ending program or changing tools.'
    },
    {
        code: 'M7',
        category: 'coolant',
        name: 'Mist Coolant On',
        description: 'Turns mist coolant on',
        parameters: [],
        examples: ['M7'],
        grblSupported: true,
        notes: 'Mist coolant for light cooling.'
    },
    {
        code: 'M8',
        category: 'coolant',
        name: 'Flood Coolant On',
        description: 'Turns flood coolant on',
        parameters: [],
        examples: ['M8'],
        grblSupported: true,
        notes: 'Flood coolant for heavy cooling and chip removal.'
    },
    {
        code: 'M9',
        category: 'coolant',
        name: 'Coolant Off',
        description: 'Turns all coolant off',
        parameters: [],
        examples: ['M9'],
        grblSupported: true,
        notes: 'Turns off both mist and flood coolant.'
    },
    {
        code: 'M30',
        category: 'program',
        name: 'Program End and Reset',
        description: 'Ends program and resets to beginning',
        parameters: [],
        examples: ['M30'],
        grblSupported: true,
        notes: 'Similar to M2 but also resets program to beginning.'
    },
];

// Helper function to get command by code
export function getCommand(code: string): GCodeCommand | undefined {
    return GCODE_COMMANDS.find(cmd => cmd.code.toUpperCase() === code.toUpperCase());
}

// Helper function to get all commands by category
export function getCommandsByCategory(category: GCodeCommand['category']): GCodeCommand[] {
    return GCODE_COMMANDS.filter(cmd => cmd.category === category);
}

// Helper function to get GRBL-supported commands only
export function getGRBLCommands(): GCodeCommand[] {
    return GCODE_COMMANDS.filter(cmd => cmd.grblSupported);
}

// Common parameters with descriptions
export const GCODE_PARAMETERS = {
    X: 'X-axis coordinate',
    Y: 'Y-axis coordinate',
    Z: 'Z-axis coordinate',
    A: 'A-axis (rotary) coordinate',
    B: 'B-axis (rotary) coordinate',
    C: 'C-axis (rotary) coordinate',
    I: 'X-axis offset for arc center',
    J: 'Y-axis offset for arc center',
    K: 'Z-axis offset for arc center',
    R: 'Arc radius',
    F: 'Feed rate (units per minute)',
    S: 'Spindle speed (RPM)',
    P: 'Dwell time (seconds) or parameter number',
    Q: 'Peck increment for drilling',
    L: 'Loop count or parameter type',
};
