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
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20 disabled:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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