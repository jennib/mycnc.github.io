import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { MachineSettings } from '../types';
import { registerGCodeLanguage, GCODE_LANGUAGE_ID } from '../services/gcodeLanguage';
import { registerGCodeIntelliSense } from '../services/gcodeIntelliSense';
import { validateGCode, setValidationMarkers, clearValidationMarkers } from '../services/gcodeValidator';
import { configureMonaco } from '../services/monacoConfig';
import { X, Save, Download, Undo, Redo, Search, Code2, AlertTriangle } from './Icons';
import { useSettingsStore } from '../stores/settingsStore';

interface GCodeEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialContent: string;
    fileName: string;
    onSaveToApp: (content: string) => void;
    onSaveToDisk: (content: string, filename: string) => void;
    machineSettings: MachineSettings;
    unit: 'mm' | 'in';
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
}) => {
    const { t } = useTranslation();
    const isLightMode = useSettingsStore((state) => state.isLightMode);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [content, setContent] = useState(initialContent);
    const [errorCount, setErrorCount] = useState(0);
    const [warningCount, setWarningCount] = useState(0);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isMonacoConfigured, setIsMonacoConfigured] = useState(false);

    // Handle mount - configure Monaco and register language
    useEffect(() => {
        let mounted = true;

        const initMonaco = async () => {
            try {
                // Configure Monaco loader to use local instance
                await configureMonaco();

                if (mounted) {
                    // Register G-code language if not already registered
                    // We can safely access the global monaco instance now
                    if (!monaco.languages.getLanguages().some(lang => lang.id === GCODE_LANGUAGE_ID)) {
                        registerGCodeLanguage();
                        registerGCodeIntelliSense();
                    }
                    setIsMonacoConfigured(true);
                }
            } catch (error) {
                console.error('Monaco initialization error:', error);
                // Still set configured to true so we don't get stuck on loading, 
                // though the editor might fail or fallback
                if (mounted) setIsMonacoConfigured(true);
            }
        };

        if (isOpen) {
            initMonaco();
        }

        return () => {
            mounted = false;
        };
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
        if (isMonacoConfigured) {
            monaco.editor.setTheme(isLightMode ? 'gcode-light' : 'gcode-dark');
        }
    }, [isLightMode, isMonacoConfigured]);

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

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
            <div className="w-[98vw] h-[98vh] bg-surface/95 backdrop-blur-xl rounded-xl shadow-2xl flex flex-col border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Code2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">
                                {t('gcode.editor.title')}
                            </h2>
                            <p className="text-sm text-text-secondary">
                                {fileName}
                                {hasUnsavedChanges && <span className="text-accent-yellow ml-2">• Unsaved changes</span>}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
                        title={t('common.cancel')}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 px-6 py-3 border-b border-white/10 bg-background/30">
                    <button
                        onClick={handleUndo}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 text-text-primary rounded-md hover:bg-secondary border border-white/5 transition-all shadow-sm"
                        title={t('gcode.actions.undoTitle')}
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleRedo}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 text-text-primary rounded-md hover:bg-secondary border border-white/5 transition-all shadow-sm"
                        title={t('gcode.actions.redoTitle')}
                    >
                        <Redo className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    <button
                        onClick={handleFind}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 text-text-primary rounded-md hover:bg-secondary border border-white/5 transition-all shadow-sm"
                        title="Find (Ctrl+F)"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleFormat}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 text-text-primary rounded-md hover:bg-secondary border border-white/5 transition-all shadow-sm"
                        title={t('gcode.editor.format')}
                    >
                        <Code2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Editor */}
                <div className="flex-1 relative bg-background/50">
                    {!isMonacoConfigured ? (
                        <div className="absolute inset-0 flex items-center justify-center text-text-primary">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p>Loading Editor...</p>
                            </div>
                        </div>
                    ) : (
                        <Editor
                            height="100%"
                            language={GCODE_LANGUAGE_ID}
                            value={content}
                            onChange={handleContentChange}
                            onMount={handleEditorDidMount}
                            theme={isLightMode ? 'gcode-light' : 'gcode-dark'}
                            options={{
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
                                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                padding: { top: 16, bottom: 16 },
                                smoothScrolling: true,
                                cursorBlinking: "smooth",
                                cursorSmoothCaretAnimation: "on",
                            }}
                        />
                    )}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-background/30">
                    <div className="flex items-center gap-4 text-sm font-medium">
                        {errorCount > 0 && (
                            <span className="text-accent-red flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" /> {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                            </span>
                        )}
                        {warningCount > 0 && (
                            <span className="text-accent-yellow flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" /> {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
                            </span>
                        )}
                        {errorCount === 0 && warningCount === 0 && (
                            <span className="text-accent-green flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-accent-green"></div> {t('gcode.editor.noIssues')}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveToApp}
                            className="flex items-center gap-2 px-4 py-2 bg-accent-green/90 text-white font-semibold rounded-lg hover:bg-accent-green shadow-lg shadow-accent-green/20 transition-all active:scale-95"
                            title={t('gcode.actions.saveLocalTitle')}
                        >
                            <Save className="w-4 h-4" />
                            {t('gcode.editor.saveToApp')}
                        </button>
                        <button
                            onClick={handleSaveToDisk}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/90 text-white font-semibold rounded-lg hover:bg-primary shadow-lg shadow-primary/20 transition-all active:scale-95"
                            title={t('gcode.actions.saveDisk')}
                        >
                            <Download className="w-4 h-4" />
                            {t('gcode.editor.saveToDisk')}
                        </button>
                        <button
                            onClick={handleClose}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary/80 text-text-primary font-semibold rounded-lg hover:bg-secondary border border-white/5 transition-all active:scale-95"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default GCodeEditorModal;
