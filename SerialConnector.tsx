

import React from 'react';
import { Power, PowerOff, Radio } from './Icons';

interface SerialConnectorProps {
    isConnected: boolean;
    isSimulated: boolean;
    portInfo: any | null;
    onConnect: () => void;
    onDisconnect: () => void;
    isApiSupported: boolean;
    useSimulator: boolean;
    onSimulatorChange: (use: boolean) => void;
}

const SerialConnector: React.FC<SerialConnectorProps> = ({
    isConnected,
    isSimulated,
    portInfo,
    onConnect,
    onDisconnect,
    isApiSupported,
    useSimulator,
    onSimulatorChange
}) => {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="simulator-checkbox"
                    checked={useSimulator}
                    onChange={(e) => onSimulatorChange(e.target.checked)}
                    disabled={isConnected}
                    className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary disabled:opacity-50"
                />
                <label htmlFor="simulator-checkbox" className={`text-sm ${isConnected ? 'text-text-secondary' : ''}`}>
                    Use Simulator
                </label>
            </div>
            {isConnected ? (
                <div className="flex items-center gap-2 text-accent-green">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-medium">{`Connected ${isSimulated ? '(Simulated)' : ''}`}</span>
                    {portInfo && !isSimulated && (
                        <span className="text-xs text-text-secondary">
                            {`(VID: ${portInfo.usbVendorId}, PID: ${portInfo.usbProductId})`}
                        </span>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2 text-accent-yellow">
                    <Radio className="w-5 h-5" />
                    <span className="text-sm font-medium">Disconnected</span>
                </div>
            )}
            {isConnected ? (
                <button
                    onClick={onDisconnect}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background transition-colors"
                >
                    <PowerOff className="w-5 h-5" />
                    Disconnect
                </button>
            ) : (
                <button
                    onClick={onConnect}
                    disabled={!isApiSupported && !useSimulator}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors disabled:bg-secondary disabled:cursor-not-allowed"
                >
                    <Power className="w-5 h-5" />
                    Connect
                </button>
            )}
        </div>
    );
};

export default SerialConnector;