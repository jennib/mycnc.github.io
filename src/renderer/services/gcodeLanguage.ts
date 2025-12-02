/**
 * Monaco Editor language definition for G-code
 * Provides syntax highlighting and language configuration
 */

import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const GCODE_LANGUAGE_ID = 'gcode';

// Language configuration (brackets, comments, etc.)
export const gcodeLanguageConfig: monaco.languages.LanguageConfiguration = {
    comments: {
        lineComment: ';',
        blockComment: ['(', ')'],
    },
    brackets: [
        ['(', ')'],
        ['[', ']'],
    ],
    autoClosingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' },
    ],
    surroundingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' },
    ],
};

// Monarch tokenizer for syntax highlighting
export const gcodeMonarchLanguage: monaco.languages.IMonarchLanguage = {
    defaultToken: '',
    tokenPostfix: '.gcode',

    // Keywords and commands
    keywords: [
        // G-codes (motion and other)
        'G0', 'G1', 'G2', 'G3', 'G4',
        'G17', 'G18', 'G19',
        'G20', 'G21',
        'G28', 'G30',
        'G38.2', 'G38.3', 'G38.4', 'G38.5',
        'G40', 'G41', 'G42', 'G43', 'G49',
        'G53', 'G54', 'G55', 'G56', 'G57', 'G58', 'G59',
        'G80', 'G81', 'G82', 'G83', 'G84', 'G85', 'G86', 'G87', 'G88', 'G89',
        'G90', 'G91', 'G92', 'G93', 'G94',
        'G98', 'G99',

        // M-codes (spindle, coolant, program)
        'M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9',
        'M30', 'M48', 'M49',
    ],

    // Parameters
    parameters: ['X', 'Y', 'Z', 'A', 'B', 'C', 'I', 'J', 'K', 'R', 'F', 'S', 'P', 'Q', 'L', 'D', 'H', 'T'],

    // Special characters
    operators: ['%', '#', '=', '+', '-', '*', '/', '[', ']'],

    // The main tokenizer
    tokenizer: {
        root: [
            // Program delimiters
            [/%/, 'delimiter.program'],

            // Line numbers
            [/^[Nn]\d+/, 'line-number'],

            // G-codes
            [/[Gg]\d+(\.\d+)?/, {
                cases: {
                    '@keywords': 'keyword.gcode',
                    '@default': 'keyword.gcode'
                }
            }],

            // M-codes
            [/[Mm]\d+/, {
                cases: {
                    '@keywords': 'keyword.mcode',
                    '@default': 'keyword.mcode'
                }
            }],

            // Parameters (X, Y, Z, etc.) followed by numbers
            [/[XYZABCIJKRFSPQLDHT]/, {
                cases: {
                    '@parameters': 'parameter',
                    '@default': 'identifier'
                }
            }],

            // Numbers (including decimals and negative)
            [/-?\d+(\.\d+)?/, 'number'],

            // Comments (parentheses)
            [/\(/, 'comment', '@comment_paren'],

            // Comments (semicolon)
            [/;.*$/, 'comment'],

            // Tool numbers
            [/[Tt]\d+/, 'tool-number'],

            // O-codes (subroutines)
            [/[Oo]\d+/, 'subroutine'],

            // Whitespace
            [/[ \t\r\n]+/, ''],
        ],

        comment_paren: [
            [/[^)]+/, 'comment'],
            [/\)/, 'comment', '@pop'],
        ],
    },
};

// Theme definition for G-code
export const gcodeTheme: monaco.editor.IStandaloneThemeData = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        { token: 'keyword.gcode', foreground: '569CD6', fontStyle: 'bold' },      // Blue for G-codes
        { token: 'keyword.mcode', foreground: 'C586C0', fontStyle: 'bold' },      // Purple for M-codes
        { token: 'parameter', foreground: '4EC9B0' },                              // Teal for parameters
        { token: 'number', foreground: 'B5CEA8' },                                 // Light green for numbers
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },          // Green for comments
        { token: 'line-number', foreground: '858585' },                            // Gray for line numbers
        { token: 'tool-number', foreground: 'DCDCAA' },                            // Yellow for tool numbers
        { token: 'subroutine', foreground: 'D16969' },                             // Red for O-codes
        { token: 'delimiter.program', foreground: 'D4D4D4', fontStyle: 'bold' },  // White for %
    ],
    colors: {},
};

// Light theme variant
export const gcodeThemeLight: monaco.editor.IStandaloneThemeData = {
    base: 'vs',
    inherit: true,
    rules: [
        { token: 'keyword.gcode', foreground: '0000FF', fontStyle: 'bold' },      // Blue for G-codes
        { token: 'keyword.mcode', foreground: 'AF00DB', fontStyle: 'bold' },      // Purple for M-codes
        { token: 'parameter', foreground: '008080' },                              // Teal for parameters
        { token: 'number', foreground: '098658' },                                 // Green for numbers
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },          // Green for comments
        { token: 'line-number', foreground: '808080' },                            // Gray for line numbers
        { token: 'tool-number', foreground: '795E26' },                            // Brown for tool numbers
        { token: 'subroutine', foreground: 'A31515' },                             // Red for O-codes
        { token: 'delimiter.program', foreground: '000000', fontStyle: 'bold' },  // Black for %
    ],
    colors: {},
};

/**
 * Register G-code language with Monaco Editor
 */
export function registerGCodeLanguage(monaco: typeof import('monaco-editor/esm/vs/editor/editor.api')) {
    // Register the language
    monaco.languages.register({ id: GCODE_LANGUAGE_ID });

    // Set language configuration
    monaco.languages.setLanguageConfiguration(GCODE_LANGUAGE_ID, gcodeLanguageConfig);

    // Set monarch tokenizer
    monaco.languages.setMonarchTokensProvider(GCODE_LANGUAGE_ID, gcodeMonarchLanguage);

    // Define themes
    monaco.editor.defineTheme('gcode-dark', gcodeTheme);
    monaco.editor.defineTheme('gcode-light', gcodeThemeLight);
}
