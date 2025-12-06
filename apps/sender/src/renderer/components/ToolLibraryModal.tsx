import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X, Plus, Trash2, Pencil } from "@mycnc/shared";
import { Tool, ToolType, CutDirection } from '@/types';
import TextInput from './ui/TextInput';
import NumberInput from './ui/NumberInput';

interface ToolLibraryModalProps {
    isOpen: boolean;
    onCancel: () => void;
    onSave: (library: Tool[]) => void;
    library: Tool[];
}

const newToolInitialState: Omit<Tool, 'id'> & { id: number | null, diameter: number | '', flutes: number | '' } = {
    id: null,
    name: '',
    diameter: '',
    type: 'endmill',
    flutes: 2,
    cutDirection: 'up'
};

const ToolLibraryModal: React.FC<ToolLibraryModalProps> = ({ isOpen, onCancel, onSave, library }) => {
    const { t } = useTranslation();
    const [localLibrary, setLocalLibrary] = useState<Tool[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTool, setCurrentTool] = useState<Omit<Tool, 'id' | 'diameter'> & { id: number | null, diameter: number | string, flutes: number | string }>(newToolInitialState);

    useEffect(() => {
        if (isOpen) {
            // Ensure every tool has a unique ID, even if not saved before.
            setLocalLibrary(library.map((tool, index) => ({
                ...tool,
                id: tool.id ?? Date.now() + index,
                // Backwards compatibility for existing tools
                type: tool.type || 'endmill',
                flutes: tool.flutes || 2,
                cutDirection: tool.cutDirection || 'up'
            })));
        }
    }, [isOpen, library]);

    if (!isOpen) return null;

    const handleEdit = (tool: Tool) => {
        setCurrentTool(tool);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setCurrentTool(newToolInitialState);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentTool(newToolInitialState);
    };

    const handleSaveTool = () => {
        if (currentTool.name.trim() === '' || currentTool.diameter === '' || isNaN(Number(currentTool.diameter))) return;

        const toolToSave = {
            ...currentTool,
            diameter: Number(currentTool.diameter),
            flutes: Number(currentTool.flutes) || 2
        } as Tool;

        if (currentTool.id) { // Editing existing
            setLocalLibrary(lib => lib.map(t => t.id === toolToSave.id ? toolToSave : t));
        } else { // Adding new
            setLocalLibrary(lib => [...lib, { ...toolToSave, id: Date.now() }]);
        }
        handleCancelEdit();
    };

    const handleDelete = (toolId: number) => {
        if (window.confirm(t('toolLibrary.deleteConfirm'))) {
            setLocalLibrary(lib => lib.filter(t => t.id !== toolId));
        }
    };

    const handleSaveAndClose = () => {
        onSave(localLibrary);
        onCancel();
    };

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center"
            aria-modal="true" role="dialog"
        >
            <div
                className="bg-surface backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-md border border-white/10 transform transition-all max-h-[90vh] flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-text-primary">{t('toolLibrary.title')}</h2>
                    <button
                        onClick={onCancel}
                        disabled={isEditing}
                        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    {!isEditing ? (
                        <button
                            onClick={handleAddNew}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary/80 text-text-primary font-semibold rounded-lg hover:bg-secondary border border-white/10 transition-all shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <Plus className="w-5 h-5" />{t('toolLibrary.addNew')}
                        </button>
                    ) : (
                        <div className="bg-background/80 p-4 rounded-xl border border-white/20 shadow-lg">
                            <h3 className="font-bold mb-3 text-text-primary">{currentTool.id ? t('toolLibrary.edit') : t('toolLibrary.add')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('toolLibrary.name')}</label>
                                    <TextInput
                                        value={currentTool.name}
                                        onValueChange={val => setCurrentTool(prev => ({ ...prev, name: val }))}
                                        placeholder='e.g., 1/4" 2-Flute Endmill'
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('toolLibrary.type')}</label>
                                    <select
                                        value={currentTool.type}
                                        onChange={e => setCurrentTool(prev => ({ ...prev, type: e.target.value as ToolType }))}
                                        className="w-full bg-background border border-secondary rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                    >
                                        <option value="endmill">{t('toolLibrary.types.endmill')}</option>
                                        <option value="ballmill">{t('toolLibrary.types.ballmill')}</option>
                                        <option value="bullhead">{t('toolLibrary.types.bullhead')}</option>
                                        <option value="vbit30">{t('toolLibrary.types.vbit30')}</option>
                                        <option value="vbit60">{t('toolLibrary.types.vbit60')}</option>
                                        <option value="vbit90">{t('toolLibrary.types.vbit90')}</option>
                                        <option value="surfacing">{t('toolLibrary.types.surfacing')}</option>
                                        <option value="cornmill">{t('toolLibrary.types.cornmill')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('toolLibrary.diameter')}</label>
                                    <NumberInput
                                        value={currentTool.diameter}
                                        onChange={val => setCurrentTool(prev => ({ ...prev, diameter: val }))}
                                        placeholder="e.g., 6.35"
                                        unit="mm"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('toolLibrary.flutes')}</label>
                                    <NumberInput
                                        value={currentTool.flutes}
                                        onChange={val => setCurrentTool(prev => ({ ...prev, flutes: val }))}
                                        placeholder="e.g., 2"
                                        className="w-full"
                                        step={1}
                                        min={1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">{t('toolLibrary.cutDirection')}</label>
                                    <select
                                        value={currentTool.cutDirection}
                                        onChange={e => setCurrentTool(prev => ({ ...prev, cutDirection: e.target.value as CutDirection }))}
                                        className="w-full bg-background border border-secondary rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                    >
                                        <option value="up">{t('toolLibrary.directions.up')}</option>
                                        <option value="down">{t('toolLibrary.directions.down')}</option>
                                        <option value="compression">{t('toolLibrary.directions.compression')}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4 justify-end">
                                <button onClick={handleCancelEdit} className="px-3 py-1.5 bg-secondary/80 text-text-primary rounded-lg hover:bg-secondary border border-white/10 transition-all active:scale-95 shadow-sm">{t('toolLibrary.cancel')}</button>
                                <button onClick={handleSaveTool} className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-focus shadow-lg shadow-primary/20 transition-all active:scale-95 border border-primary/50">{t('toolLibrary.save')}</button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        {localLibrary.length > 0 ? (
                            localLibrary.map(tool => (
                                <div key={tool.id} className="flex items-center justify-between bg-background/60 p-3 rounded-xl border border-white/10 hover:bg-background/80 transition-colors shadow-sm hover:shadow-md">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-text-primary">{tool.name}</span>
                                        <span className="text-xs text-text-secondary">
                                            {`Ø ${tool.diameter} mm • ${t(`toolLibrary.types.${tool.type}`)} • ${tool.flutes}F`}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(tool)} className="p-2 text-text-secondary hover:text-primary hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/5"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(tool.id)} className="p-2 text-text-secondary hover:text-accent-red hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/5"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-text-secondary py-4">{t('toolLibrary.empty')}</p>
                        )}
                    </div>
                </div>
                <div className="bg-background/30 px-6 py-4 flex justify-end items-center rounded-b-xl flex-shrink-0 border-t border-white/10">
                    <button
                        onClick={handleSaveAndClose}
                        disabled={isEditing}
                        className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus flex items-center gap-2 disabled:bg-secondary disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <Save className="w-5 h-5" />{t('toolLibrary.saveClose')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToolLibraryModal;
