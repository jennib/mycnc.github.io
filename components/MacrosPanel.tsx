
import React, { useState, Fragment } from 'react';
import { Zap, Pencil, CheckCircle, PlusCircle, ChevronDown, ChevronUp } from './Icons';

interface Macro {
    name: string;
    commands: string[];
}

interface MacrosPanelProps {
    macros: Macro[];
    onRunMacro: (commands: string[]) => void;
    onOpenEditor: (index: number | null) => void;
    isEditMode: boolean;
    onToggleEditMode: () => void;
    disabled: boolean;
}

const MacrosPanel: React.FC<MacrosPanelProps> = ({ macros, onRunMacro, onOpenEditor, isEditMode, onToggleEditMode, disabled }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

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
        <div className="bg-surface rounded-lg shadow-lg p-4">
            <div
                onClick={() => setIsCollapsed(p => !p)}
                className="flex items-center justify-between cursor-pointer"
                role="button"
                tabIndex={0}
                aria-expanded={!isCollapsed}
                aria-controls="macros-panel-content"
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') setIsCollapsed(p => !p); }}
            >
                <div className="flex items-center gap-2 text-lg font-bold">
                    <Zap className="w-5 h-5 text-primary" />
                    Macros
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            onToggleEditMode();
                            if (!isEditMode) {
                                setIsCollapsed(false);
                            }
                        }}
                        disabled={disabled && !isEditMode} // Can always exit edit mode
                        className="flex items-center gap-2 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary transition-colors text-sm disabled:opacity-50"
                    >
                        {isEditMode ? (
                            <Fragment>
                                <CheckCircle className="w-4 h-4 text-accent-green" /> Done
                            </Fragment>
                        ) : (
                            <Fragment>
                                <Pencil className="w-4 h-4" /> Edit
                            </Fragment>
                        )}
                    </button>
                    {isCollapsed ? <ChevronDown className="w-5 h-5 text-text-secondary" /> : <ChevronUp className="w-5 h-5 text-text-secondary" />}
                </div>
            </div>

            {!isCollapsed && (
                <div id="macros-panel-content" className="mt-4 pt-4 border-t border-secondary">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {macros.map((macro, index) => (
                            <button
                                key={index}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleButtonClick(e, index)}
                                disabled={disabled && !isEditMode}
                                className="relative p-3 bg-secondary rounded-md text-sm font-semibold hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                title={isEditMode ? `Edit "${macro.name}"` : macro.commands.join('; ')}
                            >
                                {macro.name}
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
                                className="p-3 border-2 border-dashed border-secondary rounded-md text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface flex flex-col items-center justify-center gap-1"
                            >
                                <PlusCircle className="w-6 h-6" />
                                Add Macro
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MacrosPanel;