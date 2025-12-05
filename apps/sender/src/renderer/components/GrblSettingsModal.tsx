import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Upload, AlertTriangle, CheckCircle, Save, RefreshCw } from "@mycnc/shared";
import { useUIStore } from '../stores/uiStore';
import { useConnectionStore } from '../stores/connectionStore';
import { GRBL_SETTINGS, GrblSettingDefinition } from '../constants/grblSettings';

const GrblSettingsModal: React.FC = () => {
    const { t } = useTranslation();
    const { isGrblSettingsModalOpen, actions: uiActions } = useUIStore();
    const { isConnected, actions: connectionActions } = useConnectionStore();
    const controller = useConnectionStore(state => state.controller);

    const [parsedSettings, setParsedSettings] = useState<Record<number, string>>({});
    const [modifiedSettings, setModifiedSettings] = useState<Record<number, string>>({});
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreProgress, setRestoreProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const [settingsList, setSettingsList] = useState<string[]>([]);
    const importFileRef = useRef<HTMLInputElement>(null);

    // Clear status when modal closes
    useEffect(() => {
        if (!isGrblSettingsModalOpen) {
            setStatusMessage(null);
            setSettingsList([]);
            setRestoreProgress(0);
        }
    }, [isGrblSettingsModalOpen]);

    if (!isGrblSettingsModalOpen) return null;

    const parseSettings = (lines: string[]) => {
        const parsed: Record<number, string> = {};
        lines.forEach(line => {
            if (line.startsWith('$') && line.includes('=')) {
                const parts = line.substring(1).split('=');
                const id = parseInt(parts[0]);
                const value = parts[1].split('(')[0].trim(); // Remove comments if any
                if (!isNaN(id)) {
                    parsed[id] = value;
                }
            }
        });
        setParsedSettings(parsed);
        setModifiedSettings({});
    };

    const handleBackup = async () => {
        if (!isConnected || !controller) {
            setStatusMessage({ type: 'error', text: t('grblSettings.notConnected', 'Not connected to machine') });
            return;
        }

        setIsBackingUp(true);
        setStatusMessage({ type: 'info', text: t('grblSettings.readingSettings', 'Reading settings from machine...') });
        setSettingsList([]);

        const collectedSettings: string[] = [];
        let timeoutId: NodeJS.Timeout;

        const dataHandler = (data: any) => {
            if (data.type === 'received') {
                const line = data.message.trim();
                if (line.startsWith('$') && line.includes('=')) {
                    collectedSettings.push(line);
                }
            }
        };

        controller.on('data', dataHandler);

        try {
            await connectionActions.sendLine('$$');
            await new Promise(resolve => {
                timeoutId = setTimeout(resolve, 2000);
            });

            if (collectedSettings.length > 0) {
                collectedSettings.sort((a, b) => {
                    const idA = parseInt(a.substring(1).split('=')[0]);
                    const idB = parseInt(b.substring(1).split('=')[0]);
                    return idA - idB;
                });

                setSettingsList(collectedSettings);
                parseSettings(collectedSettings);
                setStatusMessage({ type: 'success', text: t('grblSettings.backupSuccess', 'Settings backed up successfully') });
            } else {
                setStatusMessage({ type: 'error', text: t('grblSettings.noSettingsFound', 'No settings received from machine') });
            }

        } catch (error) {
            setStatusMessage({ type: 'error', text: t('grblSettings.backupError', 'Failed to backup settings') });
        } finally {
            controller.off('data', dataHandler);
            setIsBackingUp(false);
        }
    };

    const handleRestoreFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            if (!content) return;

            const lines = content.split(/\r?\n/).filter(line => line.trim().startsWith('$') && line.includes('='));

            if (lines.length === 0) {
                setStatusMessage({ type: 'error', text: t('grblSettings.invalidFile', 'No valid GRBL settings found in file') });
                return;
            }

            if (!confirm(t('grblSettings.confirmRestore', { count: lines.length, defaultValue: `About to restore ${lines.length} settings. This will overwrite current machine configuration. Continue?` }))) {
                return;
            }

            setIsRestoring(true);
            setStatusMessage({ type: 'info', text: t('grblSettings.restoring', 'Restoring settings...') });
            setRestoreProgress(0);

            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                try {
                    await connectionActions.sendLine(line);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to send ${line}:`, error);
                    failCount++;
                }
                setRestoreProgress(Math.round(((i + 1) / lines.length) * 100));
                // Small delay to prevent flooding if needed, though sendLine awaits response usually
                await new Promise(r => setTimeout(r, 50));
            }

            setIsRestoring(false);
            if (failCount === 0) {
                setStatusMessage({ type: 'success', text: t('grblSettings.restoreSuccess', 'Settings restored successfully') });
                // Refresh settings display
                handleBackup();
            } else {
                setStatusMessage({ type: 'error', text: t('grblSettings.restorePartial', { count: failCount, defaultValue: `Restore complete with ${failCount} errors` }) });
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    const handleSettingChange = (id: number, value: string) => {
        setModifiedSettings(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleBitmaskChange = (id: number, bit: number, checked: boolean) => {
        const currentValue = parseInt(modifiedSettings[id] ?? parsedSettings[id] ?? '0');
        let newValue = currentValue;
        if (checked) {
            newValue |= bit;
        } else {
            newValue &= ~bit;
        }
        handleSettingChange(id, newValue.toString());
    };

    const handleApplyChanges = async () => {
        const updates = Object.entries(modifiedSettings);
        if (updates.length === 0) return;

        setIsRestoring(true); // Reuse restoring state for saving
        setStatusMessage({ type: 'info', text: 'Saving changes...' });

        let failCount = 0;
        for (const [id, value] of updates) {
            try {
                await connectionActions.sendLine(`$${id}=${value}`);
                // Small delay
                await new Promise(r => setTimeout(r, 50));
            } catch (error) {
                console.error(`Failed to set $${id}=${value}`, error);
                failCount++;
            }
        }

        setIsRestoring(false);
        setModifiedSettings({});

        if (failCount === 0) {
            setStatusMessage({ type: 'success', text: 'Settings saved successfully' });
            handleBackup(); // Refresh
        } else {
            setStatusMessage({ type: 'error', text: `Saved with ${failCount} errors` });
        }
    };

    // Group settings by section
    const groupedSettings = GRBL_SETTINGS.reduce((acc, setting) => {
        if (!acc[setting.section]) acc[setting.section] = [];
        acc[setting.section].push(setting);
        return acc;
    }, {} as Record<string, GrblSettingDefinition[]>);

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[60] flex items-center justify-center"
            aria-modal="true" role="dialog"
        >
            <div className="bg-surface backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-4xl border border-white/10 transform transition-all flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary">{t('grblSettings.title', 'GRBL Firmware Settings')}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBackup}
                            disabled={isBackingUp || isRestoring || !isConnected}
                            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                            title="Refresh Settings"
                        >
                            <RefreshCw className={`w-5 h-5 ${isBackingUp ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={uiActions.closeGrblSettingsModal} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {statusMessage && (
                        <div className={`p-4 rounded-lg flex items-start gap-3 ${statusMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            statusMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-secondary/50 text-text-primary border border-white/10'
                            }`}>
                            {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> :
                                statusMessage.type === 'error' ? <AlertTriangle className="w-5 h-5 mt-0.5" /> :
                                    <AlertTriangle className="w-5 h-5 mt-0.5" />}
                            <div>{statusMessage.text}</div>
                        </div>
                    )}

                    {!isConnected && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-200 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            {t('grblSettings.notConnected', 'Not connected to machine')}
                        </div>
                    )}

                    {Object.entries(groupedSettings).map(([section, settings]) => (
                        <div key={section} className="space-y-4">
                            <h3 className="text-lg font-bold text-primary border-b border-white/10 pb-2">{section}</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {settings.map(setting => {
                                    const rawValue = modifiedSettings[setting.id] ?? parsedSettings[setting.id] ?? '';
                                    const isModified = modifiedSettings[setting.id] !== undefined;

                                    return (
                                        <div key={setting.id} className="bg-background/40 p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-text-secondary bg-black/30 px-1.5 py-0.5 rounded">${setting.id}</span>
                                                        <span className="font-semibold text-text-primary">{setting.name}</span>
                                                    </div>
                                                    <p className="text-xs text-text-secondary mt-1">{setting.description}</p>
                                                </div>
                                                {setting.unit && <span className="text-xs text-text-secondary font-mono">{setting.unit}</span>}
                                            </div>

                                            <div className="mt-3">
                                                {setting.type === 'boolean' ? (
                                                    <select
                                                        value={rawValue}
                                                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                                                        className={`w-full bg-black/20 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${isModified ? 'border-accent-yellow text-accent-yellow' : 'border-white/10 text-text-primary'}`}
                                                    >
                                                        {setting.options?.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                ) : setting.type === 'bitmask' ? (
                                                    <div className="flex flex-wrap gap-4">
                                                        {setting.options?.map(opt => {
                                                            const val = parseInt(rawValue || '0');
                                                            const checked = (val & opt.value) === opt.value;
                                                            return (
                                                                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked}
                                                                        onChange={(e) => handleBitmaskChange(setting.id, opt.value, e.target.checked)}
                                                                        className="rounded border-white/10 bg-black/20 text-primary focus:ring-primary transition-colors hover:border-white/20"
                                                                    />
                                                                    <span className={`text-sm ${checked ? 'text-text-primary' : 'text-text-secondary'}`}>{opt.label}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        value={rawValue}
                                                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                                                        className={`w-full bg-black/20 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${isModified ? 'border-accent-yellow text-accent-yellow' : 'border-white/10 text-text-primary'}`}
                                                        step={setting.type === 'float' ? "0.001" : "1"}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between items-center bg-surface/50">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const blob = new Blob([settingsList.join('\n')], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `grbl-settings-${new Date().toISOString().split('T')[0]}.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}
                            className="px-4 py-2 bg-secondary/50 text-text-primary text-sm font-semibold rounded-lg hover:bg-secondary border border-white/10 transition-all"
                        >
                            <Download className="w-4 h-4 inline-block mr-2" />
                            {t('grblSettings.backup', 'Backup to File')}
                        </button>
                        <div className="relative">
                            <input
                                type="file"
                                ref={importFileRef}
                                className="hidden"
                                accept=".txt,.nc,.gcode"
                                onChange={handleRestoreFile}
                            />
                            <button
                                onClick={() => importFileRef.current?.click()}
                                className="px-4 py-2 bg-secondary/50 text-text-primary text-sm font-semibold rounded-lg hover:bg-secondary border border-white/10 transition-all"
                            >
                                <Upload className="w-4 h-4 inline-block mr-2" />
                                {t('grblSettings.restore', 'Restore from File')}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={uiActions.closeGrblSettingsModal} className="px-4 py-2 bg-secondary/80 text-text-primary font-semibold rounded-lg hover:bg-secondary border border-white/5 transition-all">
                            {t('common.cancel', 'Close')}
                        </button>
                        {Object.keys(modifiedSettings).length > 0 && (
                            <button
                                onClick={handleApplyChanges}
                                className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus flex items-center gap-2 shadow-lg shadow-primary/20 transition-all animate-pulse"
                            >
                                <Save className="w-5 h-5" />
                                Apply {Object.keys(modifiedSettings).length} Changes
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrblSettingsModal;
