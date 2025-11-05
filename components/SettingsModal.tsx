import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Upload, Download } from './Icons';
import { MachineSettings } from '../types';

interface InputGroupProps {
    label: string;
    children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-bold text-text-secondary mb-2">{label}</label>
        <div className="flex items-center gap-2">{children}</div>
    </div>
);

interface NumberInputProps {
    id: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    unit?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ id, value, onChange, unit }) => (
    <div className="relative flex-grow">
        <input
            id={id} type="number" value={value} onChange={onChange}
            className="w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">{unit}</span>}
    </div>
);

interface ScriptInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
}

const ScriptInput: React.FC<ScriptInputProps> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <textarea
            value={value} onChange={onChange} rows={4} placeholder={placeholder}
            className="w-full bg-background border border-secondary rounded-md py-2 px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            spellCheck="false"
        />
    </div>
);

interface SettingsModalProps {
    isOpen: boolean;
    onCancel: () => void;
    onSave: (settings: MachineSettings) => void;
    settings: MachineSettings;
    onResetDialogs: () => void;
    onExport: () => void;
    onImport: (imported: any) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onCancel, onSave, settings, onResetDialogs, onExport, onImport }) => {
    const [localSettings, setLocalSettings] = useState<MachineSettings>(settings);
    const importFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalSettings(JSON.parse(JSON.stringify(settings)));
        }
    }, [isOpen, settings]);

    if (!isOpen) return null;

    const handleNestedNumericChange = (category: keyof MachineSettings, field: string, value: string) => {
        // Keep the value as a string during editing to allow partial input like "1." or "-"
        setLocalSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const handleScriptChange = (scriptName: keyof MachineSettings['scripts'], value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            scripts: {
                ...prev.scripts,
                [scriptName]: value
            }
        }));
    };
    
    const handleSave = () => {
        // Deep clone to avoid mutating state directly
        const settingsToSave = JSON.parse(JSON.stringify(localSettings));
        
        // Define which fields need to be parsed to numbers
        const numericFields = {
            workArea: ['x', 'y', 'z'],
            spindle: ['min', 'max'],
            probe: ['xOffset', 'yOffset', 'zOffset', 'feedRate']
        };

        // Iterate and parse string inputs back to numbers
        for (const category in numericFields) {
            if (settingsToSave[category]) {
                for (const field of numericFields[category]) {
                    const value = settingsToSave[category][field];
                    // Coerce to number, default to 0 if invalid
                    settingsToSave[category][field] = parseFloat(value) || 0;
                }
            }
        }

        onSave(settingsToSave);
        onCancel();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const importedData = JSON.parse(e.target.result);
                onImport(importedData);
                onCancel(); // Close modal on successful import
            } catch (error) {
                console.error("Failed to parse settings file:", error);
                alert("Error: Could not read or parse the settings file. Please ensure it's a valid JSON file.");
            }
        };
        reader.readAsText(file);
        event.target.value = null; // Reset file input
    };

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center"
            onClick={onCancel} aria-modal="true" role="dialog"
        >
            <div
                className="bg-surface rounded-lg shadow-2xl w-full max-w-2xl border border-secondary transform transition-all max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-secondary flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-text-primary">Machine Settings</h2>
                    <button onClick={onCancel} className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 bg-background p-4 rounded-md">
                            <InputGroup label="Work Area Dimensions (mm)">
                                <NumberInput id="work-x" value={localSettings.workArea.x} onChange={e => handleNestedNumericChange('workArea', 'x', e.target.value)} unit="X" />
                                <NumberInput id="work-y" value={localSettings.workArea.y} onChange={e => handleNestedNumericChange('workArea', 'y', e.target.value)} unit="Y" />
                                <NumberInput id="work-z" value={localSettings.workArea.z} onChange={e => handleNestedNumericChange('workArea', 'z', e.target.value)} unit="Z" />
                            </InputGroup>
                            <InputGroup label="Spindle Speed Range (RPM)">
                                <NumberInput id="spindle-min" value={localSettings.spindle.min} onChange={e => handleNestedNumericChange('spindle', 'min', e.target.value)} unit="Min" />
                                <NumberInput id="spindle-max" value={localSettings.spindle.max} onChange={e => handleNestedNumericChange('spindle', 'max', e.target.value)} unit="Max" />
                            </InputGroup>
                            <InputGroup label="Probe (mm)">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 text-center text-text-secondary font-semibold">X</span>
                                    <NumberInput id="probe-x" value={localSettings.probe.xOffset} onChange={e => handleNestedNumericChange('probe', 'xOffset', e.target.value)} />
                                    <span className="w-4 text-center text-text-secondary font-semibold">Y</span>
                                    <NumberInput id="probe-y" value={localSettings.probe.yOffset} onChange={e => handleNestedNumericChange('probe', 'yOffset', e.target.value)} />
                                    <span className="w-4 text-center text-text-secondary font-semibold">Z</span>
                                    <NumberInput id="probe-z" value={localSettings.probe.zOffset} onChange={e => handleNestedNumericChange('probe', 'zOffset', e.target.value)} />
                                </div>
                            </InputGroup>
                            <InputGroup label="Probe Feed Rate">
                                <NumberInput id="probe-feed" value={localSettings.probe.feedRate} onChange={e => handleNestedNumericChange('probe', 'feedRate', e.target.value)} unit="mm/min" />
                            </InputGroup>
                        </div>
                        <div className="space-y-4 bg-background p-4 rounded-md">
                            <h3 className="text-sm font-bold text-text-secondary mb-2">Custom G-Code Scripts</h3>
                            <ScriptInput label="Startup Script (on connect)" value={localSettings.scripts.startup} onChange={e => handleScriptChange('startup', e.target.value)} placeholder="e.g., G21 G90" />
                            <ScriptInput label="Tool Change Script" value={localSettings.scripts.toolChange} onChange={e => handleScriptChange('toolChange', e.target.value)} placeholder="e.g., M5 G0 Z10" />
                            <ScriptInput label="Shutdown Script (on disconnect)" value={localSettings.scripts.shutdown} onChange={e => handleScriptChange('shutdown', e.target.value)} placeholder="e.g., M5 G0 X0 Y0" />
                        </div>
                    </div>
                    <div className="bg-background p-4 rounded-md">
                        <h3 className="text-sm font-bold text-text-secondary mb-2">Configuration</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">Export/Import all settings, macros, and tools.</p>
                            <div className="flex gap-2">
                                <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={handleFileImport} />
                                <button onClick={() => importFileRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-md hover:bg-secondary-focus">
                                    <Upload className="w-4 h-4" />Import
                                </button>
                                <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-md hover:bg-secondary-focus">
                                    <Download className="w-4 h-4" />Export
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-background p-4 rounded-md">
                        <h3 className="text-sm font-bold text-text-secondary mb-2">Interface Settings</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">Reset "Don't show again" dialogs.</p>
                            <button onClick={onResetDialogs} className="px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary">
                                Reset Dialogs
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-background px-6 py-4 flex justify-end items-center rounded-b-lg flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={onCancel} className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2">
                            <Save className="w-5 h-5" />Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;