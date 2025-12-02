import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X, Upload, Download } from './Icons';
import { MachineSettings, GeneratorSettings } from '@/types';

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
            className="w-full bg-surface border border-white/20 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner"
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
            className="w-full bg-surface border border-white/20 rounded-lg py-2 px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner"
            spellCheck="false"
        />
    </div>
);

interface SettingsModalProps {
    isOpen: boolean;
    onCancel: () => void;
    onSave: (settings: MachineSettings, generatorSettings: GeneratorSettings) => void;
    settings: MachineSettings;
    generatorSettings: GeneratorSettings;
    onResetDialogs: () => void;
    onExport: () => void;
    onImport: (imported: any) => void;
    onContactClick: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onCancel, onSave, settings, generatorSettings, onResetDialogs, onExport, onImport, onContactClick }) => {
    const { t, i18n } = useTranslation();
    const [localSettings, setLocalSettings] = useState<MachineSettings>(settings);
    const [localGeneratorSettings, setLocalGeneratorSettings] = useState<GeneratorSettings>(generatorSettings);
    const importFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalSettings(JSON.parse(JSON.stringify(settings)));
            setLocalGeneratorSettings(JSON.parse(JSON.stringify(generatorSettings)));
        }
    }, [isOpen, settings, generatorSettings]);

    if (!isOpen) return null;

    const handleNumericChange = (field: keyof MachineSettings, value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedNumericChange = (category: keyof MachineSettings, field: string, value: string) => {
        // Keep the value as a string during editing to allow partial input like "1." or "-"
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
        // Deep clone to avoid mutating state directly
        const settingsToSave = JSON.parse(JSON.stringify(localSettings));


        // Define which fields need to be parsed to numbers
        const numericFields: Record<string, string[]> = {
            workArea: ['x', 'y', 'z'],
            spindle: ['min', 'max', 'warmupDelay'],
            probe: ['xOffset', 'yOffset', 'zOffset', 'feedRate']
        };

        // Iterate and parse string inputs back to numbers
        for (const category in numericFields) {
            if (settingsToSave[category as keyof MachineSettings]) {
                for (const field of numericFields[category]) {
                    const value = settingsToSave[category][field];
                    // Coerce to number, default to 0 if invalid
                    settingsToSave[category][field] = parseFloat(value) || 0;
                }
            }
        }

        settingsToSave.jogFeedRate = parseFloat(settingsToSave.jogFeedRate) || 0;

        onSave(settingsToSave, localGeneratorSettings);
        onCancel();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            if (!e.target?.result) return;
            try {
                const importedData = JSON.parse(e.target.result as string);
                onImport(importedData);
                onCancel(); // Close modal on successful import
            } catch (error) {
                console.error("Failed to parse settings file:", error);
                alert("Error: Could not read or parse the settings file. Please ensure it's a valid JSON file.");
            }
        };
        reader.readAsText(file);
        event.target.value = ""; // Reset file input
    };

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center"
            aria-modal="true" role="dialog"
        >
            <div
                className="bg-surface backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-2xl border border-white/10 transform transition-all max-h-[90vh] flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-text-primary">{t('settings.title')}</h2>
                    <button onClick={onCancel} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 bg-background/60 p-4 rounded-xl border border-white/10 shadow-md">
                            <InputGroup label={t('settings.workArea')}>
                                <NumberInput id="work-x" value={localSettings.workArea.x} onChange={e => handleNestedNumericChange('workArea', 'x', e.target.value)} unit="X" />
                                <NumberInput id="work-y" value={localSettings.workArea.y} onChange={e => handleNestedNumericChange('workArea', 'y', e.target.value)} unit="Y" />
                                <NumberInput id="work-z" value={localSettings.workArea.z} onChange={e => handleNestedNumericChange('workArea', 'z', e.target.value)} unit="Z" />
                            </InputGroup>
                            <InputGroup label={t('settings.jogFeedRate')}>
                                <NumberInput id="jog-feed" value={localSettings.jogFeedRate} onChange={e => handleNumericChange('jogFeedRate', e.target.value)} />
                            </InputGroup>
                            <InputGroup label={t('settings.spindleSpeed')}>
                                <NumberInput id="spindle-min" value={localSettings.spindle.min} onChange={e => handleNestedNumericChange('spindle', 'min', e.target.value)} unit="Min" />
                                <NumberInput id="spindle-max" value={localSettings.spindle.max} onChange={e => handleNestedNumericChange('spindle', 'max', e.target.value)} unit="Max" />
                            </InputGroup>
                            <InputGroup label={t('settings.controllerType')}>
                                <select
                                    id="controller-type"
                                    value={localSettings.controllerType}
                                    onChange={e => handleNumericChange('controllerType', e.target.value)}
                                    className="w-full bg-surface border border-white/20 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner"
                                >
                                    <option value="grbl">GRBL (Standard 3-axis CNC)</option>
                                    {/* <option value="fluidnc">FluidNC (WiFi-enabled GRBL)</option>
                                    <option value="grblhal">grblHAL (Advanced GRBL)</option>
                                    <option value="smoothieware">Smoothieware (32-bit GRBL-like)</option>
                                    <option value="marlin">Marlin (3D Printer/CNC)</option>
                                    <option value="tinyg">TinyG (JSON Protocol)</option>
                                    <option value="linuxcnc">LinuxCNC (Linux-based)</option> */}
                                </select>
                            </InputGroup>
                            <InputGroup label={t('settings.spindleWarmup')}>
                                <NumberInput id="spindle-warmup" value={localSettings.spindle.warmupDelay} onChange={e => handleNestedNumericChange('spindle', 'warmupDelay', e.target.value)} unit="ms" />
                            </InputGroup>
                            <InputGroup label={t('settings.probe')}>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 text-center text-text-secondary font-semibold">X</span>
                                    <NumberInput id="probe-x" value={localSettings.probe.xOffset} onChange={e => handleNestedNumericChange('probe', 'xOffset', e.target.value)} />
                                    <span className="w-4 text-center text-text-secondary font-semibold">Y</span>
                                    <NumberInput id="probe-y" value={localSettings.probe.yOffset} onChange={e => handleNestedNumericChange('probe', 'yOffset', e.target.value)} />
                                    <span className="w-4 text-center text-text-secondary font-semibold">Z</span>
                                    <NumberInput id="probe-z" value={localSettings.probe.zOffset} onChange={e => handleNestedNumericChange('probe', 'zOffset', e.target.value)} />
                                </div>
                            </InputGroup>
                            <InputGroup label={t('settings.probeFeedRate')}>
                                <NumberInput id="probe-feed" value={localSettings.probe.feedRate} onChange={e => handleNestedNumericChange('probe', 'feedRate', e.target.value)} unit="mm/min" />
                            </InputGroup>
                        </div>
                        <div className="space-y-4 bg-background/60 p-4 rounded-xl border border-white/10 shadow-md">
                            <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">{t('settings.customScripts')}</h3>
                            <ScriptInput label={t('settings.startupScript')} value={localSettings.scripts.startup} onChange={e => handleScriptChange('startup', e.target.value)} placeholder="e.g., G21 G90" />
                            <ScriptInput label={t('settings.shutdownScript')} value={localSettings.scripts.shutdown} onChange={e => handleScriptChange('shutdown', e.target.value)} placeholder="e.g., M5 G0 X0 Y0" />
                        </div>
                    </div>
                    <div className="bg-background/60 p-4 rounded-xl border border-white/10 shadow-md">
                        <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">{t('settings.configuration')}</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-text-secondary">{t('settings.configDescription')}</p>
                            <div className="flex gap-2">
                                <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={handleFileImport} />
                                <button onClick={() => importFileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-text-primary text-sm font-semibold rounded-lg hover:bg-secondary border border-white/10 transition-all shadow-sm active:scale-95">
                                    <Upload className="w-4 h-4" />{t('settings.import')}
                                </button>
                                <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-text-primary text-sm font-semibold rounded-lg hover:bg-secondary border border-white/10 transition-all shadow-sm active:scale-95">
                                    <Download className="w-4 h-4" />{t('settings.export')}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-background/60 p-4 rounded-xl border border-white/10 shadow-md">
                        <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">{t('settings.interface')}</h3>
                        <div className="space-y-4">
                            <InputGroup label={t('common.language')}>
                                <select
                                    value={i18n.language}
                                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                                    className="w-full bg-surface border border-white/20 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="zh">中文</option>
                                </select>
                            </InputGroup>
                        </div>
                    </div>
                    <div className="bg-background/60 p-4 rounded-xl border border-white/10 shadow-md">
                        <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">{t('settings.dialogs')}</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-text-secondary">{t('settings.resetDialogsDesc')}</p>
                            <button onClick={onResetDialogs} className="px-4 py-2 bg-secondary/50 text-text-primary text-sm font-semibold rounded-lg hover:bg-secondary border border-white/10 transition-all shadow-sm active:scale-95">
                                {t('settings.resetDialogs')}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-background/30 px-6 py-4 flex justify-between items-center rounded-b-xl flex-shrink-0 border-t border-white/10">
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span>&copy; {new Date().getFullYear()} mycnc.app v{window.electronAPI ? '1.0.21' : '1.0.21'}</span>
                        <button type="button" onClick={() => {
                            onCancel(); // Close settings modal first
                            onContactClick(); // Then open contact modal
                        }} className="text-primary hover:underline font-semibold">
                            {t('settings.contact')}
                        </button>
                        <span>•</span>
                        <a href="https://github.com/jennib/mycnc.github.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                            GitHub
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onCancel} className="px-4 py-2 bg-secondary/80 text-text-primary font-semibold rounded-lg hover:bg-secondary border border-white/5 transition-all active:scale-95">{t('common.cancel')}</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <Save className="w-5 h-5" />{t('settings.save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
