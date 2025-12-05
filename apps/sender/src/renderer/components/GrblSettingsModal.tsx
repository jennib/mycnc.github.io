import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Upload, AlertTriangle, CheckCircle } from "@mycnc/shared";
import { useUIStore } from '../stores/uiStore';
import { useConnectionStore } from '../stores/connectionStore';

const GrblSettingsModal: React.FC = () => {
    const { t } = useTranslation();
    const { isGrblSettingsModalOpen, actions: uiActions } = useUIStore();
    const { isConnected, actions: connectionActions } = useConnectionStore();
    const controller = useConnectionStore(state => state.controller);

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
                // Match lines like $0=10, $100=250.000, etc.
                if (line.startsWith('$') && line.includes('=')) {
                    collectedSettings.push(line);
                }
            }
        };

        // Attach listener
        controller.on('data', dataHandler);

        // Send command
        try {
            await connectionActions.sendLine('$$');

            // Wait for settings to arrive. GRBL sends them quickly.
            // We'll wait for 2 seconds of silence or a max timeout.
            // A simple timeout is usually sufficient for $$ output.
            await new Promise(resolve => {
                timeoutId = setTimeout(resolve, 2000);
            });

            if (collectedSettings.length > 0) {
                // Sort settings by ID for consistency
                collectedSettings.sort((a, b) => {
                    const idA = parseInt(a.substring(1).split('=')[0]);
                    const idB = parseInt(b.substring(1).split('=')[0]);
                    return idA - idB;
                });

                setSettingsList(collectedSettings);

                // Create download
                const blob = new Blob([collectedSettings.join('\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `grbl-settings-${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

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

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[60] flex items-center justify-center"
            aria-modal="true" role="dialog"
        >
            <div className="bg-surface backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-lg border border-white/10 transform transition-all flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary">{t('grblSettings.title', 'GRBL Firmware Settings')}</h2>
                    <button onClick={uiActions.closeGrblSettingsModal} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200">
                        <p>{t('grblSettings.description', 'Backup and restore your GRBL firmware configuration ($$ settings). This is useful for migrating settings between machines or recovering from a reset.')}</p>
                    </div>

                    {statusMessage && (
                        <div className={`p-4 rounded-lg flex items-start gap-3 ${statusMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            statusMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-secondary/50 text-text-primary border border-white/10'
                            }`}>
                            {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> :
                                statusMessage.type === 'error' ? <AlertTriangle className="w-5 h-5 mt-0.5" /> :
                                    <AlertTriangle className="w-5 h-5 mt-0.5" />} {/* Info icon fallback */}
                            <div>{statusMessage.text}</div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleBackup}
                            disabled={isBackingUp || isRestoring || !isConnected}
                            className="flex flex-col items-center justify-center gap-3 p-6 bg-background/60 border border-white/10 rounded-xl hover:bg-secondary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Download className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-text-primary">{t('grblSettings.backup', 'Backup Settings')}</span>
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
                                disabled={isBackingUp || isRestoring || !isConnected}
                                className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 bg-background/60 border border-white/10 rounded-xl hover:bg-secondary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Upload className="w-8 h-8 text-accent-yellow group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-text-primary">{t('grblSettings.restore', 'Restore Settings')}</span>
                            </button>
                        </div>
                    </div>

                    {isRestoring && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-text-secondary">
                                <span>{t('common.progress', 'Progress')}</span>
                                <span>{restoreProgress}%</span>
                            </div>
                            <div className="h-2 bg-background rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${restoreProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {settingsList.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">{t('grblSettings.currentSettings', 'Current Settings')}</h3>
                            <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-text-secondary max-h-48 overflow-y-auto border border-white/5">
                                {settingsList.map((line, i) => (
                                    <div key={i}>{line}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrblSettingsModal;
