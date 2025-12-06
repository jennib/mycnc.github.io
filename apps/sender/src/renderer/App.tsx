import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { NotificationContainer } from "./components/Notification";
import StatusBar from "./components/StatusBar";
import WebcamPeek from "./components/WebcamPeek";
import VirtualKeyboard from "./components/ui/VirtualKeyboard";
import SerialConnector from "./components/SerialConnector";
import GCodePanel from "./components/GCodePanel";
import { JobStatus, ConnectionOptions, Tool } from "./types";
import { ThemeToggle, Tabs } from "@mycnc/shared";
import {
  AlertTriangle,
  OctagonAlert,
  Unlock,
  Settings,
  Maximize,
  Minimize,
  BookOpen,
  Move,
  Camera,
  Zap,
  Terminal,
} from "@mycnc/shared";
import { Analytics } from "@vercel/analytics/react";
import GCodeGeneratorModal from "./components/GCodeGeneratorModal";
import Logo from "./components/Logo";

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
    // If connection type is simulator in settings, override options type
    if (connectionSettings.type === 'simulator') {
      connectionActions.connect({ type: "simulator" });
    } else {
      connectionActions.connect(options);
    }
  };

  // ... existing code ...

  <SerialConnector
    isConnected={isConnected}
    isConnecting={isConnecting}
    portInfo={portInfo}
    onConnect={handleConnect}
    onDisconnect={handleDisconnect}
    isApiSupported={isSerialApiSupported}
    isSimulated={portInfo?.type === 'simulator'}
    isElectron={!!window.electronAPI?.isElectron}
  />
        </div >
      </header >

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
  !isSerialApiSupported && !connectionSettings.useSimulator && (
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
  error && (isSerialApiSupported || connectionSettings.useSimulator) && (
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
      isSimulated={connectionSettings.useSimulator}
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
      ]}
    />
  </div>
</main>

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
