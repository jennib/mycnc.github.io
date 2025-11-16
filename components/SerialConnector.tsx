import React, { useState, useEffect } from 'react';
import { Power, PowerOff, Cpu } from './Icons';
import { PortInfo, ConnectionOptions, SerialPortInfo } from '../types'; // Import PortInfo, ConnectionOptions, and SerialPortInfo

interface SerialConnectorProps {
    isConnected: boolean;
    portInfo: PortInfo | null; // Use the imported PortInfo type
    onConnect: (options: ConnectionOptions) => void;
    onDisconnect: () => void;
    isSimulated: boolean;
    useSimulator: boolean;
    onSimulatorChange: (use: boolean) => void;
    isElectron: boolean; // New prop to indicate Electron environment
}

const SerialConnector: React.FC<SerialConnectorProps> = ({
    isConnected,
    portInfo,
    onConnect,
    onDisconnect,
    isSimulated,
    useSimulator,
    onSimulatorChange,
    isElectron,
}) => {
    const [tcpIp, setTcpIp] = useState('127.0.0.1');
    const [tcpPort, setTcpPort] = useState(23); // Default GRBL port
    const [baudRate, setBaudRate] = useState(115200); // Default baud rate for GRBL
    const [connectionType, setConnectionType] = useState<'usb' | 'tcp'>('usb');
    const [availablePorts, setAvailablePorts] = useState<SerialPortInfo[]>([]);
    const [selectedPortPath, setSelectedPortPath] = useState<string>('');

    useEffect(() => {
        const fetchPorts = async () => {
            if (isElectron && connectionType === 'usb' && !isConnected) {
                try {
                    const ports = await window.electronAPI.requestSerialPort();
                    setAvailablePorts(ports);
                    if (ports.length > 0) {
                        setSelectedPortPath(ports[0].path); // Auto-select the first port
                    }
                } catch (error) {
                    console.error("Failed to list serial ports:", error);
                }
            }
        };
        fetchPorts();
    }, [isElectron, connectionType, isConnected]);

    const handleConnect = () => {
        if (connectionType === 'usb') {
            if (isElectron && selectedPortPath) {
                onConnect({ type: 'usb', path: selectedPortPath, baudRate });
            } else if (!isElectron) {
                // Web Serial API path, which is not currently supported in this flow
                // This case should ideally be handled by the browser's native prompt
                // or a different connection mechanism for web.
                onConnect({ type: 'usb', baudRate });
            } else {
                console.error("No serial port selected.");
            }
        } else {
            onConnect({ type: 'tcp', ip: tcpIp, port: tcpPort });
        }
    };

    const displayPortName = () => {
        if (!portInfo) return 'Not Connected';
        if (portInfo.type === 'usb') {
            return portInfo.manufacturer
                ? `${portInfo.manufacturer} (${portInfo.portName})`
                : portInfo.portName;
        } else if (portInfo.type === 'tcp') {
            return `TCP: ${portInfo.portName}`;
        }
        return 'Unknown Port';
    };

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="simulator-checkbox"
                    checked={useSimulator}
                    onChange={(e) => onSimulatorChange(e.target.checked)}
                    disabled={isConnected}
                    className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                />
                <label htmlFor="simulator-checkbox" className={`text-sm ${isConnected ? 'text-text-secondary' : ''}`}>
                    Use Simulator
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
                        disabled={isConnected}
                        className="h-4 w-4 text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                    />
                    <label htmlFor="usb-connection" className={`text-sm ${isConnected ? 'text-text-secondary' : ''}`}>
                        USB
                    </label>
                    <input
                        type="radio"
                        id="tcp-connection"
                        name="connection-type"
                        value="tcp"
                        checked={connectionType === 'tcp'}
                        onChange={() => setConnectionType('tcp')}
                        disabled={isConnected}
                        className="h-4 w-4 text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50"
                    />
                    <label htmlFor="tcp-connection" className={`text-sm ${isConnected ? 'text-text-secondary' : ''}`}>
                        TCP
                    </label>
                </div>
            )}

            {connectionType === 'usb' && isElectron && !isConnected && (
                <>
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedPortPath}
                            onChange={(e) => setSelectedPortPath(e.target.value)}
                            className="w-48 px-2 py-1 border border-gray-300 rounded-md text-sm bg-background text-text-primary"
                            disabled={isConnected}
                        >
                            {availablePorts.length === 0 ? (
                                <option value="">No ports found</option>
                            ) : (
                                availablePorts.map((port) => (
                                    <option key={port.path} value={port.path}>
                                        {port.manufacturer && port.manufacturer !== 'N/A'
                                            ? `${port.manufacturer} (${port.path})`
                                            : port.path}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Baud Rate"
                            value={baudRate}
                            onChange={(e) => setBaudRate(parseInt(e.target.value))}
                            className="w-28 px-2 py-1 border border-gray-300 rounded-md text-sm bg-background text-text-primary"
                            disabled={isConnected}
                        />
                    </div>
                </>
            )}

            {connectionType === 'tcp' && isElectron && !isConnected && (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="IP Address"
                        value={tcpIp}
                        onChange={(e) => setTcpIp(e.target.value)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm bg-background text-text-primary"
                        disabled={isConnected}
                    />
                    <input
                        type="number"
                        placeholder="Port"
                        value={tcpPort}
                        onChange={(e) => setTcpPort(parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm bg-background text-text-primary"
                        disabled={isConnected}
                    />
                </div>
            )}

            {isConnected ? (
                <button onClick={onDisconnect} className="flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background transition-colors">
                    <PowerOff className="w-5 h-5" />
                    Disconnect
                </button>
            ) : (
                <button onClick={handleConnect} disabled={(!isElectron && connectionType === 'usb' && !useSimulator) || (connectionType === 'tcp' && (!tcpIp || !tcpPort)) || (isElectron && connectionType === 'usb' && availablePorts.length === 0)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors disabled:bg-secondary disabled:cursor-not-allowed">
                    <Power className="w-5 h-5" />
                    Connect
                </button>
            )}
        </div>
    );
};

export default SerialConnector;