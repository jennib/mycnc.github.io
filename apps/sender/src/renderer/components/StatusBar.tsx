import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PowerOff, RotateCw, RotateCcw, OctagonAlert, Camera } from "@mycnc/shared";
import { MachineState } from '@/types';
import { useUIStore } from '@/stores/uiStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useTranslation } from 'react-i18next';

const WCS_OPTIONS = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59'];

interface StatusIndicatorProps {
    isConnected: boolean;
    machineState: MachineState | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isConnected, machineState }) => {
    const { t } = useTranslation();
    const isAlarm = machineState?.status === 'Alarm';

    const getStatusIndicatorClass = () => {
        if (!isConnected) return 'bg-accent-yellow/20 text-accent-yellow';
        if (isAlarm) return 'bg-accent-red/20 text-accent-red';
        return 'bg-accent-green/20 text-accent-green';
    };

    const statusText = isConnected
        ? (isAlarm ? `${t('status.alarm')} ${machineState?.code}` : (machineState?.status === 'Home' ? t('status.homing') : machineState?.status || t('status.connected')))
        : t('status.disconnected');

    return (
        <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-text-secondary">{t('status.label')}</span>
            <span className={`px-3 py-1 text-sm rounded-full font-bold ${getStatusIndicatorClass()}`}>{statusText}</span>
        </div>
    );
};

interface SpindleStatusIndicatorProps {
    machineState: MachineState | null;
    isConnected: boolean;
}

const SpindleStatusIndicator: React.FC<SpindleStatusIndicatorProps> = ({ machineState, isConnected }) => {
    const { t } = useTranslation();
    if (!isConnected) {
        return (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
                <PowerOff className="w-5 h-5" />
                <span>{t('status.spindleOff')}</span>
            </div>
        );
    }

    const spindleState = machineState?.spindle?.state || 'off';
    const spindleSpeed = machineState?.spindle?.speed || 0;

    if (spindleState === 'off' || spindleSpeed === 0) return (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
            <PowerOff className="w-5 h-5" />
            <span>{t('status.spindleOff')}</span>
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
                <span className="text-xs text-text-secondary">{spindleState === 'cw' ? t('status.clockwise') : t('status.counterCw')}</span>
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
const PositionDisplay: React.FC<PositionDisplayProps> = ({ title, pos, unit }) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-3">
            <h4 className="text-sm font-bold text-text-secondary">{t(title === 'WPos' ? 'status.wpos' : 'status.mpos')}</h4>
            <div className="flex gap-4 text-center font-mono bg-background px-2 py-0.5 rounded-md text-lg">
                <div><span className="font-bold text-red-400">X </span><span className="text-text-primary font-bold">{formatCoordinate(pos?.x)}</span></div>
                <div><span className="font-bold text-green-400">Y </span><span className="text-text-primary font-bold">{formatCoordinate(pos?.y)}</span></div>
                <div><span className="font-bold text-blue-400">Z </span><span className="text-text-primary font-bold">{formatCoordinate(pos?.z)}</span></div>
                <span className="text-sm text-text-secondary ml-1 self-center">{unit}</span>
            </div>
        </div>
    );
};

interface StatusBarProps {
    isConnected: boolean;
    machineState: MachineState | null;
    unit: 'mm' | 'in';
}

const StatusBar: React.FC<StatusBarProps> = memo(({ isConnected, machineState, unit }) => {
    const { t } = useTranslation();
    const { isWebcamPeekOpen, actions: { toggleWebcamPeek } } = useUIStore();
    const { actions: connectionActions } = useConnectionStore();

    const handleWCSChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newWCS = e.target.value;
        connectionActions.sendLine(newWCS);
    };

    return (
        <div className="bg-surface/80 backdrop-blur-md border-t border-white/20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] py-1 px-2 flex justify-center items-center z-20 flex-shrink-0 gap-4 text-sm">
            <div className="flex items-center gap-4">
                <StatusIndicator isConnected={isConnected} machineState={machineState} />
                <div className="h-4 border-l border-white/20" />
                <SpindleStatusIndicator isConnected={isConnected} machineState={machineState} />
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-secondary">{t('status.wcs')}</span>
                    <select
                        value={machineState?.wcs || 'G54'}
                        onChange={handleWCSChange}
                        disabled={!isConnected || machineState?.status !== 'Idle'}
                        className="bg-background border border-white/10 rounded px-2 py-0.5 text-text-primary font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        title="Select Work Coordinate System"
                    >
                        {WCS_OPTIONS.map(wcs => (
                            <option key={wcs} value={wcs}>{wcs}</option>
                        ))}
                    </select>
                </div>
                <PositionDisplay title="WPos" pos={machineState?.wpos} unit={unit} />
                <div className="h-4 border-l border-white/20" />
                <PositionDisplay title="MPos" pos={machineState?.mpos} unit={unit} />
            </div>
            <div className="absolute right-4 flex items-center">
                <button
                    onClick={toggleWebcamPeek}
                    className={`p-1.5 rounded-md transition-colors ${isWebcamPeekOpen ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                    title="Toggle Webcam Peek"
                >
                    <Camera className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
});

export default StatusBar;
