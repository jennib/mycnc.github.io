import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X, Upload, Download, Ruler, Settings } from "@mycnc/shared";
import { MachineSettings, GeneratorSettings } from '@/types';
import { useSettingsStore } from '../stores/settingsStore';
import BuildAreaMeasurementModal from './BuildAreaMeasurementModal';

import NumberInput from './ui/NumberInput';
import TextAreaInput from './ui/TextAreaInput';

interface InputGroupProps {
    label: string;
    children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, children }) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-text-secondary mb-2">{label}</label>
        <div className="flex items-center gap-3">{children}</div>
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
    onOpenGrblSettings: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onCancel, onSave, settings, generatorSettings, onResetDialogs, onExport, onImport, onContactClick, onOpenGrblSettings }) => {
    const { t, i18n } = useTranslation();
    const [localSettings, setLocalSettings] = useState<MachineSettings>(settings);
    const [localGeneratorSettings, setLocalGeneratorSettings] = useState<GeneratorSettings>(generatorSettings);
    const [showBuildAreaModal, setShowBuildAreaModal] = useState(false);
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

    const handleApplyMeasurement = (measurements: { x?: number, y?: number, z?: number }) => {
        setLocalSettings(prev => ({
            ...prev,
            workArea: {
                ...prev.workArea,
                x: measurements.x !== undefined ? measurements.x : prev.workArea.x,
                y: measurements.y !== undefined ? measurements.y : prev.workArea.y,
                z: measurements.z !== undefined ? measurements.z : prev.workArea.z
            }
        }));
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
                                <div className="grid grid-cols-3 gap-2 w-full">
                                    <NumberInput id="work-x" value={localSettings.workArea.x} onChange={val => handleNestedNumericChange('workArea', 'x', val)} unit="X" className="w-full" />
                                    <NumberInput id="work-y" value={localSettings.workArea.y} onChange={val => handleNestedNumericChange('workArea', 'y', val)} unit="Y" className="w-full" />
                                    <div className="flex gap-2">
                                        <NumberInput id="work-z" value={localSettings.workArea.z} onChange={val => handleNestedNumericChange('workArea', 'z', val)} unit="Z" className="w-full" />
                                        <button
                                            onClick={() => setShowBuildAreaModal(true)}
                                            className="p-2 bg-secondary/50 text-text-primary rounded hover:bg-secondary border border-white/10 flex-shrink-0"
                                            title="Measure Build Area"
                                        >
                                            <Ruler className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </InputGroup>
                            <InputGroup label={t('settings.jogFeedRate')}>
                                <NumberInput id="jog-feed" value={localSettings.jogFeedRate} onChange={val => handleNumericChange('jogFeedRate', val)} />
                            </InputGroup>
                            <InputGroup label={t('settings.spindleSpeed')}>
                                <div className="grid grid-cols-2 gap-2 w-full">
                                    <NumberInput id="spindle-min" value={localSettings.spindle.min} onChange={val => handleNestedNumericChange('spindle', 'min', val)} unit="Min" className="w-full" />
                                    <NumberInput id="spindle-max" value={localSettings.spindle.max} onChange={val => handleNestedNumericChange('spindle', 'max', val)} unit="Max" className="w-full" />
                                </div>
                            </InputGroup>
                            <InputGroup label={t('settings.controllerType')}>
                                <select
                                    id="controller-type"
                                    value={localSettings.controllerType}
                                    onChange={e => handleNumericChange('controllerType', e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner transition-colors hover:border-white/20"
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
                                <NumberInput id="spindle-warmup" value={localSettings.spindle.warmupDelay} onChange={val => handleNestedNumericChange('spindle', 'warmupDelay', val)} unit="ms" />
                            </InputGroup>
                            <InputGroup label={t('settings.probe')}>
                                <div className="grid grid-cols-3 gap-2 w-full">
                                    <NumberInput id="probe-x" value={localSettings.probe.xOffset} onChange={val => handleNestedNumericChange('probe', 'xOffset', val)} unit="X" className="w-full" />
                                    <NumberInput id="probe-y" value={localSettings.probe.yOffset} onChange={val => handleNestedNumericChange('probe', 'yOffset', val)} unit="Y" className="w-full" />
                                    <NumberInput id="probe-z" value={localSettings.probe.zOffset} onChange={val => handleNestedNumericChange('probe', 'zOffset', val)} unit="Z" className="w-full" />
                                </div>
                            </InputGroup>
                            <InputGroup label={t('settings.probeFeedRate')}>
                                <NumberInput id="probe-feed" value={localSettings.probe.feedRate} onChange={val => handleNestedNumericChange('probe', 'feedRate', val)} unit="mm/min" />
                            </InputGroup>

                            <div className="border-t border-white/10 pt-4 mt-4">
                                <InputGroup label={t('settings.toolChangePolicy')}>
                                    <div className="flex flex-col gap-2 w-full">
                                        <select
                                            value={localSettings.toolChangePolicy || 'native'}
                                            onChange={e => handleNumericChange('toolChangePolicy', e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner transition-colors hover:border-white/20"
                                        >
                                            <option value="native">{t('settings.toolChangeNative')}</option>
                                            <option value="macro">{t('settings.toolChangeMacro')}</option>
                                        </select>

                                        {localSettings.toolChangePolicy === 'macro' && (
                                            <div className="mt-2">
                                                <label className="block text-xs font-bold text-text-secondary mb-1">{t('settings.toolChangeSelectMacro')}</label>
                                                <select
                                                    value={localSettings.toolChangeMacroId || ''}
                                                    onChange={e => handleNumericChange('toolChangeMacroId', e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner transition-colors hover:border-white/20"
                                                >
                                                    <option value="">{t('common.select') || 'Select...'}</option>
                                                    {useSettingsStore.getState().macros.map((m, i) => (
                                                        <option key={i} value={m.name}>{m.name}</option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-text-secondary mt-1">
                                                    Macro variable <code>{'{tool}'}</code> will be replaced with the tool number (e.g. from <code>T1</code>).
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </InputGroup>
                            </div>

                        </div>
                        <div className="space-y-4 bg-background/60 p-4 rounded-xl border border-white/10 shadow-md">
                            <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">{t('settings.customScripts')}</h3>
                            <TextAreaInput label={t('settings.startupScript')} value={localSettings.scripts.startup} onChange={val => handleScriptChange('startup', val)} placeholder="e.g., G21 G90" />
                            <TextAreaInput label={t('settings.shutdownScript')} value={localSettings.scripts.shutdown} onChange={val => handleScriptChange('shutdown', val)} placeholder="e.g., M5 G0 X0 Y0" />
                        </div>
                    </div>
                    <div className="bg-background/60 p-4 rounded-xl border border-white/10 shadow-md">
                        <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">{t('settings.machineConfiguration', 'Machine Firmware')}</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-text-secondary">{t('settings.machineConfigDescription', 'Manage your GRBL firmware settings ($$ commands).')}</p>
                            <button onClick={onOpenGrblSettings} className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-text-primary text-sm font-semibold rounded-lg hover:bg-secondary border border-white/10 transition-all shadow-sm active:scale-95">
                                <Settings className="w-4 h-4" />{t('settings.firmware', 'Firmware')}
                            </button>
                        </div>
                    </div>
                    <div className="bg-background/60 p-4 rounded-xl border border-white/10 shadow-md">
                        <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">{t('settings.appConfiguration', 'Application Settings')}</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-text-secondary">{t('settings.appConfigDescription', 'Export/Import all settings, macros, and tools.')}</p>
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
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner transition-colors hover:border-white/20"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="zh">中文</option>
                                    <option value="hi">हिन्दी</option>
                                    <option value="bn">বাংলা</option>
                                    <option value="ja">日本語</option>
                                    <option value="uk">Українська</option>
                                    <option value="pa">ਪੰਜਾਬੀ</option>
                                </select>
                            </InputGroup>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="play-sound"
                                    checked={localSettings.playCompletionSound}
                                    onChange={(e) => setLocalSettings(prev => ({ ...prev, playCompletionSound: e.target.checked }))}
                                    className="w-5 h-5 rounded border-white/10 bg-black/20 text-primary focus:ring-primary transition-colors hover:border-white/20"
                                />
                                <label htmlFor="play-sound" className="text-sm font-medium text-text-primary">
                                    {t('settings.playCompletionSound', 'Play Completion Sound')}
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="enable-osk"
                                    checked={useSettingsStore.getState().isVirtualKeyboardEnabled}
                                    onChange={(e) => useSettingsStore.getState().actions.setIsVirtualKeyboardEnabled(e.target.checked)}
                                    className="w-5 h-5 rounded border-white/10 bg-black/20 text-primary focus:ring-primary transition-colors hover:border-white/20"
                                />
                                <label htmlFor="enable-osk" className="text-sm font-medium text-text-primary">
                                    {t('settings.enableVirtualKeyboard', 'Enable On-Screen Keyboard')}
                                </label>
                            </div>
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
            <BuildAreaMeasurementModal
                isOpen={showBuildAreaModal}
                onClose={() => setShowBuildAreaModal(false)}
                onApply={handleApplyMeasurement}
            />
        </div >
    );
};

export default SettingsModal;
