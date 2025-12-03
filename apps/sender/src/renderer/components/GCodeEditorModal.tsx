import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { MachineSettings } from '@mycnc/shared';
import { registerGCodeLanguage, GCODE_LANGUAGE_ID } from '@/services/gcodeLanguage';
import { registerGCodeIntelliSense } from '@/services/gcodeIntelliSense';
import { validateGCode, setValidationMarkers, clearValidationMarkers } from '@/services/gcodeValidator';
import { X, Save, Download, Undo, Redo, Search, Code2 } from '@mycnc/shared';

interface GCodeEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialContent: string;
    fileName: string;
    onSaveToApp: (content: string) => void;
    onSaveToDisk: (content: string, filename: string) => void;
    machineSettings: MachineSettings;
    unit: 'mm' | 'in';
    isLightMode: boolean;
}

const GCodeEditorModal: React.FC<GCodeEditorModalProps> = ({
    isOpen,
    onClose,
    initialContent,
    fileName,
    onSaveToApp,
    onSaveToDisk,
    machineSettings,
    unit,
    isLightMode,
}) => {
    const { t } = useTranslation();
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [content, setContent] = useState(initialContent);
    const [errorCount, setErrorCount] = useState(0);
    const [warningCount, setWarningCount] = useState(0);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Handle mount - register language
    useEffect(() => {
        // Register G-code language if not already registered
        // We can safely access the global monaco instance now
        if (!monaco.languages.getLanguages().some(lang => lang.id === GCODE_LANGUAGE_ID)) {
            registerGCodeLanguage();
            registerGCodeIntelliSense();
        }
    }, [isOpen]);

    // Update content when initialContent changes
    useEffect(() => {
        setContent(initialContent);
        setHasUnsavedChanges(false);
    }, [initialContent]);

    // Validate G-code when content changes
    useEffect(() => {
        if (editorRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                const errors = validateGCode(content, machineSettings);
                setValidationMarkers(model, errors);

                // Count errors and warnings
                const errCount = errors.filter(e => e.severity === monaco.MarkerSeverity.Error).length;
                const warnCount = errors.filter(e => e.severity === monaco.MarkerSeverity.Warning).length;
                setErrorCount(errCount);
                setWarningCount(warnCount);
            }
        }
    }, [content, machineSettings]);

    // Update theme when isLightMode changes
    useEffect(() => {
        monaco.editor.setTheme(isLightMode ? 'gcode-light' : 'gcode-dark');
    }, [isLightMode]);

    // Handle editor mount
    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;

        // Add keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            handleSaveToApp();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS, () => {
            handleSaveToDisk();
        });

        editor.addCommand(monaco.KeyCode.Escape, () => {
            if (!hasUnsavedChanges || confirm('You have unsaved changes. Are you sure you want to close?')) {
                onClose();
            }
        });

        // Focus editor
        editor.focus();
    };

    // Handle content change
    const handleContentChange = (value: string | undefined) => {
        if (value !== undefined) {
            setContent(value);
            setHasUnsavedChanges(value !== initialContent);
        }
    };

    // Save to app
    const handleSaveToApp = () => {
        onSaveToApp(content);
        setHasUnsavedChanges(false);
    };

    // Save to disk
    const handleSaveToDisk = () => {
        onSaveToDisk(content, fileName);
    };

    // Handle close
    const handleClose = () => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to close?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    // Undo
    const handleUndo = () => {
        editorRef.current?.trigger('keyboard', 'undo', null);
    };

    // Redo
    const handleRedo = () => {
        editorRef.current?.trigger('keyboard', 'redo', null);
    };

    // Find
    const handleFind = () => {
        editorRef.current?.trigger('keyboard', 'actions.find', null);
    };

    // Format code
    const handleFormat = () => {
        editorRef.current?.trigger('editor', 'editor.action.formatDocument', null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[90vw] h-[90vh] bg-background rounded-lg shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-secondary">
                    <div className="flex items-center gap-3">
                        <Code2 className="w-6 h-6 text-primary" />
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                {t('gcode.editor.title')}
                            </h2>
                            <p className="text-sm text-muted">
                                {fileName}
                                {hasUnsavedChanges && <span className="text-warning ml-2">• Unsaved changes</span>}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-secondary rounded-md transition-colors"
                        title={t('common.cancel')}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 px-6 py-3 border-b border-secondary bg-background-secondary">
                    <button
                        onClick={handleUndo}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-white rounded-md hover:bg-secondary-focus transition-colors"
                        title={t('gcode.actions.undoTitle')}
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleRedo}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-white rounded-md hover:bg-secondary-focus transition-colors"
                        title={t('gcode.actions.redoTitle')}
                    >
                        <Redo className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-secondary mx-2" />

                    <button
                        onClick={handleFind}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-white rounded-md hover:bg-secondary-focus transition-colors"
                        title="Find (Ctrl+F)"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleFormat}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-white rounded-md hover:bg-secondary-focus transition-colors"
                        title={t('gcode.editor.format')}
                    >
                        <Code2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 relative">
                    <Editor
                        height="100%"
                        language={GCODE_LANGUAGE_ID}
                        value={content}
                        onChange={handleContentChange}
                        onMount={handleEditorDidMount}
                        theme={isLightMode ? 'gcode-light' : 'gcode-dark'}
                        options={{
                            readOnly: false,
                            automaticLayout: true,
                            formatOnPaste: true,
                            formatOnType: false,
                            minimap: { enabled: true },
                            lineNumbers: 'on',
                            rulers: [80],
                            wordWrap: 'off',
                            quickSuggestions: true,
                            suggestOnTriggerCharacters: true,
                            acceptSuggestionOnEnter: 'on',
                            tabCompletion: 'on',
                            scrollBeyondLastLine: false,
                            renderWhitespace: 'selection',
                            fontSize: 14,
                            fontFamily: 'Consolas, "Courier New", monospace',
                            padding: { top: 16, bottom: 16 },
                        }}
                    />
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-secondary bg-background-secondary">
                    <div className="flex items-center gap-4 text-sm">
                        {errorCount > 0 && (
                            <span className="text-error">
                                ❌ {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                            </span>
                        )}
                        {warningCount > 0 && (
                            <span className="text-warning">
                                ⚠️ {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
                            </span>
                        )}
                        {errorCount === 0 && warningCount === 0 && (
                            <span className="text-success">
                                ✅ {t('gcode.editor.noIssues')}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveToApp}
                            className="flex items-center gap-2 px-4 py-2 bg-accent-green text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
                            title={t('gcode.actions.saveLocalTitle')}
                        >
                            <Save className="w-4 h-4" />
                            {t('gcode.editor.saveToApp')}
                        </button>
                        <button
                            onClick={handleSaveToDisk}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus transition-colors"
                            title={t('gcode.actions.saveDisk')}
                        >
                            <Download className="w-4 h-4" />
                            {t('gcode.editor.saveToDisk')}
                        </button>
                        <button
                            onClick={handleClose}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { GCodeEditorModal };
