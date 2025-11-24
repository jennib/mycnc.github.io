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
import {
  AlertTriangle,
  OctagonAlert,
  Unlock,
  Settings,
  Maximize,
  Minimize,
  BookOpen,
} from "./components/Icons";
import {
  analyzeGCode,
  getMachineStateAtLine,
} from "./services/gcodeAnalyzer.js";
import { Analytics } from "@vercel/analytics/react";
import GCodeGeneratorModal from "./components/GCodeGeneratorModal";
import Footer from "./components/Footer";
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
import { useLogStore } from "./stores/logStore";

const App: React.FC = () => {
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
    isSimulated,
    portInfo,
    actions: connectionActions,
  } = useConnectionStore((state) => state);

  // Machine Store
  const {
    machineState,
    isJogging,
    isHomedSinceConnect,
    isMacroRunning,
    actions: machineActions,
  } = useMachineStore((state) => state);

  // Job Store
  const {
    gcodeLines,
    fileName,
    jobStatus,
    progress,
    timeEstimate,
    actions: jobActions,
  } = useJobStore((state) => state);

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
  const [jobStartOptions, setJobStartOptions] = useState({
    startLine: 0,
    isDryRun: false,
  });
  const [preflightWarnings, setPreflightWarnings] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMacroEditMode, setIsMacroEditMode] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
  const [flashingButton, setFlashingButton] = useState<string | null>(null);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeJogKeyRef = useRef<string | null>(null);

  const handleFlash = useCallback((buttonId: string) => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    setFlashingButton(buttonId);
    flashTimeoutRef.current = setTimeout(() => {
      setFlashingButton(null);
    }, 150); // Flash for 150ms
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () =>
      flashTimeoutRef.current && clearTimeout(flashTimeoutRef.current);
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
    const manager = useConnectionStore.getState().serialManager;
    if (manager) {
      manager.emergencyStop();
    }
  }, []);

  const handleJogStop = useCallback(() => {
    // Jog Cancel realtime command 0x85
    connectionActions.sendRealtimeCommand('\x85');
  }, [connectionActions]);

  const handleManualCommand = useCallback(
    (command: string) => {
      connectionActions.sendLine(command);
    },
    [connectionActions]
  );

  const handleJog = useCallback(
    (axis: string, direction: number, step: number) => {
      const { jogFeedRate } = machineSettings;
      const distance = direction * step;
      const command = `$J=G91 ${axis}${distance} F${jogFeedRate}`;
      connectionActions.sendLine(command);
    },
    [machineSettings, connectionActions]
  );

  const handleConnect = (options: ConnectionOptions) => {
    if (useSimulator) {
      connectionActions.connect({ type: "simulator" });
    } else {
      connectionActions.connect(options);
    }
  };

  const handleToggleFullscreen = () => {
    // Check if the electronAPI and its send method exist before calling it
    if (window.electronAPI && typeof window.electronAPI.send === "function") {
      window.electronAPI.send("toggle-fullscreen");
    } else {
      console.error("Fullscreen API is not available.");
    }
  };
  // Global Hotkey Handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Do not trigger hotkeys if an input field is focused, or if the key is being held down
      if (
        event.repeat ||
        (document.activeElement &&
          (document.activeElement.tagName === "INPUT" ||
            document.activeElement.tagName === "TEXTAREA"))
      ) {
        return;
      }

      // If a jog key is already active, don't start a new one.
      if (activeJogKeyRef.current) {
        return;
      }

      let axis: string | null = null;
      let direction = 0;

      switch (event.key) {
        case "ArrowUp": axis = "Y"; direction = 1; break;
        case "ArrowDown": axis = "Y"; direction = -1; break;
        case "ArrowLeft": axis = "X"; direction = -1; break;
        case "ArrowRight": axis = "X"; direction = 1; break;
        case "PageUp": axis = "Z"; direction = 1; break;
        case "PageDown": axis = "Z"; direction = -1; break;
      }

      if (axis && direction !== 0) {
        event.preventDefault();
        
        // Set the ref immediately to block subsequent keydown repeats
        activeJogKeyRef.current = event.key;

        const { jogFeedRate } = machineSettings;
        // A large distance simulates continuous movement until key-up/cancel.
        const distance = direction * 99999;
        const command = `$J=G91 ${axis}${distance} F${jogFeedRate}`;
        
        connectionActions.sendLine(command).catch(err => {
            console.error("Failed to start jog:", err);
            // If the command fails, unblock jogging.
            activeJogKeyRef.current = null;
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === activeJogKeyRef.current) {
        event.preventDefault();
        handleJogStop();
        activeJogKeyRef.current = null;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (activeJogKeyRef.current) {
        handleJogStop();
      }
    };
  }, [machineSettings, connectionActions, handleJogStop]);

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

  const handleJobControl = async (
    action: "start" | "pause" | "resume" | "stop",
    options?: { startLine?: number }
  ) => {
    const manager = useConnectionStore.getState().serialManager;
    if (!manager || !isConnected) return;

    switch (action) {
      case "start":
        if (gcodeLines.length > 0) {
          const warnings = analyzeGCode(gcodeLines, machineSettings);
          setPreflightWarnings(warnings);
          setJobStartOptions({
            startLine: options?.startLine ?? 0,
            isDryRun: false,
          });
          uiActions.openPreflightModal();
        }
        break;
      case "pause":
        if (jobStatus === JobStatus.Running) {
          if (
            machineState &&
            machineState.spindle &&
            machineState.spindle.state !== "off" &&
            machineState.spindle.speed > 0
          ) {
            uiActions.openInfoModal(
              "Spindle Warning",
              "Pause was initiated but the spindle has been left running. Proceed with caution."
            );
          }
          await manager.pause();
          jobActions.setJobStatus(JobStatus.Paused);
        }
        break;
      case "resume":
        if (jobStatus === JobStatus.Paused) {
          await manager.resume();
          jobActions.setJobStatus(JobStatus.Running);
        }
        break;
      case "stop":
        if (jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused) {
          manager.stopJob();
          jobActions.setProgress(0);
          jobActions.setJobStatus(JobStatus.Stopped);
        }
        break;
    }
  };

  const handleStartJobConfirmed = useCallback(
    (options: { isDryRun: boolean }) => {
      const manager = useConnectionStore.getState().serialManager;
      if (!manager || !isConnected || gcodeLines.length === 0) return;

      const { startLine } = jobStartOptions;
      const { isDryRun } = options;

      const startJob = async (startSpindle: boolean) => {
        if (startLine > 0) {
          logActions.addLog({
            type: "status",
            message: `Calculating machine state for line ${startLine + 1}...`,
          });
          const state = getMachineStateAtLine(gcodeLines, startLine);
          const setupCommands: string[] = [
            state.workCoordinateSystem,
            state.unitMode,
            state.distanceMode,
          ];
          if (state.feedRate) {
            setupCommands.push(`F${state.feedRate}`);
          }
          if (
            startSpindle &&
            !isDryRun &&
            (state.spindle === "M3" || state.spindle === "M4") &&
            state.speed &&
            state.speed > 0
          ) {
            setupCommands.push(`${state.spindle} S${state.speed}`, "G4 P1");
          }
          if (!isDryRun && (state.coolant === "M7" || state.coolant === "M8")) {
            setupCommands.push(state.coolant);
          }
          logActions.addLog({
            type: "status",
            message: `Restoring machine state: ${setupCommands.join(", ")}`,
          });
          for (const command of setupCommands) {
            try {
              await manager.sendLineAndWaitForOk(command);
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
              logActions.addLog({
                type: "error",
                message: `Failed to set initial state with command '${command}': ${errorMessage}`,
              });
              jobActions.setJobStatus(JobStatus.Idle);
              return;
            }
          }
        }
        jobActions.setJobStatus(JobStatus.Running);
        manager.sendGCode(gcodeLines, { startLine, isDryRun });
      };

      uiActions.closePreflightModal();
      if (startLine === 0) {
        startJob(true);
      } else {
        uiActions.openSpindleModal({
          onConfirm: startJob,
          title: "Start Job from Line",
          message: `Starting from line ${
            startLine + 1
          }. Do you want to turn the spindle on?`,
        });
      }
    },
    [
      isConnected,
      gcodeLines,
      jobStartOptions,
      logActions,
      jobActions,
      uiActions,
    ]
  );

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

  const handleHome = (axes: "all" | "x" | "y" | "z" | "xy") => {
    if (axes === "all") {
      // Homing can take a long time, so we use a longer timeout.
      connectionActions.sendLine("$H", 60000);
    }
    // Note: GRBL doesn't support homing individual axes with a single command.
    // This would require a macro or special handling if needed in the future.
  };

  const handleSetZero = (axes: "all" | "x" | "y" | "z" | "xy") => {
    const commandMap = {
      all: "G10 L20 P1 X0 Y0 Z0",
      x: "G10 L20 P1 X0",
      y: "G10 L20 P1 Y0",
      z: "G10 L20 P1 Z0",
      xy: "G10 L20 P1 X0 Y0",
    };
    const command = commandMap[axes];
    if (command) {
      connectionActions.sendLine(command);
    }
  };

  const handleSpindleCommand = (
    command: "cw" | "ccw" | "off",
    speed: number
  ) => {
    switch (command) {
      case "cw":
        connectionActions.sendLine(`M3 S${speed}`);
        break;
      case "ccw":
        connectionActions.sendLine(`M4 S${speed}`);
        break;
      case "off":
        connectionActions.sendLine("M5");
        break;
    }
  };

  const handleProbe = (axes: string) => {
    logActions.addLog({ type: 'info', message: `Probing axes: ${axes}` });
    const { probe } = machineSettings;
    if (!probe || !probe.feedRate || !probe.probeTravelDistance) {
      logActions.addLog({
        type: "error",
        message: "Probe settings are not configured.",
      });
      return;
    }

    const { feedRate, probeTravelDistance } = probe;

    let command = "";
    // The probe command G38.2 moves one or more axes. The first axis to touch the probe
    // stops all axes and records the coordinates.
    // We assume a negative direction for probing.
    if (axes.includes("X")) {
      command += `X-${probeTravelDistance} `;
    }
    if (axes.includes("Y")) {
      command += `Y-${probeTravelDistance} `;
    }
    if (axes.includes("Z")) {
      command += `Z-${probeTravelDistance} `;
    }

    if (command) {
      const gcode = `G38.2 ${command.trim()} F${feedRate}`;
      logActions.addLog({ type: 'info', message: `Sending probe command: ${gcode}` });
      connectionActions.sendLine(gcode);
    }
  };

  const handleUnitChange = (newUnit: "mm" | "in") => {
    settingsActions.setUnit(newUnit);
    connectionActions.sendLine(newUnit === "mm" ? "G21" : "G20");
  };

  const handleRunMacro = async (commands: string[]) => {
    machineActions.setIsMacroRunning(true);
    logActions.addLog({ type: "info", message: `Running macro...` });
    for (const command of commands) {
      if (command.trim()) {
        try {
          await connectionActions.sendLine(command);
        } catch (error) {
          // Error is already logged by the connection store
          break; // Stop macro on error
        }
      }
    }
    logActions.addLog({ type: "info", message: "Macro finished." });
    machineActions.setIsMacroRunning(false);
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
    <div className="min-h-screen bg-background font-sans text-text-primary flex flex-col">
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
        onTrySimulator={() => {}}
        isMachineSetupComplete={!!machineSettings.isConfigured}
        isToolLibrarySetupComplete={toolLibrary.length > 0}
      />
      <NotificationContainer
        notifications={notifications}
        onDismiss={() => {}}
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
        onSave={() => {}}
        onDelete={() => {}}
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
        onResetDialogs={() => {}}
        onExport={() => {}}
        onImport={() => {}}
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

      <header className="bg-surface shadow-md p-4 flex justify-between items-center z-10 flex-shrink-0 gap-4">
        <div className="flex items-center gap-4">{/* Logo */}</div>
        <div className="flex items-center gap-4">
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
            isSimulated={isSimulated}
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
        onEmergencyStop={handleEmergencyStop}
        flashingButton={flashingButton}
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
            className={`ml-4 flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background transition-all duration-100 ${
              flashingButton === "unlock-button"
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

      <main className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <div className="min-h-[60vh] lg:min-h-0">
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
            timeEstimate={timeEstimate}
            machineSettings={machineSettings}
            toolLibrary={toolLibrary}
            selectedToolId={selectedToolId}
            onToolSelect={setSelectedToolId}
            onOpenGenerator={uiActions.openGCodeModal}
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
            onStepChange={settingsActions.setJogStep}
            flashingButton={flashingButton}
            onFlash={handleFlash}
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
            onOpenEditor={uiActions.openMacroEditor}
            isEditMode={isMacroEditMode}
            onToggleEditMode={() => setIsMacroEditMode((prev) => !prev)}
            disabled={isJobActive}
          />
          <Console
            logs={logs}
            onSendCommand={handleManualCommand}
            isConnected={isConnected}
            isJobActive={isJobActive}
            isMacroRunning={isMacroRunning}
            isLightMode={isLightMode}
            isVerbose={isVerbose}
            onVerboseChange={logActions.setIsVerbose}
          />
        </div>
      </main>
      <Footer onContactClick={uiActions.openContactModal} />
    </div>
  );
};

export default App;
