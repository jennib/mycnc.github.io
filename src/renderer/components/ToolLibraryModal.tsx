import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Trash2, Pencil } from './Icons';
import { Tool } from '@/types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface ToolLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (library: Tool[]) => void;
    library: Tool[];
}

const newToolInitialState: Omit<Tool, 'id'> & { id: number | null, diameter: number | '' } = {
    id: null,
    name: '',
    diameter: '',
};

const ToolLibraryModal: React.FC<ToolLibraryModalProps> = ({ isOpen, onClose, onSave, library }) => {
    const [localLibrary, setLocalLibrary] = useState<Tool[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTool, setCurrentTool] = useState<Omit<Tool, 'id'> & { id: number | null }>(newToolInitialState);
    const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalLibrary(library.map((tool, index) => ({ ...tool, id: tool.id ?? Date.now() + index })));
        }
    }, [isOpen, library]);

    const handleEdit = (tool) => {
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

        const toolToSave = { ...currentTool, diameter: Number(currentTool.diameter) } as Tool;

        if (currentTool.id) { // Editing existing
            setLocalLibrary(lib => lib.map(t => t.id === toolToSave.id ? toolToSave : t));
        } else { // Adding new
            setLocalLibrary(lib => [...lib, { ...toolToSave, id: Date.now() }]);
        }
        handleCancelEdit();
    };

    const handleDelete = (tool: Tool) => {
        setToolToDelete(tool);
    };

    const handleDeleteConfirm = () => {
        if (toolToDelete) {
            setLocalLibrary(lib => lib.filter(t => t.id !== toolToDelete.id));
        }
        setToolToDelete(null);
    };

    const handleSaveAndClose = () => {
        onSave(localLibrary);
        onClose();
    };

    const footer = (
        <button
            onClick={handleSaveAndClose}
            disabled={isEditing}
            className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2 disabled:bg-secondary disabled:cursor-not-allowed"
        >
            <Save className="w-5 h-5" />Save & Close
        </button>
    );

    return (
        <>
            <Modal
                isOpen={isOpen && !toolToDelete}
                onClose={onClose}
                title="Tool Library"
                footer={footer}
                size="md"
            >
                <div className="space-y-4">
                    {!isEditing ? (
                        <button
                            onClick={handleAddNew}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <Plus className="w-5 h-5" />Add New Tool
                        </button>
                    ) : (
                        <div className="bg-background p-4 rounded-md border border-primary">
                            <h3 className="font-bold mb-2">{currentTool.id ? 'Edit Tool' : 'Add Tool'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Tool Name</label>
                                    <input
                                        type="text"
                                        placeholder='e.g., 1/4" 2-Flute Endmill'
                                        value={currentTool.name}
                                        onChange={e => setCurrentTool(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-secondary border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Diameter (mm)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 6.35"
                                        value={currentTool.diameter || ''}
                                        onChange={e => setCurrentTool(prev => ({ ...prev, diameter: e.target.value }))}
                                        className="w-full bg-secondary border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4 justify-end">
                                <button onClick={handleCancelEdit} className="px-3 py-1 bg-secondary text-white rounded-md hover:bg-secondary-focus">Cancel</button>
                                <button onClick={handleSaveTool} className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-focus">Save</button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        {localLibrary.length > 0 ? (
                            localLibrary.map(tool => (
                                <div key={tool.id} className="flex items-center justify-between bg-background p-3 rounded-md">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{tool.name}</span>
                                        <span className="text-xs text-text-secondary">{`Ø ${tool.diameter} mm`}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(tool)} className="p-1 text-text-secondary hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(tool)} className="p-1 text-text-secondary hover:text-accent-red"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-text-secondary py-4">Your tool library is empty.</p>
                        )}
                    </div>
                </div>
            </Modal>
            {toolToDelete && (
                <ConfirmationModal
                    isOpen={!!toolToDelete}
                    onClose={() => setToolToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    title="Confirm Delete"
                    message={`Are you sure you want to delete the tool "${toolToDelete.name}"?`}
                    confirmText="Delete"
                />
            )}
        </>
    );
};

export default ToolLibraryModal;
