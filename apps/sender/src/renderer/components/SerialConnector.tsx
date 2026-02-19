import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Power, PowerOff, RefreshCw } from "@mycnc/shared";
import { PortInfo, ConnectionOptions } from '@/types'; // Import PortInfo and ConnectionOptions
import { useSettingsStore } from '../stores/settingsStore';
import TextInput from "./ui/TextInput";
import NumberInput from "./ui/NumberInput";

interface SerialConnectorProps {
    isConnected: boolean;
    portInfo: PortInfo | null; // Use the imported PortInfo type
    onConnect: (options: ConnectionOptions) => void;
    onDisconnect: () => void;
    isApiSupported: boolean;
    isSimulated: boolean;
    isConnecting: boolean;
}

const SerialConnector: React.FC<SerialConnectorProps> = ({
    isConnected,
    portInfo,
    onConnect,
    onDisconnect,
    isApiSupported,
    isSimulated,
<<<<<<< HEAD
=======
    isElectron,
>>>>>>> 95e3bdc63ae52018225e20462ed3256d0231bb5b
    isConnecting,
}) => {
    const { t } = useTranslation();
    const { connectionSettings, actions: settingsActions } = useSettingsStore();
    const { tcpIp, tcpPort, type: connectionType } = connectionSettings;

    const handleConnect = () => {
        if (connectionType === 'usb') {
            onConnect({ type: 'usb' });
        } else if (connectionType === 'tcp') {
            onConnect({ type: 'tcp', ip: tcpIp, port: tcpPort });
        } else if (connectionType === 'simulator') {
            onConnect({ type: 'simulator' });
        }
    };

    const displayPortName = () => {
        if (!portInfo) return t('connection.notConnected');
        if (portInfo.type === 'usb') {
            return portInfo.manufacturer
                ? `${portInfo.manufacturer} (${portInfo.portName})`
                : portInfo.portName;
        } else if (portInfo.type === 'tcp') {
            return `${t('connection.tcp')}: ${portInfo.portName}`;
        } else if (portInfo.type === 'simulator') {
            return t('connection.useSimulator');
        }
        return t('connection.unknownPort');
    };

    return (
        <div className="flex items-center gap-4">

<<<<<<< HEAD
=======
            {isElectron && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="usb-connection"
                            name="connection-type"
                            value="usb"
                            checked={connectionType === 'usb'}
                            onChange={() => settingsActions.setConnectionSettings({ type: 'usb' })}
                            disabled={isConnected || isConnecting}
                            className="h-4 w-4 text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                        />
                        <label htmlFor="usb-connection" className={`text-sm ${isConnected || isConnecting ? 'text-text-secondary' : ''}`}>
                            {t('connection.usb')}
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="tcp-connection"
                            name="connection-type"
                            value="tcp"
                            checked={connectionType === 'tcp'}
                            onChange={() => settingsActions.setConnectionSettings({ type: 'tcp' })}
                            disabled={isConnected || isConnecting}
                            className="h-4 w-4 text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                        />
                        <label htmlFor="tcp-connection" className={`text-sm ${isConnected || isConnecting ? 'text-text-secondary' : ''}`}>
                            {t('connection.tcp')}
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="simulator-connection"
                            name="connection-type"
                            value="simulator"
                            checked={connectionType === 'simulator'}
                            onChange={() => settingsActions.setConnectionSettings({ type: 'simulator' })}
                            disabled={isConnected || isConnecting}
                            className="h-4 w-4 text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                        />
                        <label htmlFor="simulator-connection" className={`text-sm ${isConnected || isConnecting ? 'text-text-secondary' : ''}`}>
                            {t('connection.useSimulator')}
                        </label>
                    </div>
                </div>
            )}

            {connectionType === 'tcp' && isElectron && !isConnected && (
                <div className="flex gap-2">
                    <TextInput
                        placeholder={t('connection.ip') || "IP Address"}
                        value={tcpIp || ""}
                        onChange={(e) => settingsActions.setConnectionSettings({ tcpIp: e.target.value })}
                        className="w-32 font-mono text-sm h-9"
                        disabled={isConnected}
                        label={t('connection.ip')}
                        layout="numpad"
                    />
                    <div className="w-24">
                        <NumberInput
                            value={tcpPort}
                            onChange={(val) => settingsActions.setConnectionSettings({ tcpPort: parseInt(val) || 0 })}
                            min={1}
                            max={65535}
                            disabled={isConnected}
                            label={t('connection.port')}
                            className="h-9"
                        />
                    </div>
                </div>
            )}
>>>>>>> 95e3bdc63ae52018225e20462ed3256d0231bb5b

            {isConnected ? (
                <button
                    onClick={onDisconnect}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20 font-bold rounded-lg hover:bg-accent-yellow hover:text-black transition-all duration-300 active:scale-95 shadow-lg shadow-accent-yellow/5"
                >
                    <PowerOff className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">{t('connection.disconnect')}</span>
                </button>
            ) : (
                <button
                    onClick={handleConnect}
                    disabled={isConnecting || (!isApiSupported && connectionType === 'usb') || (connectionType === 'tcp' && (!tcpIp || !tcpPort))}
<<<<<<< HEAD
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20 disabled:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
=======
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors disabled:bg-secondary disabled:cursor-not-allowed whitespace-nowrap"
>>>>>>> 95e3bdc63ae52018225e20462ed3256d0231bb5b
                >
                    {isConnecting ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="text-xs uppercase tracking-wider">{t('connection.connecting')}</span>
                        </>
                    ) : (
                        <>
                            <Power className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wider">{t('connection.connect')}</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default SerialConnector;