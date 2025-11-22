import React from 'react';
import { PowerOff, RotateCw, RotateCcw, OctagonAlert } from './Icons';
import { MachineState } from '../types';

interface StatusIndicatorProps {
    isConnected: boolean;
    machineState: MachineState | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isConnected, machineState }) => {
    const getStatusIndicatorClass = () => {
        if (!isConnected) return 'bg-accent-yellow/20 text-accent-yellow';
        if (machineState?.status === 'Alarm') return 'bg-accent-red/20 text-accent-red';
        return 'bg-accent-green/20 text-accent-green';
    };

    const statusText = isConnected
        ? (machineState?.status === 'Home' ? 'Homing' : machineState?.status || 'Connected') 
        : 'Disconnected';

    return (
        <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-text-secondary">Status:</span>
            <span className={`px-3 py-1 text-sm rounded-full font-bold ${getStatusIndicatorClass()}`}>{statusText}</span>
        </div>
    );
};

interface SpindleStatusIndicatorProps {
    machineState: MachineState | null;
    isConnected: boolean;
}

const SpindleStatusIndicator: React.FC<SpindleStatusIndicatorProps> = ({ machineState, isConnected }) => {
    if (!isConnected) {
        return (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
                <PowerOff className="w-5 h-5" />
                <span>Spindle Off</span>
            </div>
        );
    }

    const spindleState = machineState?.spindle?.state || 'off';
    const spindleSpeed = machineState?.spindle?.speed || 0;

    if (spindleState === 'off' || spindleSpeed === 0) return (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
            <PowerOff className="w-5 h-5" />
            <span>Spindle Off</span>
        </div>
    );
    
    const icon = spindleState === 'cw' 
        ? <RotateCw className="w-5 h-5 text-accent-green animate-spin-slow" />
        : <RotateCcw className="w-5 h-5 text-accent-green animate-spin-slow-reverse" />;

    return (
        <div className="flex items-center gap-2 text-sm text-text-primary">
            {icon}
            <div className="flex flex-col leading-tight">
                <span className="font-bold">{`${spindleSpeed.toLocaleString()} RPM`}</span>
                <span className="text-xs text-text-secondary">{spindleState === 'cw' ? 'Clockwise' : 'Counter-CW'}</span>
            </div>
        </div>
    );
};

const formatCoordinate = (val: number | undefined | null) => val?.toFixed(3) ?? '0.000';

interface PositionDisplayProps {
    title: string;
    pos: { x: number; y: number; z: number } | null | undefined;
    unit: 'mm' | 'in';
}
const PositionDisplay: React.FC<PositionDisplayProps> = ({ title, pos, unit }) => (
    <div className="flex items-center gap-3">
        <h4 className="text-sm font-bold text-text-secondary">{title}</h4>
        <div className="flex gap-3 text-center font-mono bg-background px-2 py-1 rounded-md text-sm">
            <div><span className="font-bold text-red-400">X </span><span className="text-text-primary">{formatCoordinate(pos?.x)}</span></div>
            <div><span className="font-bold text-green-400">Y </span><span className="text-text-primary">{formatCoordinate(pos?.y)}</span></div>
            <div><span className="font-bold text-blue-400">Z </span><span className="text-text-primary">{formatCoordinate(pos?.z)}</span></div>
            <span className="text-xs text-text-secondary ml-1 self-center">{unit}</span>
        </div>
    </div>
);

interface StatusBarProps {
    isConnected: boolean;
    machineState: MachineState | null;
    unit: 'mm' | 'in';
    onEmergencyStop: () => void;
    flashingButton: string | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ isConnected, machineState, unit, onEmergencyStop, flashingButton }) => (
    <div className="bg-surface/50 border-b border-t border-secondary shadow-sm p-2 flex justify-between items-center z-10 flex-shrink-0 gap-4">
        <div className="flex items-center gap-6">
            <StatusIndicator isConnected={isConnected} machineState={machineState} />
            <div className="h-6 border-l border-secondary" />
            <SpindleStatusIndicator isConnected={isConnected} machineState={machineState} />
        </div>
        <div className="flex items-center gap-6">
            <PositionDisplay title="WPos" pos={machineState?.wpos} unit={unit} />
            <div className="h-6 border-l border-secondary" />
            <PositionDisplay title="MPos" pos={machineState?.mpos} unit={unit} />
        </div>
        <div>
            {isConnected && (
                <button
                    onClick={onEmergencyStop}
                    className={`flex items-center gap-2 px-3 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-all duration-100 animate-pulse ${flashingButton === 'estop' ? 'ring-4 ring-white ring-inset' : ''}`}
                    title="Emergency Stop (Soft Reset) (Hotkey: Esc)"
                >
                    <OctagonAlert className="w-5 h-5" />
                    <span className="hidden md:inline">E-STOP</span>
                </button>
            )}
        </div>
    </div>
);

export default StatusBar;
