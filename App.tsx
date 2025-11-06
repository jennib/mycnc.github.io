import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SerialManager } from './services/serialService';
import { SimulatedSerialManager } from './services/simulatedSerialService';
// FIX: Import MachineState type to correctly type component state.
import { completionSound } from './sounds';
import { JobStatus, MachineState, Log, Tool, Macro, MachineSettings, GeneratorSettings } from './types';
import SerialConnector from './components/SerialConnector';
import GCodePanel from './components/GCodePanel';
import Console from './components/Console';
import JogPanel from './components/JogPanel';
import MacrosPanel from './components/MacrosPanel';
import WebcamPanel from './components/WebcamPanel';
import PreflightChecklistModal from './components/PreflightChecklistModal';
import WelcomeModal from './components/WelcomeModal';
import MacroEditorModal from './components/MacroEditorModal';
import SettingsModal from './components/SettingsModal';
import ToolLibraryModal from './components/ToolLibraryModal';
import { NotificationContainer } from './components/Notification';
import ThemeToggle from './components/ThemeToggle';
import StatusBar from './components/StatusBar';
import { AlertTriangle, OctagonAlert, Unlock, Settings, Maximize, Minimize, BookOpen } from './components/Icons';
import { estimateGCodeTime } from './services/gcodeTimeEstimator.js';
import { analyzeGCode } from './services/gcodeAnalyzer.js';
import { Analytics } from '@vercel/analytics/react';
import GCodeGeneratorModal from './components/GCodeGeneratorModal';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import ErrorBoundary from './ErrorBoundary';
import UnsupportedBrowser from './components/UnsupportedBrowser';
import { GRBL_ALARM_CODES, GRBL_ERROR_CODES, DEFAULT_MACROS, DEFAULT_SETTINGS, DEFAULT_TOOLS, DEFAULT_GENERATOR_SETTINGS } from './constants';
import { useLocalStorage } from './components/useLocalStorage';

// FIX: Properly type the usePrevious hook to be generic and type-safe.
const usePrevious = <T,>(value: T): T | undefined => {
    const ref = useRef<T | undefined>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

const buildTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);


const App: React.FC = () => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isSimulatedConnection, setIsSimulatedConnection] = useState(false);
    const [portInfo, setPortInfo] = useState(null);
    const [gcodeLines, setGcodeLines] = useState<string[]>([]);
    const [fileName, setFileName] = useState('');
    const [jobStatus, setJobStatus] = useState(JobStatus.Idle);
    const [progress, setProgress] = useState<number>(0);
    const [consoleLogs, setConsoleLogs] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSerialApiSupported, setIsSerialApiSupported] = useState(true);
    const [useSimulator, setUseSimulator] = useState(false);
    const [machineState, setMachineState] = useState<MachineState | null>(null);
    const [isJogging, setIsJogging] = useState(false);
    const [flashingButton, setFlashingButton] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);
    const [timeEstimate, setTimeEstimate] = useState({ totalSeconds: 0, cumulativeSeconds: [] as number[] });

    const [isPreflightModalOpen, setIsPreflightModalOpen] = useState(false);
    const [jobStartOptions, setJobStartOptions] = useState({ startLine: 0, isDryRun: false });
    const [isHomedSinceConnect, setIsHomedSinceConnect] = useState(false);
    const [isMacroRunning, setIsMacroRunning] = useState(false);
    const [preflightWarnings, setPreflightWarnings] = useState<any[]>([]);
    const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState(false);


    // Macro Editing State
    const [isMacroEditorOpen, setIsMacroEditorOpen] = useState(false);
    const [editingMacroIndex, setEditingMacroIndex] = useState<number | null>(null);
    const [isMacroEditMode, setIsMacroEditMode] = useState(false);

    // Advanced Features State
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isToolLibraryModalOpen, setIsToolLibraryModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isGCodeModalOpen, setIsGCodeModalOpen] = useState(false);
    const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
    const [isVerbose, setIsVerbose] = useState(false);

    const [returnToWelcome, setReturnToWelcome] = useState(false);

    // Persisted State
    const [jogStep, setJogStep] = useLocalStorage<number>('cnc-app-jogstep', 1);
    const [unit, setUnit] = useLocalStorage<'mm' | 'in'>('cnc-app-unit', 'mm');
    const [isLightMode, setIsLightMode] = useLocalStorage<boolean>('cnc-app-theme', false);
    const [macros, setMacros] = useLocalStorage<Macro[]>('cnc-app-macros', DEFAULT_MACROS);
    const [machineSettings, setMachineSettings] = useLocalStorage<MachineSettings>('cnc-app-settings', DEFAULT_SETTINGS);
    const [toolLibrary, setToolLibrary] = useLocalStorage<Tool[]>('cnc-app-tool-library', []);
    const [generatorSettings, setGeneratorSettings] = useLocalStorage<GeneratorSettings>('cnc-app-generator-settings', DEFAULT_GENERATOR_SETTINGS);


    const serialManagerRef = useRef<any>(null);
    const prevState = usePrevious(machineState);
    const jobStatusRef = useRef(jobStatus);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    
    // Use a ref for isVerbose to ensure callbacks always have the latest value.
    const isVerboseRef = useRef(isVerbose);
    useEffect(() => {
        isVerboseRef.current = isVerbose;
    }, [isVerbose]);

    useEffect(() => {
        jobStatusRef.current = jobStatus;
    }, [jobStatus]);

    useEffect(() => { // This one remains as it affects the document class
        document.documentElement.classList.toggle('light-mode', isLightMode);
    }, [isLightMode]);
    
    // This effect runs once on startup to validate the saved generator settings.
    // It ensures that any saved toolId still exists in the tool library.
    useEffect(() => {
        const toolIds = new Set(toolLibrary.map(t => t.id));
        const validatedSettings = { ...generatorSettings };
        let hasChanges = false;

        for (const key in validatedSettings) {
            const opSettings = validatedSettings[key];
            if (opSettings.toolId !== null && !toolIds.has(opSettings.toolId)) {
                opSettings.toolId = null;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            setGeneratorSettings(validatedSettings);
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    useEffect(() => {
        // We are no longer jogging if the machine reports back that it is idle or has an alarm.
        if (machineState?.status === 'Idle' || machineState?.status === 'Alarm') {
            setIsJogging(false);
        }
    }, [machineState?.status]);

    // Auto-select tool if only one exists in the library
    useEffect(() => {
        if (toolLibrary.length === 1 && selectedToolId === null) {
            setSelectedToolId(toolLibrary[0].id);
        }
    }, [toolLibrary, selectedToolId]);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => {
            const notificationToRemove = prev.find(n => n.id === id);
            if (notificationToRemove && notificationToRemove.timerId) {
                clearTimeout(notificationToRemove.timerId);
            }
            return prev.filter(n => n.id !== id);
        });
    }, []);

    const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', duration = 10000) => {
        const id = Date.now() + Math.random();
        const timerId = window.setTimeout(() => {
            removeNotification(id);
        }, duration);
        setNotifications(prev => [...prev, { id, message, type, timerId }]);
    }, [removeNotification]);

    useEffect(() => {
        const AudioContext = window.AudioContext;
        if (!AudioContext) {
            console.error("AudioContext not supported by this browser.");
            return;
        }
        const context = new AudioContext();
        audioContextRef.current = context;

        // Decode the base64 sound data.
        try {
            const base64Data = completionSound.split(',')[1];
            const binaryString = window.atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            context.decodeAudioData(bytes.buffer).then(decodedData => {
                audioBufferRef.current = decodedData;
            }).catch(error => {
                console.error("Failed to decode completion sound:", error);
                addNotification('Could not load notification sound.', 'error');
            });
        } catch (error) {
            console.error("Failed to process completion sound:", error);
            addNotification('Could not load notification sound.', 'error');
        }

        const unlockAudio = () => {
            if (context.state === 'suspended') {
                context.resume().then(() => {
                    setIsAudioUnlocked(true);
                    // Clean up listeners once the context is unlocked.
                    document.removeEventListener('click', unlockAudio);
                    document.removeEventListener('keydown', unlockAudio);
                });
            } else {
                // If it's already running, we can just clean up.
                setIsAudioUnlocked(true);
                document.removeEventListener('click', unlockAudio);
                document.removeEventListener('keydown', unlockAudio);
            }
        };

        // Browsers require a user gesture to start AudioContext.
        // We listen for the first click or keydown anywhere.
        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);

        return () => {
            // Cleanup on unmount
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
            context.close();
        };
    }, [addNotification]);
    
    useEffect(() => {
        // The setup is complete if the user has saved their settings at least once.
        const isMachineSetupComplete = !!machineSettings.isConfigured;
        const isToolLibrarySetupComplete = toolLibrary.length > 0;
        const hasSeenWelcome = localStorage.getItem('cnc-app-seen-welcome');
        
        // Show welcome modal if setup is incomplete and it hasn't been permanently dismissed.
        if (hasSeenWelcome !== 'true' && (!isMachineSetupComplete || !isToolLibrarySetupComplete)) {
            setIsWelcomeModalOpen(true);
        }
    }, []); // Run only once on initial mount

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const playCompletionSound = useCallback(() => {
        const audioContext = audioContextRef.current;
        const audioBuffer = audioBufferRef.current;

        if (audioBuffer && audioContext && audioContext.state === 'running') {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
        } else {
            console.warn("Could not play sound: AudioContext not running or sound buffer not loaded.");
        }
    }, []);

    const addLog = useCallback((log: { type: string, message: string }) => {
        let processedLog = { ...log, timestamp: new Date() };

        // Filter out periodic GRBL status reports unless in verbose mode.
        // These start with '<' and end with '>'. They are handled by the onStatus callback.

        // Add explanation for GRBL errors, preserving the original message context.
        if (processedLog.type === 'error' && processedLog.message.includes('error:')) {
            const codeMatch = processedLog.message.match(/error:(\d+)/);
            if (codeMatch && codeMatch[1]) {
                const code = parseInt(codeMatch[1], 10);
                const explanation = GRBL_ERROR_CODES[code];
                if (explanation) {
                    processedLog.message = `${processedLog.message} (${explanation})`;
                }
            }
        }

        setConsoleLogs(prev => {
            const trimmedMessage = processedLog.message.trim().toLowerCase();

            // Consolidate repeated 'ok' messages to prevent console spam, unless in verbose mode.
            if (!isVerboseRef.current && processedLog.type === 'received' && trimmedMessage === 'ok') {
                const lastLog = prev.length > 0 ? prev[prev.length - 1] : null;
                if (lastLog && lastLog.type === 'received' && /^ok\.*$/.test(lastLog.message) && lastLog.message.length < 60) {
                    const newLogs = [...prev];
                    newLogs[newLogs.length - 1] = { ...lastLog, message: lastLog.message + '.' };
                    return newLogs;
                }
            }
            
            // For any other message, or the first 'ok' in a sequence, or if verbose.
            return [...prev, processedLog].slice(-200); // Keep last 200 logs
        });
    }, []);
    
    useEffect(() => {
        // This effect handles the "Homing complete" notification.
        if (prevState?.status === 'Home' && machineState?.status === 'Idle') {
            addNotification('Homing complete.', 'success');
            setIsHomedSinceConnect(true);
        }
    }, [machineState, prevState, addNotification]);
    
    useEffect(() => {
        if (machineState?.status === 'Alarm' && (jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused)) {
            setJobStatus(JobStatus.Stopped);
            setProgress(0);
            const alarmInfo = GRBL_ALARM_CODES[machineState.code!] || GRBL_ALARM_CODES.default;
            addLog({ 
                type: 'error', 
                message: `Job aborted due to Alarm ${machineState.code}: ${alarmInfo.name}.`
            });
        }
    }, [machineState, jobStatus, addLog]);

    useEffect(() => {
        if ('serial' in navigator) {
            setIsSerialApiSupported(true);
        } else {
            setIsSerialApiSupported(false);
            setError("Web Serial API is not supported by your browser. Please use a compatible browser like Chrome, Edge, or enable it in Firefox (dom.w3c_serial.enabled).");
        }
    }, []);

    const handleConnect = useCallback(async (): Promise<void> => {
        if (!isSerialApiSupported && !useSimulator) return;

        const commonCallbacks = {
            onConnect: async (info: any) => {
                setIsConnected(true);
                setPortInfo(info);
                addLog({ type: 'status', message: `Connected to ${useSimulator ? 'simulator' : 'port'} at 115200 baud.` });
                setError(null);
                setIsSimulatedConnection(useSimulator);
                setIsHomedSinceConnect(false); // Reset homing status on new connection
                
                // Run startup script
                if (machineSettings.scripts.startup && serialManagerRef.current) {
                    addLog({ type: 'status', message: 'Running startup script...' });
                    const startupCommands = machineSettings.scripts.startup.split('\n').filter(cmd => cmd.trim() !== '');
                    for (const command of startupCommands) {
                        await serialManagerRef.current.sendLineAndWaitForOk(command);
                    }
                }
            },
            onDisconnect: () => {
                setIsConnected(false);
                setPortInfo(null);
                setJobStatus(JobStatus.Idle);
                setProgress(0);
                setMachineState(null);
                addLog({ type: 'status', message: 'Disconnected.' });
                serialManagerRef.current = null;
                setIsSimulatedConnection(false);
                setIsHomedSinceConnect(false);
            },
            onLog: addLog,
            onProgress: (p: { percentage: number }) => {
                setProgress(p.percentage);
                if (p.percentage >= 100 && jobStatusRef.current !== JobStatus.Complete) {
                    setJobStatus(JobStatus.Complete);
                    addLog({type: 'status', message: 'Job complete!'});
                    addNotification('Job complete!', 'success');
                    playCompletionSound();
                }
            },
            onError: (message: string) => {
                setError(message);
                addLog({ type: 'error', message });
            },
            onStatus: (status: MachineState, rawStatus?: string) => {
                setMachineState(status);
                if (isVerboseRef.current && rawStatus && rawStatus.startsWith('<')) {
                    addLog({ type: 'received', message: rawStatus });
                }
            },
        };

        try {
            const manager = useSimulator
                ? new SimulatedSerialManager(commonCallbacks)
                : new SerialManager(commonCallbacks);
            serialManagerRef.current = manager; // Set ref before connect to use in onConnect
            await manager.connect(115200);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to connect: ${errorMessage}`);
            addLog({ type: 'error', message: `Failed to connect: ${errorMessage}` });
        }
    }, [addLog, isSerialApiSupported, useSimulator, addNotification, playCompletionSound, machineSettings.scripts.startup, isVerboseRef]);

    const handleDisconnect = useCallback(async (): Promise<void> => {
        if (jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused) {
            if (!window.confirm("A job is currently running or paused. Are you sure you want to disconnect? This will stop the job.")) {
                return; // User cancelled the disconnect
            }
        }
        
        // Run shutdown script before disconnecting
        if (isConnected && machineSettings.scripts.shutdown && serialManagerRef.current) {
            addLog({ type: 'status', message: 'Running shutdown script...' });
            const shutdownCommands = machineSettings.scripts.shutdown.split('\n').filter(cmd => cmd.trim() !== '');
            for (const command of shutdownCommands) {
                await serialManagerRef.current.sendLineAndWaitForOk(command);
            }
        }

        await serialManagerRef.current?.disconnect();

        // If we were in a simulated connection, uncheck the simulator box.
        if (isSimulatedConnection) {
            setUseSimulator(false);
        }
    }, [jobStatus, isConnected, isSimulatedConnection, machineSettings.scripts.shutdown, addLog, setUseSimulator]);

    const handleFileLoad = (content: string, name: string): void => {
        // More robustly clean and filter g-code lines
        const lines = content.split('\n')
            .map(l => l.replace(/\(.*\)/g, '')) // Remove parenthetical comments
            .map(l => l.split(';')[0]) // Remove semicolon comments
            .map(l => l.trim())
            .filter(l => l && l !== '%'); // Filter empty lines and program start/end markers

        setGcodeLines(lines);
        setFileName(name);
        setProgress(0);
        setJobStatus(JobStatus.Idle);
        setSelectedToolId(toolLibrary.length === 1 ? toolLibrary[0].id : null);
        setTimeEstimate(estimateGCodeTime(lines));
        addLog({ type: 'status', message: `Loaded ${name} (${lines.length} lines).` });
    };

    const handleGCodeChange = (content: string): void => {
        const lines = content.split('\n')
            .map(l => l.replace(/\(.*\)/g, ''))
            .map(l => l.split(';')[0])
            .map(l => l.trim())
            .filter(l => l && l !== '%');

        setGcodeLines(lines);
        if (fileName && !fileName.endsWith(' (edited)')) {
            setFileName(`${fileName} (edited)`);
        } else if (!fileName) {
            setFileName('untitled.gcode (edited)');
        }
        setProgress(0);
        setJobStatus(JobStatus.Idle);
        setTimeEstimate(estimateGCodeTime(lines));
        addLog({ type: 'status', message: `G-code modified (${lines.length} lines).` });
    };

    const handleClearFile = useCallback(() => {
        setGcodeLines([]);
        setFileName('');
        setProgress(0);
        setJobStatus(JobStatus.Idle);
        setSelectedToolId(toolLibrary.length === 1 ? toolLibrary[0].id : null);
        setTimeEstimate({ totalSeconds: 0, cumulativeSeconds: [] });
        addLog({ type: 'status', message: 'G-code file cleared.' });
    }, [addLog, toolLibrary]);

    const handleLoadGeneratedGCode = useCallback((gcode: string, name: string): void => {
        handleFileLoad(gcode, name);
        setIsGCodeModalOpen(false);
    }, [handleFileLoad]);

    const handleStartJobConfirmed = useCallback((options: { isDryRun: boolean }): void => {
        const manager = serialManagerRef.current;
        if (!manager || !isConnected || gcodeLines.length === 0) return;

        setIsPreflightModalOpen(false);
        setJobStatus(JobStatus.Running);
        manager.sendGCode(gcodeLines, {
            startLine: jobStartOptions.startLine,
            isDryRun: options.isDryRun
        });
    }, [isConnected, gcodeLines, jobStartOptions]);

    const handleJobControl = useCallback(async (action: 'start' | 'pause' | 'resume' | 'stop' | 'gracefulStop', options?: { startLine?: number }): Promise<void> => {
        const manager = serialManagerRef.current;
        if (!manager || !isConnected) return;

        switch (action) {
            case 'start':
                if (gcodeLines.length > 0) {
                    const warnings = analyzeGCode(gcodeLines, machineSettings);
                    setPreflightWarnings(warnings);
                    setJobStartOptions({ startLine: options?.startLine ?? 0, isDryRun: false });
                    setIsPreflightModalOpen(true);
                }
                break;
            case 'pause':
                if (jobStatusRef.current === JobStatus.Running) {
                    await manager.pause();
                    setJobStatus(JobStatus.Paused);
                }
                break;
            case 'resume':
                if (jobStatusRef.current === JobStatus.Paused) {
                    await manager.resume();
                    setJobStatus(JobStatus.Running);
                }
                break;
            case 'stop':
                setJobStatus(currentStatus => {
                    if (currentStatus === JobStatus.Running || currentStatus === JobStatus.Paused) {
                        manager.stopJob();
                        setProgress(0);
                        return JobStatus.Stopped;
                    }
                    return currentStatus;
                });
                break;
            case 'gracefulStop':
                setJobStatus(currentStatus => {
                    if (currentStatus === JobStatus.Running || currentStatus === JobStatus.Paused) {
                        manager.gracefulStop();
                        setProgress(0);
                        return JobStatus.Stopped;
                    }
                    return currentStatus;
                });
                break;
        }
    }, [isConnected, gcodeLines, machineSettings, handleStartJobConfirmed]);
    
    const handleManualCommand = useCallback((command: string): void => {
        serialManagerRef.current?.sendLine(command);
    }, []);

    const handleJog = (axis: string, direction: number, step: number): void => {
        if (!serialManagerRef.current) return;

        if (axis === 'Z' && unit === 'mm' && step > 10) {
            addLog({ type: 'error', message: 'Z-axis jog step cannot exceed 10mm.' });
            return;
        }
        if (axis === 'Z' && unit === 'in' && step > 1) {
            addLog({ type: 'error', message: 'Z-axis jog step cannot exceed 1in.' });
            return;
        }

        const feedRate = 1000;
        const command = `$J=G91 ${axis}${step * direction} F${feedRate}`;
        
        setIsJogging(true); 
        serialManagerRef.current.sendLineAndWaitForOk(command).catch((err: Error) => {
            const errorMessage = err instanceof Error ? err.message : "An error occurred during jog.";
            if (!errorMessage.includes('Cannot send new line')) {
                addLog({ type: 'error', message: `Jog failed: ${errorMessage}` });
            }
            setIsJogging(false);
        });
    };

    const flashControl = useCallback((buttonId: string): void => {
        setFlashingButton(buttonId);
        setTimeout(() => {
            setFlashingButton(null);
        }, 200);
    }, []);
    
    const handleEmergencyStop = useCallback((): void => {
        serialManagerRef.current?.emergencyStop();
        setJobStatus(JobStatus.Stopped);
        setProgress(0);
        addLog({type: 'error', message: 'EMERGENCY STOP TRIGGERED (Soft Reset)'});
    }, [addLog]);

    const handleSpindleCommand = useCallback((command: 'cw' | 'ccw' | 'off', speed: number): void => {
        const manager = serialManagerRef.current;
        if (!manager || !isConnected) return;

        let gcode = '';
        switch (command) {
            case 'cw':
                gcode = `M3 S${speed}`;
                break;
            case 'ccw':
                gcode = `M4 S${speed}`;
                break;
            case 'off':
                gcode = 'M5';
                break;
            default:
                return;
        }

        manager.sendLine(gcode);
    }, [isConnected]);
    
    const handleFeedOverride = useCallback((command: 'reset' | 'inc10' | 'dec10' | 'inc1' | 'dec1'): void => {
        const manager = serialManagerRef.current;
        if (!manager) return;

        const commandMap = {
            'reset': '\x90', // Set to 100%
            'inc10': '\x91', // Increase 10%
            'dec10': '\x92', // Decrease 10%
            'inc1': '\x93',  // Increase 1%
            'dec1': '\x94',  // Decrease 1%
        };

        if (commandMap[command]) {
            manager.sendRealtimeCommand(commandMap[command]);
        }
    }, []);

    const isAlarm = machineState?.status === 'Alarm';

    const handleUnitChange = useCallback((newUnit: 'mm' | 'in'): void => {
        if (newUnit === unit || !serialManagerRef.current) return;

        const command = newUnit === 'mm' ? 'G21' : 'G20';
        serialManagerRef.current.sendLine(command);
        setUnit(newUnit);
        addLog({ type: 'status', message: `Units set to ${newUnit === 'mm' ? 'millimeters' : 'inches'}.` });
        
        // Reset jog step to a sensible default for the new unit
        setJogStep(newUnit === 'mm' ? 1 : 0.1);

    }, [unit, addLog]);

    const handleProbe = useCallback(async (axes: string): Promise<void> => {
        const manager = serialManagerRef.current;
        if (!manager || !isConnected) {
            addLog({ type: 'error', message: 'Cannot probe while disconnected.' });
            return;
        }
        
        const offsets = {
            x: machineSettings.probe.xOffset,
            y: machineSettings.probe.yOffset,
            z: machineSettings.probe.zOffset,
        };
    
        const probeTravel = unit === 'mm' ? -25 : -1.0;
        const probeFeed = machineSettings.probe.feedRate || 25;
        const retractDist = unit === 'mm' ? -5 : -0.2;
    
        addLog({ type: 'status', message: `Starting ${axes.toUpperCase()}-Probe cycle...` });
    
        try {
            const probeAxis = async (axis: string, offset: number, travelDir = -1) => {
                const travel = probeTravel * travelDir;
                await manager.sendLineAndWaitForOk(`G38.2 ${axis}${travel.toFixed(4)} F${probeFeed}`);
                addLog({ type: 'status', message: `Probe contact detected on ${axis}.` });
                await manager.sendLineAndWaitForOk(`G10 L20 P1 ${axis}${offset}`);
                addLog({ type: 'status', message: `${axis}-axis zero set to ${offset}${unit}.` });
                await manager.sendLineAndWaitForOk('G91');
                await manager.sendLineAndWaitForOk(`G0 ${axis}${retractDist * -travelDir}`);
                await manager.sendLineAndWaitForOk('G90');
            };

            if (axes.includes('X') && offsets.x !== undefined) {
                await probeAxis('X', offsets.x, -1);
            }
            if (axes.includes('Y') && offsets.y !== undefined) {
                await probeAxis('Y', offsets.y, -1);
            }
            if (axes.includes('Z') && offsets.z !== undefined) {
                await probeAxis('Z', offsets.z, 1);
            }
    
            addLog({ type: 'status', message: 'Probe cycle complete.' });
            addNotification(`${axes.toUpperCase()}-Probe cycle complete.`, 'success');
    
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            addLog({ type: 'error', message: `Probe cycle failed: ${errorMessage}` });
            setError(`Probe cycle failed: ${errorMessage}`);
            // It's good practice to send a soft-reset to clear any alarm state from a failed probe
            manager.sendLine('\x18', false);
        }
    
    }, [isConnected, addLog, addNotification, unit, setError, machineSettings.probe]);

    const handleTrySimulator = useCallback((): void => {
        setMachineSettings({ ...DEFAULT_SETTINGS, isConfigured: true });
        setToolLibrary(DEFAULT_TOOLS);
        setUseSimulator(true);
        setIsWelcomeModalOpen(false);
        localStorage.setItem('cnc-app-seen-welcome', 'true');
        // The connection will be triggered by the useEffect that watches useSimulator
    }, [setMachineSettings, setToolLibrary, setUseSimulator, setIsWelcomeModalOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (!isConnected) return;
            if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                return;
            }

            let handled = true;
            switch (e.key.toLowerCase()) {
                // Jogging
                case 'arrowup':
                    handleJog('Y', 1, jogStep);
                    flashControl('jog-y-plus');
                    break;
                case 'arrowdown':
                    handleJog('Y', -1, jogStep);
                    flashControl('jog-y-minus');
                    break;
                case 'arrowleft':
                    handleJog('X', -1, jogStep);
                    flashControl('jog-x-minus');
                    break;
                case 'arrowright':
                    handleJog('X', 1, jogStep);
                    flashControl('jog-x-plus');
                    break;
                case 'pageup':
                    handleJog('Z', 1, jogStep);
                    flashControl('jog-z-plus');
                    break;
                case 'pagedown':
                    handleJog('Z', -1, jogStep);
                    flashControl('jog-z-minus');
                    break;
                
                // E-Stop
                case 'escape':
                    handleEmergencyStop();
                    flashControl('estop');
                    break;

                // Unlock
                case 'x':
                    if (isAlarm) {
                        handleManualCommand('$X');
                        flashControl('unlock-button');
                    } else {
                        handled = false;
                    }
                    break;

                // Step Size
                case '1': case '2': case '3': case '4': case '5':
                    const stepSizes = unit === 'mm' ? [0.01, 0.1, 1, 10, 50] : [0.001, 0.01, 0.1, 1, 2];
                    const stepIndex = parseInt(e.key) - 1;
                    if (stepIndex < stepSizes.length) {
                        const newStep = stepSizes[stepIndex];
                        setJogStep(newStep);
                        flashControl(`step-${newStep}`);
                    }
                    break;

                default:
                    handled = false;
                    break;
            }

            if (handled) {
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isConnected, jogStep, handleJog, flashControl, handleEmergencyStop, isAlarm, handleManualCommand, unit]);

    const handleHome = useCallback((axes: 'all' | 'x' | 'y' | 'z' | 'xy'): void => {
        const manager = serialManagerRef.current;
        if (!manager) return;

        // Optimistically set the machine state to 'Home' to immediately lock the UI.
        // The regular status polling will then take over to keep the state in sync.
        setMachineState(prev => {
            const newPrev = prev || {
                status: 'Idle', code: null, wpos: { x: 0, y: 0, z: 0 }, mpos: { x: 0, y: 0, z: 0 },
                spindle: { state: 'off', speed: 0 }, ov: [100, 100, 100]
            };
            return { ...newPrev, status: 'Home' };
        });

        addLog({ type: 'status', message: `Starting homing cycle for: ${axes.toUpperCase()}...` });

        const commandMap = {
            all: ['$H'],
            x: ['$HX'],
            y: ['$HY'],
            z: ['$HZ'],
            xy: ['$HXY']
        };

        const commands = commandMap[axes];
        if (!commands) {
            addLog({ type: 'error', message: `Unknown homing command: ${axes}` });
            return;
        }

        for (const cmd of commands) {
            // Homing is a long process. We send the command and rely on status updates 
            // to manage the UI state, rather than waiting for an 'ok' that comes back immediately.
            manager.sendLine(cmd);
        }
    }, [addLog]);

    const handleSetZero = useCallback((axes: 'all' | 'x' | 'y' | 'z' | 'xy'): void => {
        let command = 'G10 L20 P1';
        switch (axes) {
            case 'all': command += ' X0 Y0 Z0'; break;
            case 'x':   command += ' X0'; break;
            case 'y':   command += ' Y0'; break;
            case 'z':   command += ' Z0'; break;
            case 'xy':  command += ' X0 Y0'; break;
        }
        serialManagerRef.current?.sendLine(command);
        addLog({type: 'status', message: `Work coordinate origin set for ${axes.toUpperCase()}.`});
    }, [addLog]);

    const handleRunMacro = useCallback(async (commands: string[]): Promise<void> => {
        const manager = serialManagerRef.current;
        if (!manager) return;

        // Replace placeholders in commands
        const processedCommands = commands.map(cmd => 
            cmd.replace(/{unit}/g, unit)
               .replace(/{safe_z}/g, unit === 'mm' ? '10' : '0.4')
        );

        setIsMacroRunning(true);
        addLog({ type: 'status', message: `Running macro: ${processedCommands.join('; ')}` });
        try {
            for (const command of processedCommands) {
                await manager.sendLineAndWaitForOk(command);
            }
            addLog({ type: 'status', message: 'Macro finished.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            addLog({ type: 'error', message: `Macro failed: ${errorMessage}` });
            setError(`Macro failed: ${errorMessage}`);
        } finally {
            setIsMacroRunning(false);
        }
    }, [addLog, unit, setError]);

    // --- Macro Editor Handlers ---
    const handleOpenMacroEditor = useCallback((index: number | null): void => {
        setEditingMacroIndex(index);
        setIsMacroEditorOpen(true);
    }, []);

    const handleCloseMacroEditor = useCallback((): void => {
        setIsMacroEditorOpen(false);
        setEditingMacroIndex(null);
    }, []);

    const handleSaveMacro = useCallback((macro: any, index: number | null) => {
        setMacros(prevMacros => {
            const newMacros = [...prevMacros];
            if (index !== null && index >= 0) {
                // Editing existing macro
                newMacros[index] = macro;
            } else {
                // Adding new macro
                newMacros.push(macro);
            }
            return newMacros;
        });
        addNotification('Macro saved!', 'success');
    }, [addNotification]);
    
    const handleDeleteMacro = useCallback((index: number): void => {
        setMacros(prevMacros => prevMacros.filter((_, i) => i !== index));
        addNotification('Macro deleted!', 'success');
    }, [addNotification]);

    const handleExportSettings = useCallback((): void => {
        const settingsToExport = {
            machineSettings,
            macros,
            toolLibrary,
            generatorSettings,
        };
        const a = document.createElement('a');
        const url = URL.createObjectURL(new Blob([JSON.stringify(settingsToExport, null, 2)], { type: 'application/json' }));
        a.href = url;
        a.download = `mycnc-app-settings-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addNotification('Settings exported successfully!', 'success');
    }, [machineSettings, macros, toolLibrary, generatorSettings, addNotification]);

    const handleImportSettings = useCallback((imported: any): void => {
        if (!window.confirm("This will overwrite your current macros, settings, tool library, and generator settings. Are you sure?")) {
            return;
        }
        if (imported.machineSettings && !imported.machineSettings.probe) {
            imported.machineSettings.probe = DEFAULT_SETTINGS.probe;
        }
        if (imported.machineSettings && imported.macros && imported.toolLibrary) {
            setMachineSettings(imported.machineSettings);
            setMacros(imported.macros);
            setToolLibrary(imported.toolLibrary);
            if (imported.generatorSettings) {
                setGeneratorSettings(imported.generatorSettings);
            }
            addNotification("Settings imported successfully!", 'success');
        }
    }, [addNotification, setMachineSettings, setMacros, setToolLibrary, setGeneratorSettings]);
    
    const handleToggleFullscreen = (): void => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (!isSerialApiSupported || isMobile) {
        return <UnsupportedBrowser />;
    }

    const alarmInfo = isAlarm ? (GRBL_ALARM_CODES[machineState!.code!] || GRBL_ALARM_CODES.default) : null;
    const isJobActive = jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused;

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent): string | void => {
            if (isJobActive) {
                event.preventDefault();
                event.returnValue = ''; // Required for Chrome
                return ''; // For other browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isJobActive]);


    const isAnyControlLocked = !isConnected || isJobActive || isJogging || isMacroRunning || (machineState?.status && ['Alarm', 'Home'].includes(machineState.status));
    const selectedTool = toolLibrary.find((t: Tool) => t.id === selectedToolId) || null;

    // Effect to auto-connect when simulator mode is chosen from welcome modal
    useEffect(() => {
        if (useSimulator && !isConnected) {
            handleConnect();
        }
    }, [useSimulator, isConnected, handleConnect]);


    return (
        <div className="min-h-screen bg-background font-sans text-text-primary flex flex-col">
            <Analytics />
            <WelcomeModal
                isOpen={isWelcomeModalOpen}
                onClose={() => {
                    const isMachineSetupComplete = machineSettings.workArea.x > 0 && machineSettings.workArea.y > 0;
                    const isToolLibrarySetupComplete = toolLibrary.length > 0;
                    const hasSeenWelcome = localStorage.getItem('cnc-app-seen-welcome');
                    
                    if (isMachineSetupComplete && isToolLibrarySetupComplete) {
                        setIsWelcomeModalOpen(false);
                        localStorage.setItem('cnc-app-seen-welcome', 'true');
                    } else {
                        addNotification("Please complete all setup tasks to dismiss this window.", "info");
                    }
                }}
                onOpenSettings={() => {
                    setIsWelcomeModalOpen(false);
                    setReturnToWelcome(true);
                    setIsSettingsModalOpen(true);
                }}
                onOpenToolLibrary={() => {
                    setIsWelcomeModalOpen(false);
                    setReturnToWelcome(true);
                    setIsToolLibraryModalOpen(true);
                }}
                onTrySimulator={handleTrySimulator}
                isMachineSetupComplete={!!machineSettings.isConfigured}
                isToolLibrarySetupComplete={toolLibrary.length > 0}
            />

            <NotificationContainer
                notifications={notifications}
                onDismiss={removeNotification}
            />
             <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
            <PreflightChecklistModal
                isOpen={isPreflightModalOpen}
                onCancel={() => setIsPreflightModalOpen(false)}
                onConfirm={handleStartJobConfirmed}
                jobInfo={{ fileName, gcodeLines, timeEstimate, startLine: jobStartOptions.startLine }}
                isHomed={isHomedSinceConnect}
                warnings={preflightWarnings}
                selectedTool={selectedTool}
            />
            <MacroEditorModal
                isOpen={isMacroEditorOpen}
                onCancel={handleCloseMacroEditor}
                onSave={handleSaveMacro}
                onDelete={handleDeleteMacro}
                macro={editingMacroIndex !== null ? macros[editingMacroIndex] : null}
                index={editingMacroIndex}
            />
            
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onCancel={() => {
                    setIsSettingsModalOpen(false);
                    if (returnToWelcome) {
                        setIsWelcomeModalOpen(true);
                        setReturnToWelcome(false);
                    }
                }}
                onSave={(newSettings, newGeneratorSettings) => {
                    setMachineSettings({ ...newSettings, isConfigured: true });
                    setGeneratorSettings(newGeneratorSettings);
                }}
                settings={machineSettings}
                generatorSettings={generatorSettings}
                onResetDialogs={() => {
                    localStorage.removeItem('cnc-app-skip-preflight');
                    addNotification("Dialog settings have been reset.", 'info');
                }}
                onExport={handleExportSettings}
                onImport={handleImportSettings}
            />
            <ToolLibraryModal
                isOpen={isToolLibraryModalOpen}
                onCancel={() => {
                    setIsToolLibraryModalOpen(false);
                    if (returnToWelcome) {
                        setIsWelcomeModalOpen(true);
                        setReturnToWelcome(false);
                    }
                }}
                onSave={setToolLibrary}
                library={toolLibrary}
            />
            {isGCodeModalOpen && (
                <ErrorBoundary>
                    <GCodeGeneratorModal
                        isOpen={isGCodeModalOpen}
                        onClose={() => setIsGCodeModalOpen(false)}
                        onLoadGCode={handleLoadGeneratedGCode}
                        unit={unit}
                        settings={machineSettings}
                        toolLibrary={toolLibrary}
                        selectedToolId={selectedToolId}
                        onToolSelect={setSelectedToolId}
                        generatorSettings={generatorSettings}
                        onSettingsChange={setGeneratorSettings}
                    />
                </ErrorBoundary>
            )}

            <header className="bg-surface shadow-md p-4 flex justify-between items-center z-10 flex-shrink-0 gap-4">
                <div className="flex items-center gap-4">
                    <svg
                        viewBox="0 0 420 100"
                        className="h-8 w-auto"
                        aria-label="mycnc.app logo"
                    >
                        <g transform="translate(48,48)" fill="none" stroke="var(--color-text-primary)" strokeWidth="4">
                            <circle r="48" cx="0" cy="0" />
                            <path d="M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z" />
                            <path d="M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z" transform="rotate(120)" />
                            <path d="M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z" transform="rotate(-120)" />
                            <circle r="12" cx="0" cy="0" />
                        </g>
                        <text
                            x="108"
                            y="66"
                            fontFamily="Inter, 'Segoe UI', Roboto, Arial, sans-serif"
                            fontWeight="700"
                            fontSize="64px"
                            letterSpacing="-0.02em"
                            fill="var(--color-text-primary)">
                            <tspan style={{fill: 'var(--color-primary)'}}>mycnc</tspan>.app
                        </text>
                    </svg>
                    <span className='text-xs text-text-secondary font-mono pt-1'>v1.0.2</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleToggleFullscreen}
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                         className="p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                    >
                        {isFullscreen ? <Minimize className='w-5 h-5' /> : <Maximize className='w-5 h-5' />}
                    </button>
                    <button
                        onClick={() => setIsToolLibraryModalOpen(true)}
                        title="Tool Library"
                        className="p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                    ><BookOpen className='w-5 h-5' /></button>
                    <button
                        onClick={() => {
                            setReturnToWelcome(false);
                            setIsSettingsModalOpen(true);
                        }}
                        title="Machine Settings"
                        className="p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                    >
                        <Settings className='w-5 h-5' />
                    </button>
                    <ThemeToggle
                        isLightMode={isLightMode}
                        onToggle={() => setIsLightMode(prev => !prev)}
                    />
                    <SerialConnector
                        isConnected={isConnected}
                        portInfo={portInfo}
                        onConnect={handleConnect}
                        onDisconnect={handleDisconnect}
                        isApiSupported={isSerialApiSupported}
                        isSimulated={isSimulatedConnection}
                        useSimulator={useSimulator}
                        onSimulatorChange={setUseSimulator}
                    />
                </div>
            </header>
          
            <StatusBar
                isConnected={isConnected}
                machineState={machineState}
                unit={unit}
                onEmergencyStop={handleEmergencyStop}
                flashingButton={flashingButton}
            />
            {isAlarm && (
                <div className="bg-accent-red/20 border-b-4 border-accent-red text-accent-red p-4 m-4 flex items-start" role="alert">
                    <OctagonAlert className="h-8 w-8 mr-4 flex-shrink-0" />
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg">{`Machine Alarm: ${alarmInfo!.name}`}</h3>
                        <p className="text-sm">{alarmInfo!.desc}</p>
                        <p className="text-sm mt-2"><strong>Resolution: </strong>{alarmInfo!.resolution}</p>
                    </div>
                    <button
                        id='unlock-button'
                        title='Unlock Machine (Hotkey: x)'
                        onClick={() => handleManualCommand('$X')}
                        className={`ml-4 flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background transition-all duration-100 ${flashingButton === 'unlock-button' ? 'ring-4 ring-white ring-inset' : ''}`}
                    >
                        <Unlock className="w-5 h-5" />
                        Unlock ($X)
                    </button>
                </div>
            )}
            {!isSerialApiSupported && !useSimulator && (
                <div className="bg-accent-yellow/20 border-l-4 border-accent-yellow text-accent-yellow p-4 m-4 flex items-start" role="alert">
                    <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Browser Not Supported</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}
            {error && (isSerialApiSupported || useSimulator) && (
                <div className="bg-accent-red/20 border-l-4 border-accent-red text-accent-red p-4 m-4 flex items-start" role="alert">
                    <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto font-bold">X</button>
                </div>
            )}
            <main className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                <div className="min-h-[60vh] lg:min-h-0">
                    <GCodePanel
                        onFileLoad={handleFileLoad}
                        fileName={fileName}
                        gcodeLines={gcodeLines}
                        onJobControl={handleJobControl}
                        jobStatus={jobStatus}
                        progress={progress}
                        isConnected={isConnected}
                        unit={unit}
                        onGCodeChange={handleGCodeChange}
                        onClearFile={handleClearFile}
                        machineState={machineState}
                        onFeedOverride={handleFeedOverride}
                        timeEstimate={timeEstimate}
                        machineSettings={machineSettings}
                        toolLibrary={toolLibrary}
                        selectedToolId={selectedToolId}
                        onToolSelect={setSelectedToolId} 
                        onOpenGenerator={() => setIsGCodeModalOpen(true)}
                    />
                </div>
                <div className="flex flex-col gap-4 overflow-hidden min-h-0">
                    <JogPanel
                        isConnected={isConnected}
                        machineState={machineState}
                        onJog={handleJog}
                        onHome={handleHome}
                        onSetZero={handleSetZero}
                        onSpindleCommand={handleSpindleCommand}
                        onProbe={handleProbe}
                        onCommand={handleManualCommand}
                        jogStep={jogStep}
                        onStepChange={setJogStep}
                        flashingButton={flashingButton}
                        onFlash={flashControl}
                        unit={unit}
                        onUnitChange={handleUnitChange}
                        isJobActive={isJobActive}
                        isJogging={isJogging}
                        isMacroRunning={isMacroRunning}
                    />
                    <WebcamPanel />
                    <MacrosPanel
                        macros={macros}
                        onRunMacro={handleRunMacro}
                        onOpenEditor={handleOpenMacroEditor}
                        isEditMode={isMacroEditMode}
                        onToggleEditMode={() => setIsMacroEditMode(prev => !prev)}
                        disabled={isJobActive}
                    />
                    <Console
                        logs={consoleLogs}
                        onSendCommand={handleManualCommand}
                        isConnected={isConnected}
                        isJobActive={isJobActive}
                        isMacroRunning={isMacroRunning}
                        isLightMode={isLightMode}
                        isVerbose={isVerbose}
                        onVerboseChange={setIsVerbose}
                    />
                </div>
            </main>
            <Footer onContactClick={() => setIsContactModalOpen(true)} />
        </div>
    );
};

export default App;
