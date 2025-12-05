export interface GrblSettingDefinition {
    id: number;
    name: string;
    description: string;
    section: string;
    unit?: string;
    type: 'integer' | 'float' | 'boolean' | 'bitmask';
    range?: { min: number; max?: number };
    options?: { value: number; label: string }[];
}

export const GRBL_SETTINGS: GrblSettingDefinition[] = [
    {
        id: 0,
        name: 'Step pulse, time',
        description: 'Sets time length per step. Minimum 3usec.',
        section: 'Step & Pulse',
        unit: 'microseconds',
        type: 'integer',
        range: { min: 3 }
    },
    {
        id: 1,
        name: 'Step idle delay',
        description: 'Sets a short hold delay when stopping to let dynamics settle before disabling steppers. Value 255 keeps motors enabled with no delay.',
        section: 'Step & Pulse',
        unit: 'milliseconds',
        type: 'integer',
        range: { min: 0, max: 255 }
    },
    {
        id: 2,
        name: 'Step port invert',
        description: 'Inverts the step signal. Set axis bit to invert (00000ZYX).',
        section: 'Step & Pulse',
        type: 'bitmask',
        options: [
            { value: 1, label: 'Invert X' },
            { value: 2, label: 'Invert Y' },
            { value: 4, label: 'Invert Z' }
        ]
    },
    {
        id: 3,
        name: 'Direction port invert',
        description: 'Inverts the direction signal. Set axis bit to invert (00000ZYX).',
        section: 'Step & Pulse',
        type: 'bitmask',
        options: [
            { value: 1, label: 'Invert X' },
            { value: 2, label: 'Invert Y' },
            { value: 4, label: 'Invert Z' }
        ]
    },
    {
        id: 4,
        name: 'Step enable invert',
        description: 'Inverts the stepper driver enable pin signal.',
        section: 'Step & Pulse',
        type: 'boolean',
        options: [
            { value: 0, label: 'Disable' },
            { value: 1, label: 'Enable' }
        ]
    },
    {
        id: 5,
        name: 'Limit pins invert',
        description: 'Inverts the all of the limit input pins.',
        section: 'Step & Pulse',
        type: 'boolean',
        options: [
            { value: 0, label: 'Disable' },
            { value: 1, label: 'Enable' }
        ]
    },
    {
        id: 6,
        name: 'Probe pin invert',
        description: 'Inverts the probe input pin signal.',
        section: 'Step & Pulse',
        type: 'boolean',
        options: [
            { value: 0, label: 'Disable' },
            { value: 1, label: 'Enable' }
        ]
    },
    {
        id: 10,
        name: 'Status report',
        description: 'Alters data included in status reports.',
        section: 'Step & Pulse',
        type: 'bitmask',
        options: [
            { value: 1, label: 'Machine Position' },
            { value: 2, label: 'Work Position' }
        ]
    },
    {
        id: 11,
        name: 'Junction deviation',
        description: 'Sets how fast Grbl travels through consecutive motions. Lower values are slower.',
        section: 'Step & Pulse',
        unit: 'mm',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 12,
        name: 'Arc tolerance',
        description: 'Sets the G2 and G3 arc tracing accuracy based on radial error. Beware: A very small value may effect performance.',
        section: 'Step & Pulse',
        unit: 'mm',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 13,
        name: 'Report inches',
        description: 'Enables inch units when returning any position and rate value that is not a settings value.',
        section: 'Step & Pulse',
        type: 'boolean',
        options: [
            { value: 0, label: 'Disable' },
            { value: 1, label: 'Enable' }
        ]
    },
    {
        id: 20,
        name: 'Soft limits',
        description: 'Enables soft limits checks within machine travel and sets alarm when exceeded. Requires homing.',
        section: 'Homing & Limits',
        type: 'boolean',
        options: [
            { value: 0, label: 'Disable' },
            { value: 1, label: 'Enable' }
        ]
    },
    {
        id: 21,
        name: 'Hard limits',
        description: 'Enables hard limits. Immediately halts motion and throws an alarm when switch is triggered.',
        section: 'Homing & Limits',
        type: 'boolean',
        options: [
            { value: 0, label: 'Disable' },
            { value: 1, label: 'Enable' }
        ]
    },
    {
        id: 22,
        name: 'Homing cycle',
        description: 'Enables homing cycle. Requires limit switches on all axes.',
        section: 'Homing & Limits',
        type: 'boolean',
        options: [
            { value: 0, label: 'Disable' },
            { value: 1, label: 'Enable' }
        ]
    },
    {
        id: 23,
        name: 'Homing dir invert',
        description: 'Homing searches for a switch in the positive direction. Set axis bit (00000ZYX) to search in negative direction.',
        section: 'Homing & Limits',
        type: 'bitmask',
        options: [
            { value: 1, label: 'Invert X' },
            { value: 2, label: 'Invert Y' },
            { value: 4, label: 'Invert Z' }
        ]
    },
    {
        id: 24,
        name: 'Homing feed',
        description: 'Feed rate to slowly engage limit switch to determine its location.',
        section: 'Homing & Limits',
        unit: 'mm/min',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 25,
        name: 'Homing seek',
        description: 'Seek rate to quickly find the limit switch before the slower locating phase.',
        section: 'Homing & Limits',
        unit: 'mm/min',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 26,
        name: 'Homing debounce',
        description: 'Sets a short delay between phases of homing cycle to let a switch debounce.',
        section: 'Homing & Limits',
        unit: 'milliseconds',
        type: 'integer',
        range: { min: 0 }
    },
    {
        id: 27,
        name: 'Homing pull-off',
        description: 'Retract distance after a switch is hit to disengage it. Help prevents false triggering during hard limit checks.',
        section: 'Homing & Limits',
        unit: 'mm',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 30,
        name: 'Max spindle speed',
        description: 'Maximum spindle speed. Sets PWM to 100% duty cycle.',
        section: 'Spindle & Laser',
        unit: 'RPM',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 31,
        name: 'Min spindle speed',
        description: 'Minimum spindle speed. Sets PWM to 0.4% or lowest duty cycle.',
        section: 'Spindle & Laser',
        unit: 'RPM',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 32,
        name: 'Laser mode',
        description: 'Enables laser mode. Consecutive G1/2/3 commands will not halt when spindle speed is changed.',
        section: 'Spindle & Laser',
        type: 'boolean',
        options: [
            { value: 0, label: 'Disable' },
            { value: 1, label: 'Enable' }
        ]
    },
    {
        id: 100,
        name: 'X steps/mm',
        description: 'X-axis steps per millimeter.',
        section: 'Steps per mm',
        unit: 'steps/mm',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 101,
        name: 'Y steps/mm',
        description: 'Y-axis steps per millimeter.',
        section: 'Steps per mm',
        unit: 'steps/mm',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 102,
        name: 'Z steps/mm',
        description: 'Z-axis steps per millimeter.',
        section: 'Steps per mm',
        unit: 'steps/mm',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 110,
        name: 'X Max rate',
        description: 'X-axis maximum rate. Used as G0 rapid rate.',
        section: 'Max Rate',
        unit: 'mm/min',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 111,
        name: 'Y Max rate',
        description: 'Y-axis maximum rate. Used as G0 rapid rate.',
        section: 'Max Rate',
        unit: 'mm/min',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 112,
        name: 'Z Max rate',
        description: 'Z-axis maximum rate. Used as G0 rapid rate.',
        section: 'Max Rate',
        unit: 'mm/min',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 120,
        name: 'X Acceleration',
        description: 'X-axis acceleration. Used for motion planning.',
        section: 'Acceleration',
        unit: 'mm/sec^2',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 121,
        name: 'Y Acceleration',
        description: 'Y-axis acceleration. Used for motion planning.',
        section: 'Acceleration',
        unit: 'mm/sec^2',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 122,
        name: 'Z Acceleration',
        description: 'Z-axis acceleration. Used for motion planning.',
        section: 'Acceleration',
        unit: 'mm/sec^2',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 130,
        name: 'X Max travel',
        description: 'Maximum X-axis travel distance from homing switch. Used for soft limits.',
        section: 'Max Travel',
        unit: 'mm',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 131,
        name: 'Y Max travel',
        description: 'Maximum Y-axis travel distance from homing switch. Used for soft limits.',
        section: 'Max Travel',
        unit: 'mm',
        type: 'float',
        range: { min: 0 }
    },
    {
        id: 132,
        name: 'Z Max travel',
        description: 'Maximum Z-axis travel distance from homing switch. Used for soft limits.',
        section: 'Max Travel',
        unit: 'mm',
        type: 'float',
        range: { min: 0 }
    }
];
