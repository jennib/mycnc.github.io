import React, { useState, useCallback, useRef, useEffect } from "react";

import { JobStatus, Tool } from "./types";
import GCodePanel from "./components/GCodePanel";
import Console from "./components/Console";
import JogPanel from "./components/JogPanel";
import MacrosPanel from "./components/MacrosPanel";
import WebcamPanel from "./components/WebcamPanel";
import { NotificationContainer } from "./components/Notification";
import StatusBar from "./components/StatusBar";
import {
  AlertTriangle,
  OctagonAlert,
  Unlock,
} from "./components/Icons";
import { Analytics } from "@vercel/analytics/react";
import Footer from "./components/Footer";
import { GRBL_ALARM_CODES } from "./constants";
import { useUIStore } from "./stores/uiStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useConnectionStore } from "./stores/connectionStore";
import { useMachineStore } from "./stores/machineStore";
import { useJob } from "./hooks/useJob";
import { useHotkeys } from "./hooks/useHotkeys";
import { useFlashingButton } from "./hooks/useFlashingButton";
import { useLogStore } from "./stores/logStore";
import { Tour } from "./components/Tour";
import { EVENTS } from 'react-joyride';
import Header from "./components/Header";
import AppModals from "./AppModals";
import Alerts from "./components/Alerts";

const App: React.FC = () => {
  const machineState = useMachineStore((state) => state.machineState);
  const isJogging = useMachineStore((state) => state.isJogging);
  const isMacroRunning = useMachineStore((state) => state.isMacroRunning);
  const handleSetZero = useMachineStore((state) => state.actions.handleSetZero);
  const handleSpindleCommand = useMachineStore((state) => state.actions.handleSpindleCommand);
  const handleProbe = useMachineStore((state) => state.actions.handleProbe);
  const handleJog = useMachineStore((state) => state.actions.handleJog);
  const handleJogStop = useMachineStore((state) => state.actions.handleJogStop);
  const handleRunMacro = useMachineStore((state) => state.actions.handleRunMacro);
  const handleManualCommand = useMachineStore((state) => state.actions.handleManualCommand);
  const handleUnitChange = useMachineStore((state) => state.actions.handleUnitChange);
  const handleHome = useMachineStore((state) => state.actions.handleHome);

  const {
    gcodeLines,
    fileName,
    jobStatus,
    progress,
    timeEstimate,
    jobActions,
    handleJobControl,
  } = useJob();

  // UI Store
  const {
    isTourOpen,
    selectedToolId,
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
    actions: settingsActions,
  } = useSettingsStore((state) => state);

  // Connection Store
  const {
    isConnected,
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

  const { flashingButton, handleFlash } = useFlashingButton();

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

  useHotkeys({
    handleEmergencyStop: connectionActions.emergencyStop,
    handleManualCommand,
    handleJogStop,
  });



  const alarmInfo =
    machineState?.status === "Alarm"
      ? GRBL_ALARM_CODES[machineState!.code!] || GRBL_ALARM_CODES.default
      : null;
  const isJobActive =
    jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused;

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary flex flex-col">
      {!window.electronAPI?.isElectron && <Analytics />}
      <AppModals />
      <NotificationContainer
        notifications={notifications}
        onDismiss={() => {}}
      />
      
      <Header
        isSerialApiSupported={isSerialApiSupported}
        useSimulator={useSimulator}
        setUseSimulator={setUseSimulator}
      />

      <StatusBar
        isConnected={isConnected}
        machineState={machineState}
        unit={unit}
        onEmergencyStop={connectionActions.emergencyStop}
        flashingButton={flashingButton}
      />

      <Alerts
        alarmInfo={alarmInfo}
        isSerialApiSupported={isSerialApiSupported}
        useSimulator={useSimulator}
        error={error}
        flashingButton={flashingButton}
        handleManualCommand={handleManualCommand}
        setError={setError}
      />

      <main className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <div className="min-h-[60vh] lg:min-h-0 gcode-panel">
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
            onFeedOverride={connectionActions.feedOverride}
            timeEstimate={timeEstimate}
            machineSettings={machineSettings}
            toolLibrary={toolLibrary}
            selectedToolId={selectedToolId}
            onToolSelect={uiActions.setSelectedToolId}
            onOpenGenerator={uiActions.openGCodeModal}
            isSimulated={useSimulator}
          />
        </div>
        <div className="flex flex-col gap-4 overflow-hidden min-h-0">
          <JogPanel
            className="jog-panel"
            isConnected={isConnected}
            machineState={machineState}
            onJog={handleJog}
            onHome={() => handleHome('all')}
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
      <Tour
        run={isTourOpen}
        callback={(data) => {
          const { status, type } = data;
          const finishedStatuses: string[] = [EVENTS.FINISHED, EVENTS.SKIPPED];
          if (finishedStatuses.includes(type)) {
            uiActions.closeTour();
          }
        }}
      />
    </div>
  );
};

export default App;

