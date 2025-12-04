import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Power, PowerOff } from "@mycnc/shared";
import { PortInfo, ConnectionOptions } from '@/types'; // Import PortInfo and ConnectionOptions

interface SerialConnectorProps {
    isConnected: boolean;
    portInfo: PortInfo | null; // Use the imported PortInfo type
    onConnect: (options: ConnectionOptions) => void;
    onDisconnect: () => void;
    isApiSupported: boolean;
    isSimulated: boolean;
    useSimulator: boolean;
    onSimulatorChange: (use: boolean) => void;
    isElectron: boolean; // New prop to indicate Electron environment
    isConnecting: boolean;
}

const SerialConnector: React.FC<SerialConnectorProps> = ({
    isConnected,
    portInfo,
    onConnect,
    onDisconnect,
    isApiSupported,
    isSimulated,
    useSimulator,
    onSimulatorChange,
    isElectron,
    isConnecting,
}) => {
    const { t } = useTranslation();
    const [tcpIp, setTcpIp] = useState('10.0.0.162');
    const [tcpPort, setTcpPort] = useState(8889); // Default GRBL port
    const [connectionType, setConnectionType] = useState<'usb' | 'tcp'>('usb');

    const handleConnect = () => {
        if (connectionType === 'usb') {
            onConnect({ type: 'usb' });
        } else {
            onConnect({ type: 'tcp', ip: tcpIp, port: tcpPort });
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
        }
        return t('connection.unknownPort');
    };

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="simulator-checkbox"
                    checked={useSimulator}
                    onChange={(e) => onSimulatorChange(e.target.checked)}
                    disabled={isConnected || isConnecting}
                    className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                />
                <label htmlFor="simulator-checkbox" className={`text-sm whitespace-nowrap ${isConnected || isConnecting ? 'text-text-secondary' : ''}`}>
                    {t('connection.useSimulator')}
                </label>
            </div>

            {isElectron && (
                <div className="flex items-center gap-2">
                    <input
                        type="radio"
                        id="usb-connection"
                        name="connection-type"
                        value="usb"
                        checked={connectionType === 'usb'}
                        onChange={() => setConnectionType('usb')}
                        disabled={isConnected || isConnecting}
                        className="h-4 w-4 text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                    />
                    <label htmlFor="usb-connection" className={`text-sm ${isConnected || isConnecting ? 'text-text-secondary' : ''}`}>
                        {t('connection.usb')}
                    </label>
                    <input
                        type="radio"
                        id="tcp-connection"
                        name="connection-type"
                        value="tcp"
                        checked={connectionType === 'tcp'}
                        onChange={() => setConnectionType('tcp')}
                        disabled={isConnected || isConnecting}
                        className="h-4 w-4 text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                    />
                    <label htmlFor="tcp-connection" className={`text-sm ${isConnected || isConnecting ? 'text-text-secondary' : ''}`}>
                        {t('connection.tcp')}
                    </label>
                </div>
            )}

            {connectionType === 'tcp' && isElectron && !isConnected && (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder={t('connection.ip')}
                        value={tcpIp}
                        onChange={(e) => setTcpIp(e.target.value)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm bg-background text-text-primary"
                        disabled={isConnected || isConnecting}
                    />
                    <input
                        type="number"
                        placeholder={t('connection.port')}
                        value={tcpPort}
                        onChange={(e) => setTcpPort(parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm bg-background text-text-primary"
                        disabled={isConnected || isConnecting}
                    />
                </div>
            )}

            {isConnected ? (
                <button onClick={onDisconnect} className="flex items-center gap-2 px-4 py-2 bg-accent-yellow text-black font-semibold rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-background transition-colors whitespace-nowrap">
                    <PowerOff className="w-5 h-5" />
                    {t('connection.disconnect')}
                </button>
            ) : (
                <button
                    onClick={handleConnect}
                    disabled={isConnecting || (!isApiSupported && connectionType === 'usb' && !useSimulator) || (connectionType === 'tcp' && (!tcpIp || !tcpPort))}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors disabled:bg-secondary disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {isConnecting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {t('connection.connecting', 'Connecting...')}
                        </>
                    ) : (
                        <>
                            <Power className="w-5 h-5" />
                            {t('connection.connect')}
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default SerialConnector;