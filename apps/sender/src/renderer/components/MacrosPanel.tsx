import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Pencil, CheckCircle, PlusCircle, ChevronDown, ChevronUp, PlayCircle, Download, Upload } from "@mycnc/shared";

interface Macro {
    name: string;
    description?: string;
    commands: string[];
}

interface MacrosPanelProps {
    macros: Macro[];
    onRunMacro: (commands: string[]) => void;
    onOpenEditor: (index: number | null) => void;
    onImportMacros: (macros: Macro[]) => void;
    isEditMode: boolean;
    onToggleEditMode: () => void;
    disabled: boolean;
}

const MacrosPanel: React.FC<MacrosPanelProps> = ({ macros, onRunMacro, onOpenEditor, onImportMacros, isEditMode, onToggleEditMode, disabled }) => {
    const { t } = useTranslation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const importFileRef = React.useRef<HTMLInputElement>(null);

    const handleExport = (e: React.MouseEvent) => {
        e.stopPropagation();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(macros, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "macros.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedMacros = JSON.parse(e.target?.result as string);
                if (Array.isArray(importedMacros)) {
                    onImportMacros(importedMacros);
                } else {
                    alert(t('macros.importError'));
                }
            } catch (error) {
                console.error("Failed to import macros:", error);
                alert(t('macros.importError'));
            }
        };
        reader.readAsText(file);
        event.target.value = ""; // Reset
    };

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
        // Prevent event bubbling up to the main button when clicking the small edit icon
        e.stopPropagation();
        if (isEditMode) {
            onOpenEditor(index);
        } else {
            onRunMacro(macros[index].commands);
        }
    };

    return (
        <div className="bg-surface rounded-lg shadow-lg p-2">
            <div
                onClick={() => setIsCollapsed(p => !p)}
                className="flex items-center justify-between cursor-pointer"
                role="button"
                tabIndex={0}
                aria-expanded={!isCollapsed}
                aria-controls="macros-panel-content"
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') setIsCollapsed(p => !p); }}
            >
                <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
                    <PlayCircle className="w-4 h-4 text-primary" />
                    {t('macros.title')}
                </div>
                <div className="flex items-center gap-4">
                    {isEditMode && (
                        <div className="flex items-center gap-2">
                            <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={handleImport} />
                            <button
                                onClick={(e) => { e.stopPropagation(); importFileRef.current?.click(); }}
                                className="p-1 rounded hover:bg-secondary-focus text-text-secondary"
                                title={t('macros.import')}
                            >
                                <Upload className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleExport}
                                className="p-1 rounded hover:bg-secondary-focus text-text-secondary"
                                title={t('macros.export')}
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            onToggleEditMode();
                            if (!isEditMode) {
                                setIsCollapsed(false);
                            }
                        }}
                        disabled={disabled && !isEditMode} // Can always exit edit mode
                        className="p-1 rounded hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary transition-colors disabled:opacity-50"
                        title={isEditMode ? t('common.done') : t('common.edit')}
                    >
                        {isEditMode ? (
                            <CheckCircle className="w-5 h-5 text-accent-green" />
                        ) : (
                            <Pencil className="w-5 h-5 text-text-secondary" />
                        )}
                    </button>
                    {isCollapsed ? <ChevronDown className="w-5 h-5 text-text-secondary" /> : <ChevronUp className="w-5 h-5 text-text-secondary" />}
                </div>
            </div>

            {!isCollapsed && (
                <div id="macros-panel-content" className="mt-2 pt-2 border-t border-secondary">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {macros.map((macro, index) => (
                            <button
                                key={index}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonClick(e, index)}
                                disabled={disabled && !isEditMode}
                                className="relative p-3 bg-secondary rounded-md text-sm font-semibold hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed text-left group"
                                title={isEditMode ? t('macros.editTooltip', { name: macro.name }) : (macro.description || macro.commands.join('; '))}
                            >
                                <div className="flex flex-col">
                                    <span>{macro.name}</span>
                                    {macro.description && (
                                        <span className="text-xs text-text-secondary font-normal truncate">{macro.description}</span>
                                    )}
                                </div>
                                {isEditMode && (
                                    <div className="absolute top-1 right-1 p-1 rounded-full bg-primary/50 hover:bg-primary">
                                        <Pencil className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                        {isEditMode && (
                            <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onOpenEditor(null); }} // Stop propagation on Add
                                className="p-3 border-2 border-dashed border-secondary rounded-md hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface flex items-center justify-center"
                                title={t('macros.add')}
                            >
                                <PlusCircle className="w-6 h-6 text-text-secondary hover:text-primary" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MacrosPanel;