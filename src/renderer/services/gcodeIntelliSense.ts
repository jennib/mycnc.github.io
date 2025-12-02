/**
 * Monaco Editor IntelliSense provider for G-code
 * Provides code completion and hover tooltips
 */

import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { GCODE_COMMANDS, GCODE_PARAMETERS, getCommand } from '../constants/gcodeCommands';
import { GCODE_LANGUAGE_ID } from './gcodeLanguage';

/**
 * Completion provider for G-code commands
 */
export function registerGCodeCompletionProvider(monaco: typeof import('monaco-editor/esm/vs/editor/editor.api')) {
    monaco.languages.registerCompletionItemProvider(GCODE_LANGUAGE_ID, {
        provideCompletionItems: (model, position) => {
            console.log('[GCodeIntelliSense] Providing completion items...');
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            const suggestions: monaco.languages.CompletionItem[] = [];

            // Add G-code command suggestions
            GCODE_COMMANDS.forEach(cmd => {
                const insertText = cmd.parameters.length > 0
                    ? `${cmd.code} ${cmd.parameters.map((p, i) => `${p}\${${i + 1}:0}`).join(' ')}`
                    : cmd.code;

                suggestions.push({
                    label: `${cmd.code} (${cmd.name})`,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    detail: cmd.description,
                    documentation: {
                        value: [
                            `**${cmd.code}** - ${cmd.name}`,
                            '',
                            cmd.description,
                            '',
                            cmd.parameters.length > 0 ? `**Parameters**: ${cmd.parameters.join(', ')}` : '',
                            '',
                            `**Example**: \`${cmd.examples[0]}\``,
                            '',
                            cmd.notes ? `*${cmd.notes}*` : '',
                            '',
                            cmd.grblSupported ? '✅ GRBL Supported' : '⚠️ Not supported in GRBL',
                        ].filter(Boolean).join('\n'),
                        isTrusted: true,
                    },
                    insertText,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                });
            });

            // Add parameter suggestions
            Object.entries(GCODE_PARAMETERS).forEach(([param, description]) => {
                suggestions.push({
                    label: param,
                    kind: monaco.languages.CompletionItemKind.Variable,
                    detail: description,
                    documentation: description,
                    insertText: `${param}\${1:0}`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                });
            });

            // Add common snippets
            const snippets = [
                {
                    label: 'setup',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: 'Basic G-code setup',
                    insertText: [
                        'G21 G90 ; Metric, Absolute',
                        'M3 S${1:12000} ; Spindle on',
                        'G0 Z${2:5} ; Safe Z',
                        '$0'
                    ].join('\n'),
                    documentation: 'Inserts basic G-code setup (units, spindle, safe Z)',
                },
                {
                    label: 'rapid',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: 'Rapid move (G0)',
                    insertText: 'G0 X${1:0} Y${2:0} Z${3:5}',
                    documentation: 'Rapid positioning move',
                },
                {
                    label: 'linear',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: 'Linear move (G1)',
                    insertText: 'G1 X${1:0} Y${2:0} Z${3:0} F${4:500}',
                    documentation: 'Linear interpolation move',
                },
                {
                    label: 'arc-cw',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: 'Clockwise arc (G2)',
                    insertText: 'G2 X${1:10} Y${2:10} I${3:5} J${4:0} F${5:500}',
                    documentation: 'Clockwise arc move',
                },
                {
                    label: 'arc-ccw',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: 'Counter-clockwise arc (G3)',
                    insertText: 'G3 X${1:10} Y${2:10} I${3:5} J${4:0} F${5:500}',
                    documentation: 'Counter-clockwise arc move',
                },
                {
                    label: 'comment',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    detail: 'Add comment',
                    insertText: '(${1:Comment})',
                    documentation: 'Insert a comment',
                },
            ];

            snippets.forEach(snippet => {
                suggestions.push({
                    ...snippet,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                } as monaco.languages.CompletionItem);
            });

            return { suggestions };
        },
    });
}

/**
 * Hover provider for G-code commands
 */
export function registerGCodeHoverProvider(monaco: typeof import('monaco-editor/esm/vs/editor/editor.api')) {
    monaco.languages.registerHoverProvider(GCODE_LANGUAGE_ID, {
        provideHover: (model, position) => {
            const word = model.getWordAtPosition(position);
            if (!word) return null;

            const wordText = word.word.toUpperCase();

            // Check if it's a G-code or M-code command
            const command = getCommand(wordText);
            if (command) {
                const contents: monaco.IMarkdownString[] = [
                    {
                        value: `**${command.code}** - ${command.name}`,
                        isTrusted: true,
                    },
                    {
                        value: command.description,
                        isTrusted: true,
                    },
                ];

                if (command.parameters.length > 0) {
                    contents.push({
                        value: `**Parameters**: ${command.parameters.join(', ')}`,
                        isTrusted: true,
                    });
                }

                if (command.examples.length > 0) {
                    contents.push({
                        value: `**Examples**:\n\`\`\`gcode\n${command.examples.join('\n')}\n\`\`\``,
                        isTrusted: true,
                    });
                }

                if (command.notes) {
                    contents.push({
                        value: `*${command.notes}*`,
                        isTrusted: true,
                    });
                }

                contents.push({
                    value: command.grblSupported
                        ? '✅ **GRBL Supported**'
                        : '⚠️ **Not supported in GRBL**',
                    isTrusted: true,
                });

                return {
                    range: new monaco.Range(
                        position.lineNumber,
                        word.startColumn,
                        position.lineNumber,
                        word.endColumn
                    ),
                    contents,
                };
            }

            // Check if it's a parameter
            const param = GCODE_PARAMETERS[wordText as keyof typeof GCODE_PARAMETERS];
            if (param) {
                return {
                    range: new monaco.Range(
                        position.lineNumber,
                        word.startColumn,
                        position.lineNumber,
                        word.endColumn
                    ),
                    contents: [
                        {
                            value: `**${wordText}** - ${param}`,
                            isTrusted: true,
                        },
                    ],
                };
            }

            return null;
        },
    });
}

/**
 * Register all IntelliSense providers
 */
export function registerGCodeIntelliSense(monaco: typeof import('monaco-editor/esm/vs/editor/editor.api')) {
    registerGCodeCompletionProvider(monaco);
    registerGCodeHoverProvider(monaco);
}
