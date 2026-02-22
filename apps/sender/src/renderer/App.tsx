import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import MobileLanding from "./components/MobileLanding";
import DesktopBanner from "./components/DesktopBanner";
import CameraWindow from "./components/CameraWindow";
import Console from "./components/Console";
import JogPanel from "./components/JogPanel";
import MacrosPanel from "./components/MacrosPanel";
import WebcamPanel from "./components/WebcamPanel";
import PreflightChecklistModal from "./components/PreflightChecklistModal";
import WelcomeModal from "./components/WelcomeModal";
import MacroEditorModal from "./components/MacroEditorModal";
import SettingsModal from "./components/SettingsModal";
import GrblSettingsModal from "./components/GrblSettingsModal";
import ToolLibraryModal from "./components/ToolLibraryModal";
import LibraryPanel from "./components/LibraryPanel";
import { NotificationContainer } from "./components/Notification";
import StatusBar from "./components/StatusBar";
import WebcamPeek from "./components/WebcamPeek";
import VirtualKeyboard from "./components/ui/VirtualKeyboard";
import SerialConnector from "./components/SerialConnector";
import GCodePanel from "./components/GCodePanel";
import { JobStatus, ConnectionOptions } from "./types";
import { ThemeToggle, Tabs } from "@mycnc/shared";
import {
  AlertTriangle,
  OctagonAlert,
  Unlock,
  Settings,
  Sun,
  Moon,
  Maximize,
  Minimize,
  BookOpen,
  Move,
  Camera,
  Zap,
  Terminal,
  FolderOpen,
  GRBL_REALTIME_COMMANDS,
} from "@mycnc/shared";
import { Analytics } from "@vercel/analytics/react";
import GCodeGeneratorModal from "./components/GCodeGeneratorModal";
import Logo from "./components/Logo";
import ConnectionSelector from "./components/ConnectionSelector";

import ContactModal from "./components/ContactModal";
import ErrorBoundary from "./ErrorBoundary";
import UnsupportedBrowser from "./components/UnsupportedBrowser";
import SpindleConfirmationModal from "./components/SpindleConfirmationModal";
import InfoModal from "./components/InfoModal";
import { GRBL_ALARM_CODES } from "@mycnc/shared";
import { useUIStore } from "./stores/uiStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useConnectionStore } from "./stores/connectionStore";
import { useMachineStore } from "./stores/machineStore";
import { useJobStore } from "./stores/jobStore";
import { useJob } from "./hooks/useJob";
import { useLogStore } from "./stores/logStore";
import { Tool } from "@mycnc/shared";

const MainApp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mobile Detection
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isIPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

      if ((isMobile || isIPad) && sessionStorage.getItem('mobile_bypass') !== 'true') {
        navigate('/mobile');
      }
    };

    checkMobile();
  }, [navigate]);

  const machineState = useMachineStore((state) => state.machineState);
  const isJogging = useMachineStore((state) => state.isJogging);
  const isHomedSinceConnect = useMachineStore(
    (state) => state.isHomedSinceConnect
  );
  const isConnecting = useConnectionStore((state) => state.isConnecting);
  const isMacroRunning = useMachineStore((state) => state.isMacroRunning);
  const handleSetZero = useMachineStore((state) => state.actions.handleSetZero);
  const handleSpindleCommand = useMachineStore(
    (state) => state.actions.handleSpindleCommand
  );
  const handleProbe = useMachineStore((state) => state.actions.handleProbe);
  const handleJog = useMachineStore((state) => state.actions.handleJog);
  const handleJogStop = useMachineStore((state) => state.actions.handleJogStop);
  const handleRunMacro = useMachineStore(
    (state) => state.actions.handleRunMacro
  );
  const handleManualCommand = useMachineStore(
    (state) => state.actions.handleManualCommand
  );
  const handleUnitChange = useMachineStore(
    (state) => state.actions.handleUnitChange
  );


  const handleHome = useMachineStore((state) => state.actions.handleHome);

  const {
    gcodeLines,
    fileName,
    jobStatus,
    progress,
    timeEstimate,
    jobActions,
    jobStartOptions,
    preflightWarnings,
    handleJobControl,
    handleStartJobConfirmed,
  } = useJob();

  // UI Store
  const {
    isPreflightModalOpen,
    isWelcomeModalOpen,
    isMacroEditorOpen,
    editingMacroIndex,
    isSettingsModalOpen,
    isToolLibraryModalOpen,
    isContactModalOpen,
    isGCodeModalOpen,
    isSpindleModalOpen,
    spindleModalArgs,
    isInfoModalOpen,
    infoModalTitle,
    infoModalMessage,
    isGrblSettingsModalOpen,
    returnToWelcome,
    actions: uiActions,
  } = useUIStore((state) => state);

  // Settings Store
  const {
    jogStep,
    unit,
    isLightMode,
    macros,
    machineSettings,
    toolLibrary,
    generatorSettings,
    connectionSettings,
    actions: settingsActions,
  } = useSettingsStore((state) => state);

  // Connection Store
  const {
    isConnected,
    portInfo,
    actions: connectionActions,
  } = useConnectionStore((state) => state);

  // Log Store
  const {
    logs,
    isVerbose,
    isLogEnabled,
    actions: logActions,
  } = useLogStore((state) => state);

  // Local state that doesn't belong in a store
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSerialApiSupported, setIsSerialApiSupported] = useState(true);
  // useSimulator local state removed, using settingsStore.connectionSettings.useSimulator instead
  const [isMacroEditMode, setIsMacroEditMode] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flashingButton, setFlashingButton] = useState<string | null>(null);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleFullScreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Check for startup file from Electron when app loads
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getStartupFile) {
      window.electronAPI.getStartupFile().then((file) => {
        if (file) {
          jobActions.loadFile(file.content, file.name);
          console.log(`Loaded startup file: ${file.name}`);
        }
      }).catch(err => console.error("Error loading startup file:", err));
    }

    if (window.electronAPI && window.electronAPI.onLoadRemoteFile) {
      window.electronAPI.onLoadRemoteFile((file) => {
        if (useSettingsStore.getState().allowRemoteFiles && file) {
          jobActions.loadFile(file.content, file.name);
          console.log(`Loaded remote file over API: ${file.name}`);
        } else {
          console.log(`Ignored remote file over API (allowRemoteFiles=false): ${file?.name}`);
        }
      });
    }
  }, [jobActions]);

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onRemoteAction) {
      window.electronAPI.onRemoteAction((action) => {
        console.log("Received remote action:", action);
        if (action.type === 'START_JOB') {
          const { isDryRun } = action.payload;
          handleStartJobConfirmed({ isDryRun });
        } else if (action.type === 'CONNECT') {
          const options = action.payload;
          console.log("Remote commanded CONNECT:", options);
          connectionActions.connect(options);
        } else if (action.type === 'DISCONNECT') {
          console.log("Remote commanded DISCONNECT");
          connectionActions.disconnect();
        } else if (action.type === 'PAUSE_JOB') {
          console.log("Remote commanded PAUSE");
          handleJobControl('pause');
        } else if (action.type === 'STOP_JOB') {
          console.log("Remote commanded STOP");
          handleJobControl('stop');
        } else if (action.type === 'RESUME_JOB') {
          console.log("Remote commanded RESUME");
          handleJobControl('resume');
        }
      });
    }
  }, [handleStartJobConfirmed, connectionActions, handleJobControl]);

  const handleFlash = useCallback((buttonId: string) => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    setFlashingButton(buttonId);
    flashTimeoutRef.current = setTimeout(() => {
      setFlashingButton(null);
    }, 150); // Flash for 150ms
  }, []);

  // Show welcome modal on first run
  useEffect(() => {
    if (!machineSettings.isConfigured) {
      uiActions.openWelcomeModal();
    }
  }, [machineSettings.isConfigured, uiActions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", isLightMode);
  }, [isLightMode]);

  useEffect(() => {
    if ("serial" in navigator) {
      setIsSerialApiSupported(true);
    } else {
      setIsSerialApiSupported(false);
    }
  }, []);

  // Define handlers before they are used in the hotkey useEffect
  const handleEmergencyStop = useCallback(() => {
    const controller = useConnectionStore.getState().controller;
    if (controller) {
      controller.emergencyStop();
    }
  }, []);

  // Keep controller in sync with settings and macros
  useEffect(() => {
    const controller = useConnectionStore.getState().controller;
    if (controller) {
      // We know GrblController has these methods/properties, even if the base Controller interface is generic.
      // Ideally we'd cast or update the interface, but for now we check existence or cast to any.
      if ('settings' in controller) {
        (controller as any).settings = machineSettings;
      }
      if (typeof (controller as any).setMacros === 'function') {
        (controller as any).setMacros(macros);
      }
    }
  }, [machineSettings, macros, isConnected]); // Run when settings change or when connected (new controller created)

  const handleConnect = (options: ConnectionOptions) => {
    // Check if Remote Client
    if (window.electronAPI && !window.electronAPI.isElectron && window.electronAPI.sendRemoteAction) {
      console.log("Remote Client: Delegating Connect to Host");
      window.electronAPI.sendRemoteAction({
        type: 'CONNECT',
        payload: options
      });
      return;
    }


    // If connection type is simulator in settings, override options type
    if (connectionSettings.type === 'simulator') {
      connectionActions.connect({ type: "simulator" });
    } else {
      connectionActions.connect(options);
    }
  };

  const handleDisconnect = () => {
    // Check if Remote Client
    if (window.electronAPI && !window.electronAPI.isElectron && window.electronAPI.sendRemoteAction) {
      console.log("Remote Client: Delegating Disconnect to Host");
      window.electronAPI.sendRemoteAction({
        type: 'DISCONNECT'
      });
      return;
    }
    connectionActions.disconnect();
  };

  const isJobActive = jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused;

  const handleFeedOverride = useCallback(
    (command: "reset" | "inc10" | "dec10" | "inc1" | "dec1") => {
      const { sendRealtimeCommand } = connectionActions;
      switch (command) {
        case "reset": sendRealtimeCommand(GRBL_REALTIME_COMMANDS.FEED_OVR_RESET); break;
        case "inc10": sendRealtimeCommand(GRBL_REALTIME_COMMANDS.FEED_OVR_COARSE_PLUS); break;
        case "dec10": sendRealtimeCommand(GRBL_REALTIME_COMMANDS.FEED_OVR_COARSE_MINUS); break;
        case "inc1": sendRealtimeCommand(GRBL_REALTIME_COMMANDS.FEED_OVR_FINE_PLUS); break;
        case "dec1": sendRealtimeCommand(GRBL_REALTIME_COMMANDS.FEED_OVR_FINE_MINUS); break;
      }
    },
    [connectionActions]
  );

  const handleSpindleOverride = useCallback(
    (command: "reset" | "inc10" | "dec10" | "inc1" | "dec1") => {
      const { sendRealtimeCommand } = connectionActions;
      switch (command) {
        case "reset": sendRealtimeCommand(GRBL_REALTIME_COMMANDS.SPINDLE_OVR_RESET); break;
        case "inc10": sendRealtimeCommand(GRBL_REALTIME_COMMANDS.SPINDLE_OVR_COARSE_PLUS); break;
        case "dec10": sendRealtimeCommand(GRBL_REALTIME_COMMANDS.SPINDLE_OVR_COARSE_MINUS); break;
        case "inc1": sendRealtimeCommand(GRBL_REALTIME_COMMANDS.SPINDLE_OVR_FINE_PLUS); break;
        case "dec1": sendRealtimeCommand(GRBL_REALTIME_COMMANDS.SPINDLE_OVR_FINE_MINUS); break;
      }
    },
    [connectionActions]
  );

  const alarmInfo = machineState?.status === "Alarm"
    ? (GRBL_ALARM_CODES as any)[machineState.code || "default"] || (GRBL_ALARM_CODES as any)["default"]
    : null;

  const selectedTool = useMemo(() => toolLibrary.find(t => t.id === selectedToolId) || null, [toolLibrary, selectedToolId]);

  const handleConnectSimulator = useCallback(() => {
    connectionActions.connect({ type: 'simulator' });
    uiActions.closeWelcomeModal();
  }, [connectionActions, uiActions]);

  const jobInfo = useMemo(() => ({
    fileName,
    gcodeLines,
    timeEstimate,
    startLine: jobStartOptions?.startLine || 0
  }), [fileName, gcodeLines, timeEstimate, jobStartOptions]);

  const handleExportSettings = useCallback(() => {
    const state = useSettingsStore.getState();
    const exportData = {
      machineSettings: state.machineSettings,
      generatorSettings: state.generatorSettings,
      toolLibrary: state.toolLibrary,
      macros: state.macros,
      webcamSettings: state.webcamSettings,
      connectionSettings: state.connectionSettings,
      unit: state.unit,
      jogStep: state.jogStep,
      isLightMode: state.isLightMode
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mycnc-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-text-primary overflow-hidden font-sans">
      <header className="bg-surface/95 backdrop-blur-md border-b border-white/10 px-4 py-2 flex items-center justify-between shadow-lg z-10 flex-shrink-0">
        <Logo className="h-8 w-auto" />
        <div className="flex items-center gap-6">
          <ConnectionSelector />
          <SerialConnector
            isConnected={isConnected}
            isConnecting={isConnecting}
            portInfo={portInfo}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isApiSupported={isSerialApiSupported}
            isSimulated={connectionSettings.type === 'simulator'}
            isElectron={!!window.electronAPI?.isElectron}
          />
          <div className="flex items-center gap-1 border-l border-white/10 pl-4 ml-2">
            <button
              onClick={uiActions.openToolLibraryModal}
              className="p-2 text-text-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
              title={t('tools.title')}
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              onClick={uiActions.openSettingsModal}
              className="p-2 text-text-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
              title={t('settings.title')}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => settingsActions.setIsLightMode(!isLightMode)}
              className="p-2 text-text-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
              title={t('common.toggleTheme', 'Toggle Theme')}
            >
              {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  if (document.exitFullscreen) document.exitFullscreen();
                }
              }}
              className="p-2 text-text-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
              title={t('common.fullscreen', 'Toggle Fullscreen')}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <StatusBar
        isConnected={isConnected}
        machineState={machineState}
        unit={unit}
      />
      <WebcamPeek />
      {
        alarmInfo && (
          <div
            className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4 m-4 flex items-start rounded-r-lg backdrop-blur-sm"
            role="alert"
          >
            <OctagonAlert className="h-6 w-6 mr-4 flex-shrink-0 mt-1" />
            <div className="flex-grow">
              <h3 className="font-bold text-lg">{`Machine Alarm: ${alarmInfo.name}`}</h3>
              <p className="text-sm opacity-90">{alarmInfo.desc}</p>
              <p className="text-sm mt-2">
                <strong className="text-red-300">Resolution: </strong>
                {alarmInfo.resolution}
              </p>
            </div>
            <button
              id="unlock-button"
              title="Unlock Machine (Hotkey: x)"
              onClick={() => handleManualCommand("$X")}
              className={`ml-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 shadow-lg ${flashingButton === "unlock-button"
                ? "ring-4 ring-white ring-inset"
                : ""
                }`}
            >
              <Unlock className="w-5 h-5" /> Unlock ($X)
            </button>
          </div>
        )
      }
      {
        !isSerialApiSupported && connectionSettings.type !== 'simulator' && (
          <div
            className="bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-500 p-4 m-4 flex items-start rounded-r-lg backdrop-blur-sm"
            role="alert"
          >
            <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
            <div>
              <p className="font-bold">Browser Not Supported</p>
              <p>This web browser does not support serial connections. You can still use the simulator. Or use a compatible browser like Chrome or Edge to connect to your machine.</p>
            </div>
          </div>
        )
      }
      {
        error && (isSerialApiSupported || connectionSettings.type === 'simulator') && (
          <div
            className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 m-4 flex items-start rounded-r-lg backdrop-blur-sm"
            role="alert"
          >
            <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto font-bold hover:text-red-400 transition-colors">
              X
            </button>
          </div>
        )
      }

      <main className="flex-grow p-2 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="h-[40vh] lg:h-full bg-surface/95 rounded-xl border border-white/10 border-t-white/20 overflow-hidden shadow-2xl">
          <GCodePanel
            onFileLoad={jobActions.loadFile}
            fileName={fileName}
            gcodeLines={gcodeLines}
            onJobControl={handleJobControl}
            jobStatus={jobStatus}
            progress={progress}
            isConnected={isConnected}
            unit={unit}
            onGCodeChange={jobActions.updateGCode}
            onClearFile={jobActions.clearFile}
            machineState={machineState}
            onFeedOverride={handleFeedOverride}
            onSpindleOverride={handleSpindleOverride}
            timeEstimate={timeEstimate}
            machineSettings={machineSettings}
            toolLibrary={toolLibrary}
            selectedToolId={selectedToolId}
            onToolSelect={setSelectedToolId}
            onOpenGenerator={uiActions.openGCodeModal}
            isSimulated={connectionSettings.type === 'simulator'}
          />
        </div>
        <div className="h-[50vh] lg:h-full bg-surface/95 rounded-xl border border-white/10 border-t-white/20 overflow-hidden shadow-2xl">
          <Tabs
            defaultTab="controls"
            tabs={[
              {
                id: "controls",
                label: t('jog.title'),
                icon: <Move className="w-4 h-4" />,
                content: (
                  <div className="h-full overflow-auto p-2 flex flex-col gap-2">
                    <JogPanel
                      isConnected={isConnected}
                      machineState={machineState}
                      machineSettings={machineSettings}
                      isHomed={isHomedSinceConnect}
                      onJog={handleJog}
                      onHome={() => handleHome("all")}
                      onSetZero={handleSetZero}
                      onSpindleCommand={handleSpindleCommand}
                      onProbe={handleProbe}
                      onSendCommand={handleManualCommand}
                      jogStep={jogStep}
                      onStepChange={settingsActions.setJogStep}
                      flashingButton={flashingButton}
                      onFlash={handleFlash}
                      unit={unit}
                      onUnitChange={handleUnitChange}
                      isJobActive={isJobActive}
                      isJogging={isJogging}
                      isMacroRunning={isMacroRunning}
                      onJogStop={handleJogStop}
                      jogFeedRate={machineSettings.jogFeedRate}
                      jobStatus={jobStatus}
                    />
                    <MacrosPanel
                      macros={macros}
                      onRunMacro={handleRunMacro}
                      onOpenEditor={uiActions.openMacroEditor}
                      onImportMacros={settingsActions.setMacros}
                      isEditMode={isMacroEditMode}
                      onToggleEditMode={() => setIsMacroEditMode((prev) => !prev)}
                      disabled={isJobActive}
                    />
                  </div>
                ),
              },
              {
                id: "webcam",
                label: t('webcam.title'),
                icon: <Camera className="w-4 h-4" />,
                content: (
                  <div className="h-full overflow-auto p-2">
                    <WebcamPanel />
                  </div>
                ),
              },
              {
                id: "console",
                label: t('console.title'),
                icon: <Terminal className="w-4 h-4" />,
                content: (
                  <div className="h-full">
                    <Console
                      logs={logs}
                      onSendCommand={handleManualCommand}
                      onClearLogs={logActions.clearLogs}
                      isConnected={isConnected}
                      isJobActive={isJobActive}
                      isMacroRunning={isMacroRunning}
                      isLightMode={isLightMode}
                      isVerbose={isVerbose}
                      onVerboseChange={logActions.setIsVerbose}
                      isLogEnabled={isLogEnabled}
                      onLogEnabledChange={logActions.setIsLogEnabled}
                    />
                  </div>
                ),
              },
              {
                id: "library",
                label: "Library",
                icon: <FolderOpen className="w-4 h-4" />,
                content: (
                  <div className="h-full overflow-hidden p-2">
                    <LibraryPanel />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </main>

      {/* Modals */}
      <PreflightChecklistModal
        isOpen={isPreflightModalOpen}
        onCancel={uiActions.closePreflightModal}
        onConfirm={handleStartJobConfirmed}
        jobInfo={jobInfo}
        isHomed={isHomedSinceConnect}
        warnings={preflightWarnings}
        selectedTool={selectedTool}
      />

      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={uiActions.closeWelcomeModal}
        onOpenSettings={uiActions.openSettingsModal}
        onOpenToolLibrary={uiActions.openToolLibraryModal}
        onTrySimulator={handleConnectSimulator}
        isMachineSetupComplete={machineSettings.isConfigured}
        isToolLibrarySetupComplete={toolLibrary.length > 0}
      />

      <MacroEditorModal
        isOpen={isMacroEditorOpen}
        onCancel={uiActions.closeMacroEditor}
        onSave={(macro, index) => {
          settingsActions.setMacros(prev => {
            const newMacros = [...prev];
            if (index !== null) {
              newMacros[index] = macro;
            } else {
              newMacros.push(macro);
            }
            return newMacros;
          });
          uiActions.closeMacroEditor();
        }}
        onDelete={(index) => {
          settingsActions.setMacros(prev => prev.filter((_, i) => i !== index));
          uiActions.closeMacroEditor();
        }}
        macro={editingMacroIndex !== null ? macros[editingMacroIndex] : null}
        index={editingMacroIndex}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onCancel={uiActions.closeSettingsModal}
        onSave={(settings, genSettings, connSettings) => {
          settingsActions.setMachineSettings(settings);
          settingsActions.setGeneratorSettings(genSettings);
          settingsActions.setConnectionSettings(connSettings);
        }}
        settings={machineSettings}
        generatorSettings={generatorSettings}
        connectionSettings={connectionSettings}
        onResetDialogs={() => {
          localStorage.removeItem('cnc-app-welcome-dismissed');
          localStorage.removeItem('cnc-app-skip-preflight');
        }}
        onExport={handleExportSettings}
        onImport={settingsActions.importSettings}
        onContactClick={uiActions.openContactModal}
        onOpenGrblSettings={uiActions.openGrblSettingsModal}
      />

      <GrblSettingsModal />

      <ToolLibraryModal
        isOpen={isToolLibraryModalOpen}
        onCancel={uiActions.closeToolLibraryModal}
        library={toolLibrary}
        onSave={settingsActions.setToolLibrary}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={uiActions.closeContactModal}
      />

      <GCodeGeneratorModal
        isOpen={isGCodeModalOpen}
        onClose={uiActions.closeGCodeModal}
        onLoadGCode={(gcode, name) => {
          jobActions.loadFile(gcode, name);
          uiActions.closeGCodeModal();
        }}
        unit={unit}
        settings={machineSettings}
        generatorSettings={generatorSettings}
        onSettingsChange={settingsActions.setGeneratorSettings}
        toolLibrary={toolLibrary}
        selectedToolId={selectedToolId}
        onToolSelect={setSelectedToolId}
      />

      <SpindleConfirmationModal
        isOpen={isSpindleModalOpen}
        onClose={uiActions.closeSpindleModal}
        onConfirm={(startSpindle) => {
          spindleModalArgs.onConfirm(startSpindle);
          uiActions.closeSpindleModal();
        }}
        title={spindleModalArgs.title}
        message={spindleModalArgs.message}
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={uiActions.closeInfoModal}
        title={infoModalTitle}
        message={infoModalMessage}
      />

      <NotificationContainer
        notifications={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      />
      <VirtualKeyboard />

    </div >
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/camera-popout" element={<CameraWindow />} />
        <Route path="/mobile" element={<MobileLanding />} />
        <Route path="/" element={<MainApp />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
