import React, { useState, useEffect } from 'react';
import { Save, Trash2, X } from './Icons';
import { Macro } from '../types';

interface MacroEditorModalProps {
    isOpen: boolean;
    onCancel: () => void;
    onSave: (macro: Macro, index: number | null) => void;
    onDelete: (index: number) => void;
    macro: Macro | null;
    index: number | null;
}

const MacroEditorModal: React.FC<MacroEditorModalProps> = ({ isOpen, onCancel, onSave, onDelete, macro, index }) => {
    const isEditing = macro != null && index != null;
    const [name, setName] = useState('');
    const [commands, setCommands] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(isEditing ? macro.name : '');
            setCommands(isEditing ? macro.commands.join('\n') : '');
        }
    }, [isOpen, macro, isEditing]);

    if (!isOpen) {
        return null;
    }
    
    const handleSave = () => {
        if (name.trim() === '') {
            return; // Basic validation
        }
        const newMacro = {
            name: name.trim(),
            commands: commands.split('\n').map(cmd => cmd.trim()).filter(cmd => cmd)
        };
        onSave(newMacro, index);
        onCancel(); // Close modal on save
    };

    const handleDelete = (): void => {
        if (window.confirm(`Are you sure you want to delete the macro "${macro.name}"?`)) {
            onDelete(index);
            onCancel(); // Close modal on delete
        }
    };

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center"
            onClick={onCancel}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-surface rounded-lg shadow-2xl w-full max-w-lg border border-secondary transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-secondary flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary">{isEditing ? 'Edit Macro' : 'Add New Macro'}</h2>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="macro-name" className="block text-sm font-medium text-text-secondary mb-1">Macro Name</label>
                        <input
                            id="macro-name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g., Probe Z-Axis"
                            className="w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="macro-commands" className="block text-sm font-medium text-text-secondary mb-1">G-Code Commands</label>
                        <textarea
                            id="macro-commands"
                            value={commands}
                            onChange={e => setCommands(e.target.value)}
                            rows={8}
                            placeholder={'G21\nG90\nG0 Z10\n...'}
                            className="w-full bg-background border border-secondary rounded-md py-2 px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            spellCheck="false"
                        />
                        <p className="text-xs text-text-secondary mt-1">Enter one G-code command per line.</p>
                    </div>
                </div>
                <div className="bg-background px-6 py-4 flex justify-between items-center rounded-b-lg">
                    {isEditing ? (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete
                        </button>
                    ) : <div />}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={name.trim() === ''}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-secondary disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MacroEditorModal;
