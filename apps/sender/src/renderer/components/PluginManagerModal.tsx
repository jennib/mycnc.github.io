import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, FolderOpen, Power, Trash2, RefreshCw } from '@mycnc/shared';

interface Plugin {
    filename: string;
    name: string;
    isEnabled: boolean;
}

interface PluginManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PluginManagerModal: React.FC<PluginManagerModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadPlugins = async () => {
        if (!window.electronAPI?.getPlugins) return;
        setIsLoading(true);
        try {
            const list = await window.electronAPI.getPlugins();
            setPlugins(list);
        } catch (error) {
            console.error("Failed to load plugins:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadPlugins();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleToggle = async (filename: string, isEnabled: boolean) => {
        if (!window.electronAPI?.togglePlugin) return;
        const success = await window.electronAPI.togglePlugin(filename, !isEnabled);
        if (success) {
            await loadPlugins();
        }
    };

    const handleDelete = async (filename: string) => {
        if (!window.electronAPI?.deletePlugin) return;
        const confirmDelete = window.confirm(`Are you sure you want to delete ${filename}? This action cannot be undone.`);
        if (confirmDelete) {
            const success = await window.electronAPI.deletePlugin(filename);
            if (success) {
                await loadPlugins();
            }
        }
    };

    const handleOpenPluginsFolder = async () => {
        if (window.electronAPI?.openPluginsFolder) {
            await window.electronAPI.openPluginsFolder();
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[10000] flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="bg-surface backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-2xl border border-white/10 transform transition-all flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-bold text-text-primary">Plugin Manager</h2>
                    <button onClick={onClose} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-sm text-text-secondary">
                            Plugins extend the functionality of the application. They can monitor the application state and perform custom actions. Toggling or adding new plugins requires an application restart to take full effect.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleOpenPluginsFolder}
                                className="flex items-center gap-2 px-3 py-2 bg-secondary/50 text-text-primary text-sm font-semibold rounded-lg hover:bg-secondary border border-white/10 transition-all shadow-sm"
                                title="Open Plugins Folder"
                            >
                                <FolderOpen className="w-4 h-4" /> Folder
                            </button>
                            <button
                                onClick={loadPlugins}
                                className="flex items-center gap-2 px-3 py-2 bg-secondary/50 text-text-primary text-sm font-semibold rounded-lg hover:bg-secondary border border-white/10 transition-all shadow-sm"
                                title="Refresh Plugin List"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {plugins.length === 0 && !isLoading ? (
                            <div className="text-center p-8 bg-background/60 rounded-xl border border-white/10 shadow-md">
                                <p className="text-text-secondary">No plugins found.</p>
                                <p className="text-sm text-text-secondary mt-2">Open the plugins folder to add some.</p>
                            </div>
                        ) : (
                            plugins.map((plugin) => (
                                <div key={plugin.filename} className="flex justify-between items-center bg-background/60 p-4 rounded-xl border border-white/10 shadow-md">
                                    <div>
                                        <h3 className="font-bold text-text-primary flex items-center gap-2">
                                            {plugin.name}
                                            {plugin.isEnabled ? (
                                                <span className="text-[10px] uppercase font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Active</span>
                                            ) : (
                                                <span className="text-[10px] uppercase font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Disabled</span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-text-secondary mt-1">{plugin.filename}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggle(plugin.filename, plugin.isEnabled)}
                                            className={`p-2 rounded-lg border transition-all ${plugin.isEnabled
                                                ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
                                                : 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20'
                                                }`}
                                            title={plugin.isEnabled ? 'Disable Plugin' : 'Enable Plugin'}
                                        >
                                            <Power className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plugin.filename)}
                                            className="p-2 bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 rounded-lg border transition-all"
                                            title="Delete Plugin"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PluginManagerModal;
