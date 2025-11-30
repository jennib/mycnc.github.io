import React, { useState, useCallback, useRef, useEffect } from "react";

import { JobStatus, Tool, ConnectionOptions } from "./types";
import SerialConnector from "./components/SerialConnector";
import GCodePanel from "./components/GCodePanel";
import Console from "./components/Console";
import JogPanel from "./components/JogPanel";
import MacrosPanel from "./components/MacrosPanel";
import WebcamPanel from "./components/WebcamPanel";
import PreflightChecklistModal from "./components/PreflightChecklistModal";
import WelcomeModal from "./components/WelcomeModal";
import MacroEditorModal from "./components/MacroEditorModal";
import SettingsModal from "./components/SettingsModal";
import ToolLibraryModal from "./components/ToolLibraryModal";
import { NotificationContainer } from "./components/Notification";
import ThemeToggle from "./components/ThemeToggle";
import StatusBar from "./components/StatusBar";
import Tabs from "./components/Tabs";
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
} from "./components/Icons";
import { Analytics } from "@vercel/analytics/react";
import GCodeGeneratorModal from "./components/GCodeGeneratorModal";

import ContactModal from "./components/ContactModal";
import ErrorBoundary from "./ErrorBoundary";
import UnsupportedBrowser from "./components/UnsupportedBrowser";
import SpindleConfirmationModal from "./components/SpindleConfirmationModal";
import InfoModal from "./components/InfoModal";
import { GRBL_ALARM_CODES } from "./constants";
import { useUIStore } from "./stores/uiStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useConnectionStore } from "./stores/connectionStore";
import { useMachineStore } from "./stores/machineStore";
import { useJobStore } from "./stores/jobStore";
import { useJob } from "./hooks/useJob";
import { useLogStore } from "./stores/logStore";

const App: React.FC = () => {
  const machineState = useMachineStore((state) => state.machineState);
  const isJogging = useMachineStore((state) => state.isJogging);
  const isHomedSinceConnect = useMachineStore(
    (state) => state.isHomedSinceConnect
  );
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
    actions: logActions,
  } = useLogStore((state) => state);

  // Local state that doesn't belong in a store
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSerialApiSupported, setIsSerialApiSupported] = useState(true);
  const [useSimulator, setUseSimulator] = useState(false);
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
      setError(
        "This web browser does not support serial connections. You can still use the simulator. Or use a compatible browser like Chrome or, Edge to connect to your machine."
      );
    }
  }, []);

  // Define handlers before they are used in the hotkey useEffect
  const handleEmergencyStop = useCallback(() => {
    const controller = useConnectionStore.getState().controller;
    if (controller) {
      controller.emergencyStop();
    }
  }, []);

  const handleConnect = (options: ConnectionOptions) => {
    if (useSimulator) {
      connectionActions.connect({ type: "simulator" }); // Always use simulator if toggled
    } else {
      connectionActions.connect(options);
    }
  };

  useEffect(() => {
    if (window.electronAPI?.onFullscreenChange) {
      const unsubscribe = window.electronAPI.onFullscreenChange((value: boolean) => setIsFullscreen(value));
      // Request initial state
      window.electronAPI.getFullscreenState();
      return () => unsubscribe();
    }
  }, []);

  const handleToggleFullscreen = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleFullscreen();
    } else {
      // Fallback for non-electron environment
      setIsFullscreen((prev) => !prev);
    }
  };

  // Separate useEffect for non-jog hotkeys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      let handled = false;
      switch (event.key) {
        case "Escape":
          handleEmergencyStop();
          handled = true;
          break;
        case "x":
          handleManualCommand("$X");
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleEmergencyStop, handleManualCommand]);

  const handleDisconnect = () => connectionActions.disconnect();

  const handleFeedOverride = (
    command: "reset" | "inc10" | "dec10" | "inc1" | "dec1"
  ) => {
    const commandMap = {
      reset: "\x90",
      inc10: "\x91",
      dec10: "\x92",
      inc1: "\x93",
      dec1: "\x94",
    };
    if (commandMap[command]) {
      connectionActions.sendRealtimeCommand(commandMap[command]);
    }
  };

  const handleSpindleOverride = (
    command: "reset" | "inc10" | "dec10" | "inc1" | "dec1"
  ) => {
    const commandMap = {
      reset: "\x99",
      inc10: "\x9A",
      dec10: "\x9B",
      inc1: "\x9C",
      dec1: "\x9D",
    };
    if (commandMap[command]) {
      connectionActions.sendRealtimeCommand(commandMap[command]);
    }
  };

  const alarmInfo =
    machineState?.status === "Alarm"
      ? GRBL_ALARM_CODES[machineState!.code!] || GRBL_ALARM_CODES.default
      : null;
  const isJobActive =
    jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused;
  const selectedTool =
    toolLibrary.find((t: Tool) => t.id === selectedToolId) || null;

  return (
    <div className="h-screen bg-background font-sans text-text-primary flex flex-col overflow-hidden">
      {!window.electronAPI?.isElectron && <Analytics />}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={uiActions.closeWelcomeModal}
        onOpenSettings={() => {
          uiActions.closeWelcomeModal();
          uiActions.setReturnToWelcome(true);
          uiActions.openSettingsModal();
        }}
        onOpenToolLibrary={() => {
          uiActions.closeWelcomeModal();
          uiActions.setReturnToWelcome(true);
          uiActions.openToolLibraryModal();
        }}
        onTrySimulator={() => { }}
        isMachineSetupComplete={!!machineSettings.isConfigured}
        isToolLibrarySetupComplete={toolLibrary.length > 0}
      />
      <NotificationContainer
        notifications={notifications}
        onDismiss={() => { }}
      />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={uiActions.closeContactModal}
      />
      <PreflightChecklistModal
        isOpen={isPreflightModalOpen}
        onCancel={uiActions.closePreflightModal}
        onConfirm={handleStartJobConfirmed}
        jobInfo={{
          fileName,
          gcodeLines,
          timeEstimate,
          startLine: jobStartOptions.startLine,
        }}
        isHomed={isHomedSinceConnect}
        warnings={preflightWarnings}
        selectedTool={selectedTool}
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
      <MacroEditorModal
        isOpen={isMacroEditorOpen}
        onCancel={uiActions.closeMacroEditor}
        onSave={() => { }}
        onDelete={() => { }}
        macro={editingMacroIndex !== null ? macros[editingMacroIndex] : null}
        index={editingMacroIndex}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onCancel={() => {
          uiActions.closeSettingsModal();
          if (returnToWelcome) {
            uiActions.openWelcomeModal();
            uiActions.setReturnToWelcome(false);
          }
        }}
        onSave={(newSettings, newGeneratorSettings) => {
          settingsActions.setMachineSettings({
            ...newSettings,
            isConfigured: true,
          });
          settingsActions.setGeneratorSettings(newGeneratorSettings);
        }}
        settings={machineSettings}
        generatorSettings={generatorSettings}
        onResetDialogs={() => { }}
        onExport={() => { }}
        onImport={() => { }}
        onContactClick={uiActions.openContactModal}
      />
      <ToolLibraryModal
        isOpen={isToolLibraryModalOpen}
        onCancel={() => {
          uiActions.closeToolLibraryModal();
          if (returnToWelcome) {
            uiActions.openWelcomeModal();
            uiActions.setReturnToWelcome(false);
          }
        }}
        onSave={settingsActions.setToolLibrary}
        library={toolLibrary}
      />
      {isGCodeModalOpen && (
        <ErrorBoundary>
          <GCodeGeneratorModal
            isOpen={isGCodeModalOpen}
            onClose={uiActions.closeGCodeModal}
            onLoadGCode={(gcode, name) => {
              jobActions.loadFile(gcode, name);
              uiActions.closeGCodeModal();
            }}
            unit={unit}
            settings={machineSettings}
            toolLibrary={toolLibrary}
            selectedToolId={selectedToolId}
            onToolSelect={setSelectedToolId}
            generatorSettings={generatorSettings}
            onSettingsChange={settingsActions.setGeneratorSettings}
          />
        </ErrorBoundary>
      )}

      <header className="bg-surface shadow-md p-1 flex justify-between items-center z-10 flex-shrink-0 gap-2">
        {/* Left: Logo */}
        <div className="flex items-center gap-4 flex-1">
          <img src="./mycnclogo.svg" alt="myCNC Logo" className="h-10 w-auto" />
        </div>

        {/* Center: E-STOP */}
        <div className="flex items-center justify-center flex-1">
          {isConnected && (
            <button
              onClick={handleEmergencyStop}
              className={`flex items-center gap-3 px-8 py-2 min-w-[280px] justify-center bg-red-600 text-white font-bold rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-all duration-100 animate-pulse ${flashingButton === 'estop' ? 'ring-4 ring-white ring-inset' : ''}`}
              title="Emergency Stop (Soft Reset) (Hotkey: Esc)"
            >
              <OctagonAlert className="w-6 h-6" />
              <span className="text-lg">E-STOP</span>
            </button>
          )}
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={uiActions.openToolLibraryModal}
            title="Tool Library"
            className="p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              uiActions.setReturnToWelcome(false);
              uiActions.openSettingsModal();
            }}
            title="Machine Settings"
            className="p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          >
            <Settings className="w-5 h-5" />
          </button>
          <ThemeToggle
            isLightMode={isLightMode}
            onToggle={() => settingsActions.setIsLightMode(!isLightMode)}
          />
          <SerialConnector
            isConnected={isConnected}
            portInfo={portInfo}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isApiSupported={isSerialApiSupported}
            isSimulated={portInfo?.type === 'simulator'}
            useSimulator={useSimulator}
            onSimulatorChange={setUseSimulator}
            isElectron={!!window.electronAPI?.isElectron}
          />
        </div>
      </header>

      <StatusBar
        isConnected={isConnected}
        machineState={machineState}
        unit={unit}
      />

      {alarmInfo && (
        <div
          className="bg-accent-red/20 border-b-4 border-accent-red text-accent-red p-4 m-4 flex items-start"
          role="alert"
        >
          <OctagonAlert className="h-8 w-8 mr-4 flex-shrink-0" />
          <div className="flex-grow">
            <h3 className="font-bold text-lg">{`Machine Alarm: ${alarmInfo.name}`}</h3>
            <p className="text-sm">{alarmInfo.desc}</p>
            <p className="text-sm mt-2">
              <strong>Resolution: </strong>
              {alarmInfo.resolution}
            </p>
          </div>
          <button
            id="unlock-button"
            title="Unlock Machine (Hotkey: x)"
            onClick={() => handleManualCommand("$X")}
            className={`ml-4 flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background transition-all duration-100 ${flashingButton === "unlock-button"
              ? "ring-4 ring-white ring-inset"
              : ""
              }`}
          >
            <Unlock className="w-5 h-5" /> Unlock ($X)
          </button>
        </div>
      )}
      {!isSerialApiSupported && !useSimulator && (
        <div
          className="bg-accent-yellow/20 border-l-4 border-accent-yellow text-accent-yellow p-4 m-4 flex items-start"
          role="alert"
        >
          <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <p className="font-bold">Browser Not Supported</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      {error && (isSerialApiSupported || useSimulator) && (
        <div
          className="bg-accent-red/20 border-l-4 border-accent-red text-accent-red p-4 m-4 flex items-start"
          role="alert"
        >
          <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto font-bold">
            X
          </button>
        </div>
      )}

      <main className="flex-grow p-2 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="h-[40vh] lg:h-full">
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
            isSimulated={useSimulator}
          />
        </div>
        <div className="h-[50vh] lg:h-full">
          <Tabs
            defaultTab="controls"
            tabs={[
              {
                id: "controls",
                label: "Controls",
                icon: <Move className="w-4 h-4" />,
                content: (
                  <div className="h-full overflow-auto">
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
                  </div>
                ),
              },
              {
                id: "webcam",
                label: "Webcam",
                icon: <Camera className="w-4 h-4" />,
                content: (
                  <div className="h-full overflow-auto p-2">
                    <WebcamPanel />
                  </div>
                ),
              },
              {
                id: "macros",
                label: "Macros",
                icon: <Zap className="w-4 h-4" />,
                content: (
                  <div className="h-full overflow-auto p-2">
                    <MacrosPanel
                      macros={macros}
                      onRunMacro={handleRunMacro}
                      onOpenEditor={uiActions.openMacroEditor}
                      isEditMode={isMacroEditMode}
                      onToggleEditMode={() => setIsMacroEditMode((prev) => !prev)}
                      disabled={isJobActive}
                    />
                  </div>
                ),
              },
              {
                id: "console",
                label: "Console",
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
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </main>

    </div>
  );
};

export default App;
