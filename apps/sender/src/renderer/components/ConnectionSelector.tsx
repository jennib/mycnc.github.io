import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { useConnectionStore } from '../stores/connectionStore';
import { Settings } from '@mycnc/shared';
import NumberInput from './ui/NumberInput';

const ConnectionSelector: React.FC = () => {
    const { t } = useTranslation();
    const { connectionSettings, actions: settingsActions } = useSettingsStore();
    const { actions: uiActions } = useUIStore();
    const { isConnected } = useConnectionStore();

    // Local state to allow fluid editing (e.g. empty strings)
    const [localIp, setLocalIp] = useState(connectionSettings.tcpIp);
    const [localPort, setLocalPort] = useState(connectionSettings.tcpPort.toString());

    // Sync local state when store changes (e.g. loaded from disk), but only if not focused?
    // For simplicity, we sync when the store value differs significantly and we assume single user.
    // However, to avoid fighting the user typing, we usually rely on the local state driving the updates.
    // We'll update local state only if the store value changes "from outside" (not implemented here easily without refs).
    // Instead, we just initialize. If store updates, we might drift. 
    // But since this is the only place editing these specific values live, it's fine.

    // Actually, if we switch tabs or load settings, we want UI to update.
    useEffect(() => {
        setLocalIp(connectionSettings.tcpIp);
    }, [connectionSettings.tcpIp]);

    useEffect(() => {
        // Only update if the parsed value differs, to avoid converting "1.0" to "1" while typing? 
        // Port is int, so "1" === 1.
        if (parseInt(localPort) !== connectionSettings.tcpPort && localPort !== '' && !isNaN(parseInt(localPort))) {
            setLocalPort(connectionSettings.tcpPort.toString());
        }
    }, [connectionSettings.tcpPort]);


    const handleTypeChange = (type: 'usb' | 'tcp' | 'simulator') => {
        settingsActions.setConnectionSettings({ type });
    };

    const handleIpChange = (val: string) => {
        setLocalIp(val);
        settingsActions.setConnectionSettings({ tcpIp: val });
    };

    const handlePortChange = (val: string) => {
        setLocalPort(val);
        const p = parseInt(val, 10);
        if (!isNaN(p)) {
            settingsActions.setConnectionSettings({ tcpPort: p });
        }
    };

    return (
        <div className="flex items-center gap-3 bg-primary/5 p-1 rounded-xl border border-primary/10 backdrop-blur-md shadow-inner self-center">
            {connectionSettings.type === 'tcp' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300 pl-2">
                    <div className="relative group h-7 w-28">
                        <input
                            type="text"
                            value={localIp}
                            onChange={(e) => handleIpChange(e.target.value)}
                            placeholder="10.0.0.162"
                            className="w-full h-full bg-primary/10 border border-primary/20 rounded-lg py-1 px-2 text-[11px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-all group-hover:border-primary/30 shadow-inner"
                        />
                    </div>
                    <div className="relative group h-7 w-16">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={localPort}
                            onChange={(e) => handlePortChange(e.target.value)}
                            placeholder="8889"
                            className="w-full h-full bg-primary/10 border border-primary/20 rounded-lg py-1 px-2 text-[11px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-all group-hover:border-primary/30 shadow-inner"
                        />
                    </div>
                </div>
            )}

            <div className="flex bg-primary/10 rounded-lg p-0.5 border border-primary/5">
                {(['tcp', 'usb', 'simulator'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => handleTypeChange(type)}
                        disabled={isConnected}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${connectionSettings.type === type
                            ? 'bg-primary text-white shadow-lg scale-105'
                            : 'text-primary/60 hover:text-primary hover:bg-primary/10'
                            } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {type === 'usb' ? 'USB' : type === 'tcp' ? 'TCP' : 'Simulator'}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ConnectionSelector;
