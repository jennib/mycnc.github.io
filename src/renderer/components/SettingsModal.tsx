import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Download } from './Icons';
import { MachineSettings, GeneratorSettings } from '@/types';
import Modal from './Modal';
import NumberInput from './NumberInput';
import { useUIStore } from '@/stores/uiStore';

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
    onClose: () => void;
    onSave: (settings: MachineSettings, generatorSettings: GeneratorSettings) => void;
    settings: MachineSettings;
    generatorSettings: GeneratorSettings;
    onResetDialogs: () => void;
    onExport: () => void;
    onImport: (imported: any) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, settings, generatorSettings, onResetDialogs, onExport, onImport }) => {
    const [localSettings, setLocalSettings] = useState<MachineSettings>(settings);
    const [localGeneratorSettings, setLocalGeneratorSettings] = useState<GeneratorSettings>(generatorSettings);
    const importFileRef = useRef<HTMLInputElement>(null);
    const openInfoModal = useUIStore(state => state.actions.openInfoModal);

    useEffect(() => {
        if (isOpen) {
            setLocalSettings(JSON.parse(JSON.stringify(settings)));
            setLocalGeneratorSettings(JSON.parse(JSON.stringify(generatorSettings)));
        }
    }, [isOpen, settings, generatorSettings]);

    const handleNumericChange = (field: keyof MachineSettings, value: number) => {
        setLocalSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedNumericChange = (category: keyof MachineSettings, field: string, value: number) => {
        setLocalSettings(prev => ({
            ...prev,
            [category]: {
                ...(prev[category] as Record<string, any>),
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
        onSave(localSettings, localGeneratorSettings);
        onClose();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const importedData = JSON.parse(e.target.result as string);
                onImport(importedData);
                onClose(); // Close modal on successful import
            } catch (error) {
                console.error("Failed to parse settings file:", error);
                openInfoModal("Import Error", "Could not read or parse the settings file. Please ensure it's a valid JSON file.");
            }
        };
        reader.readAsText(file);
        event.target.value = null; // Reset file input
    };

    const footer = (
        <div className="flex items-center gap-4">
            <button onClick={onClose} className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2">
                <Save className="w-5 h-5" />Save Settings
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Machine Settings"
            footer={footer}
            size="2xl"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 bg-background p-4 rounded-md">
                        <InputGroup label="Work Area Dimensions (mm)">
                            <NumberInput id="work-x" value={localSettings.workArea.x} onChange={value => handleNestedNumericChange('workArea', 'x', value)} unit="X" />
                            <NumberInput id="work-y" value={localSettings.workArea.y} onChange={value => handleNestedNumericChange('workArea', 'y', value)} unit="Y" />
                            <NumberInput id="work-z" value={localSettings.workArea.z} onChange={value => handleNestedNumericChange('workArea', 'z', value)} unit="Z" />
                        </InputGroup>
                        <InputGroup label="Jog Feed Rate (mm/min)">
                            <NumberInput id="jog-feed" value={localSettings.jogFeedRate} onChange={value => handleNumericChange('jogFeedRate', value)} />
                        </InputGroup>
                        <InputGroup label="Spindle Speed Range (RPM)">
                            <NumberInput id="spindle-min" value={localSettings.spindle.min} onChange={value => handleNestedNumericChange('spindle', 'min', value)} unit="Min" />
                            <NumberInput id="spindle-max" value={localSettings.spindle.max} onChange={value => handleNestedNumericChange('spindle', 'max', value)} unit="Max" />
                        </InputGroup>
                        <InputGroup label="Spindle Warmup Delay (ms)">
                            <NumberInput id="spindle-warmup" value={localSettings.spindle.warmupDelay} onChange={value => handleNestedNumericChange('spindle', 'warmupDelay', value)} unit="ms" />
                        </InputGroup>
                        <InputGroup label="Probe (mm)">
                            <div className="flex items-center gap-2">
                                <span className="w-4 text-center text-text-secondary font-semibold">X</span>
                                <NumberInput id="probe-x" value={localSettings.probe.xOffset} onChange={value => handleNestedNumericChange('probe', 'xOffset', value)} />
                                <span className="w-4 text-center text-text-secondary font-semibold">Y</span>
                                <NumberInput id="probe-y" value={localSettings.probe.yOffset} onChange={value => handleNestedNumericChange('probe', 'yOffset', value)} />
                                <span className="w-4 text-center text-text-secondary font-semibold">Z</span>
                                <NumberInput id="probe-z" value={localSettings.probe.zOffset} onChange={value => handleNestedNumericChange('probe', 'zOffset', value)} />
                            </div>
                        </InputGroup>
                        <InputGroup label="Probe Feed Rate">
                            <NumberInput id="probe-feed" value={localSettings.probe.feedRate} onChange={value => handleNestedNumericChange('probe', 'feedRate', value)} unit="mm/min" />
                        </InputGroup>
                    </div>
                    <div className="space-y-4 bg-background p-4 rounded-md">
                        <h3 className="text-sm font-bold text-text-secondary mb-2">Custom G-Code Scripts</h3>
                        <ScriptInput label="Startup Script (on connect)" value={localSettings.scripts.startup} onChange={e => handleScriptChange('startup', e.target.value)} placeholder="e.g., G21 G90" />
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
        </Modal>
    );
};

export default SettingsModal;