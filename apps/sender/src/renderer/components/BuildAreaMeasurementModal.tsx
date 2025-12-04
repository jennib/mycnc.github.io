import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMachineStore } from '@/stores/machineStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { AlertTriangle, Check, ChevronRight, RefreshCw, Ruler, Hand } from '@mycnc/shared';

interface BuildAreaMeasurementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (measurements: { x?: number, y?: number, z?: number }) => void;
}

type Step = 'idle' | 'homing_init' | 'homing_wait' | 'moving_fast' | 'pulling_off' | 'moving_slow' | 'complete' | 'error';

const BuildAreaMeasurementModal: React.FC<BuildAreaMeasurementModalProps> = ({ isOpen, onClose, onApply }) => {
    const [activeAxis, setActiveAxis] = useState<'X' | 'Y' | 'Z' | null>(null);
    const [step, setStep] = useState<Step>('idle');
    const [measurements, setMeasurements] = useState<{ X?: number, Y?: number, Z?: number }>({});
    const [log, setLog] = useState<string[]>([]);

    const { machineState, actions: machineActions } = useMachineStore();
    const { actions: connectionActions } = useConnectionStore();
    const { machineSettings, buildAreaMeasurementDirections: directions, actions: settingsActions } = useSettingsStore();

    // ... (rest of the component logic)

    // ... (inside return statement)


    // Refs for timers
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const watchdogTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const addLog = (message: string) => {
        setLog(prev => [...prev, message]);
    };

    // Helper to send G-code
    const send = useCallback(async (cmd: string) => {
        try {
            await connectionActions.sendLine(cmd);
        } catch (error: any) {
            addLog(`Error sending ${cmd}: ${error.message}`);
        }
    }, [connectionActions]);

    // Polling Logic
    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) return;
        addLog('Starting aggressive status polling...');
        pollingIntervalRef.current = setInterval(() => {
            connectionActions.sendRealtimeCommand('?');
        }, 200); // Poll every 200ms
    }, [connectionActions]);

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            // addLog('Stopped polling.'); // Too verbose
        }
    }, []);

    // Watchdog Logic
    const startWatchdog = useCallback((timeoutMs: number = 30000) => {
        if (watchdogTimeoutRef.current) clearTimeout(watchdogTimeoutRef.current);
        watchdogTimeoutRef.current = setTimeout(() => {
            addLog(`Watchdog timer expired (${timeoutMs}ms). Aborting.`);
            cancelMeasurement();
        }, timeoutMs);
    }, []);

    const stopWatchdog = useCallback(() => {
        if (watchdogTimeoutRef.current) {
            clearTimeout(watchdogTimeoutRef.current);
            watchdogTimeoutRef.current = null;
        }
    }, []);

    // Cleanup on unmount or close
    useEffect(() => {
        return () => {
            stopPolling();
            stopWatchdog();
        };
    }, [stopPolling, stopWatchdog]);

    // Monitor machine state for Alarms
    useEffect(() => {
        if (!activeAxis || step === 'idle' || step === 'complete' || step === 'error') return;

        // Debug log for status changes
        if (machineState?.status) {
            if (machineState.status === 'Alarm') {
                addLog(`Status changed to Alarm! Code: ${machineState.code}`);
                handleAlarm();
            }
        }
    }, [machineState?.status, activeAxis, step]);

    const handleAlarm = async () => {
        stopPolling();
        stopWatchdog();

        if (step === 'moving_fast') {
            addLog(`Hit limit on fast pass. Unlocking...`);
            await connectionActions.sendRealtimeCommand('$X'); // Unlock

            setTimeout(() => {
                setStep('pulling_off');
                pullOff();
            }, 1000);

        } else if (step === 'moving_slow') {
            addLog(`Hit limit on slow pass. Measurement complete.`);
            await connectionActions.sendRealtimeCommand('$X'); // Unlock

            setTimeout(() => {
                recordMeasurement();
            }, 1000);
        }
    };

    const manualTrigger = () => {
        addLog('Manual limit trigger activated by user.');
        handleAlarm();
    };

    const pullOff = () => {
        if (!activeAxis) return;
        addLog('Pulling off 5mm...');
        // Move opposite to direction
        const dir = directions[activeAxis];
        const pullOffDist = dir * -5;
        send(`G91 G0 ${activeAxis}${pullOffDist} F1000`);
        send('G90'); // Back to absolute

        setTimeout(() => {
            setStep('moving_slow');
            startSlowPass();
        }, 2000); // Wait for move to complete
    };

    const startSlowPass = () => {
        if (!activeAxis) return;
        addLog('Starting slow measurement pass...');
        const dir = directions[activeAxis];
        const maxTravel = dir * 2000;

        startPolling();
        startWatchdog(60000); // 60s watchdog for slow pass
        send(`G90 G1 ${activeAxis}${maxTravel} F100`);
    };

    const recordMeasurement = () => {
        if (!activeAxis || !machineState?.wpos) return;

        // The measurement is the current Work Position (assuming we started at 0)
        const pos = machineState.wpos[activeAxis.toLowerCase() as 'x' | 'y' | 'z'];
        const measuredVal = Math.abs(Number(pos)); // Use absolute value just in case

        addLog(`Measured ${activeAxis}: ${measuredVal.toFixed(3)}`);
        setMeasurements(prev => ({ ...prev, [activeAxis]: measuredVal }));
        setStep('idle');
        setActiveAxis(null);
        stopPolling();
        stopWatchdog();

        // Recommend re-homing
        addLog('Measurement done. Please re-home before measuring another axis.');
    };

    const startMeasurement = async (axis: 'X' | 'Y' | 'Z') => {
        setActiveAxis(axis);
        setStep('homing_init');
        setLog([]);
        addLog(`Starting measurement for ${axis} axis.`);
        addLog('Homing machine...');

        try {
            await connectionActions.sendLine('$H', 300000); // 5 minute timeout for homing
            // Wait a bit to ensure state updates if it hasn't already
            setTimeout(() => {
                setStep('homing_wait');
            }, 500);
        } catch (error: any) {
            addLog(`Homing failed: ${error.message}`);
            setStep('error');
            setActiveAxis(null);
        }
    };

    const cancelMeasurement = () => {
        if (!activeAxis) return;
        addLog('Cancelling measurement...');
        stopPolling();
        stopWatchdog();
        // Soft reset to stop immediately (Ctrl-x)
        connectionActions.sendRealtimeCommand(String.fromCharCode(0x18));
        setStep('idle');
        setActiveAxis(null);
        addLog('Measurement cancelled.');
    };

    const toggleDirection = (axis: 'X' | 'Y' | 'Z') => {
        settingsActions.setBuildAreaMeasurementDirections({
            ...directions,
            [axis]: directions[axis] === 1 ? -1 : 1
        });
    };

    // Effect to manage homing sequence
    useEffect(() => {
        if (step === 'homing_wait' && machineState?.status === 'Idle' && activeAxis) {
            // Homing complete (status is back to Idle)
            addLog('Homing complete. Moving to limit...');
            setStep('moving_fast');
            // Move fast to a large coordinate
            const dir = directions[activeAxis];
            const maxTravel = dir * 2000; // Larger than any expected bed size

            startPolling();
            startWatchdog(45000); // 45s watchdog for fast pass
            send(`G90 G1 ${activeAxis}${maxTravel} F2000`);
        }
    }, [machineState?.status, step, activeAxis, send, directions, startPolling, startWatchdog]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-secondary rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-secondary flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Ruler className="w-5 h-5" />
                        Measure Build Area
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-white">✕</button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="bg-secondary/20 p-3 rounded-md mb-4 text-sm text-text-secondary">
                        <p className="font-semibold text-accent-yellow mb-1"><AlertTriangle className="w-4 h-4 inline mr-1" /> Warning</p>
                        This tool will intentionally trigger your limit switches to measure the travel distance.
                        Ensure your machine has limit switches at both ends of the axis you are measuring.
                    </div>

                    <div className="space-y-4">
                        {(['X', 'Y', 'Z'] as const).map((axis) => (
                            <div key={axis} className="flex items-center justify-between p-3 bg-secondary/10 rounded-md border border-secondary/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                        {axis}
                                    </div>
                                    <div>
                                        <div className="font-medium">Measure {axis} Axis</div>
                                        <div className="text-xs text-text-secondary">
                                            {measurements[axis]
                                                ? `Measured: ${measurements[axis]?.toFixed(3)} mm`
                                                : 'Not measured'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Direction</span>
                                        <button
                                            onClick={() => toggleDirection(axis)}
                                            disabled={step !== 'idle' && activeAxis === axis}
                                            className="text-xs bg-secondary hover:bg-secondary-focus px-2 py-1 rounded min-w-[80px] text-center transition-colors"
                                            title="Toggle measurement direction"
                                        >
                                            {directions[axis] === 1 ? 'Positive (+)' : 'Negative (-)'}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => activeAxis === axis ? cancelMeasurement() : startMeasurement(axis)}
                                        disabled={step !== 'idle' && activeAxis !== axis}
                                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors min-w-[90px] ${activeAxis === axis
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-secondary hover:bg-secondary-focus disabled:opacity-50 disabled:cursor-not-allowed'
                                            }`}
                                    >
                                        {activeAxis === axis ? (
                                            <span className="flex items-center gap-2 justify-center">
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Cancel
                                            </span>
                                        ) : (
                                            measurements[axis] ? 'Re-measure' : 'Start'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Manual Trigger Button - Only visible when moving */}
                    {(step === 'moving_fast' || step === 'moving_slow') && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={manualTrigger}
                                className="bg-accent-yellow hover:bg-accent-yellow-focus text-black font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 animate-pulse"
                            >
                                <Hand className="w-5 h-5" />
                                LIMIT HIT (Manual Trigger)
                            </button>
                        </div>
                    )}

                    <div className="mt-4 bg-black/30 rounded-md p-2 h-32 overflow-y-auto font-mono text-xs">
                        {log.map((l, i) => (
                            <div key={i} className="text-text-secondary">{l}</div>
                        ))}
                        {log.length === 0 && <span className="text-text-secondary/50">Ready to start...</span>}
                    </div>
                </div>

                <div className="p-4 border-t border-secondary flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-text-secondary hover:text-white">Close</button>
                    <button
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-focus"
                        onClick={() => {
                            onApply({
                                x: measurements.X,
                                y: measurements.Y,
                                z: measurements.Z
                            });
                            onClose();
                        }}
                    >
                        Apply Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuildAreaMeasurementModal;
