import React, { useState, memo, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Pin,
  RotateCw,
  RotateCcw,
  PowerOff,
  Probe,
  ProbeX,
  ProbeY,
  ProbeXY,
  Home,
  HomeX,
  HomeY,
  HomeZ,
  HomeXY,
  Crosshair,
  CrosshairXY,
  CrosshairX,
  CrosshairY,
  CrosshairZ,
} from "@mycnc/shared";
import { MachineState, MachineSettings, JobStatus } from "@mycnc/shared";
import { JogManager, JogAxis, JogDirection } from "../services/JogManager";
import { useGamepad } from "../hooks/useGamepad";

interface JogPanelProps {
  isConnected: boolean;
  machineState: MachineState | null;
  machineSettings: MachineSettings | null;
  isHomed: boolean;
  onJog: (axis: string, direction: number, step: number, feedRate?: number) => void;
  onJogStop: () => void;
  onHome: (axes: "all" | "x" | "y" | "z" | "xy") => void;
  onSetZero: (axes: "all" | "x" | "y" | "z" | "xy") => void;
  onSpindleCommand: (command: "cw" | "ccw" | "off", speed: number) => void;
  onProbe: (axes: string) => void;
  onSendCommand: (command: string) => void;
  jogStep: number;
  onStepChange: (step: number) => void;
  flashingButton: string | null;
  onFlash: (buttonId: string) => void;
  unit: "mm" | "in";
  onUnitChange: (unit: "mm" | "in") => void;
  isJobActive: boolean;
  isJogging: boolean;
  isMacroRunning: boolean;
  jogFeedRate: number;
  jobStatus?: string; // Add jobStatus prop
}

interface JogButtonProps {
  id: string;
  axis: string;
  direction: number;
  icon: React.ReactNode;
  label: string;
  hotkey: string;
  isControlDisabled: boolean;
  isZJogDisabledForStep: boolean;
  unit: "mm" | "in";
  flashingButton: string | null;
  onFlash: (id: string) => void;
  onStartJog: (axis: string, direction: number) => void;
  onStopJog: (axis: string, direction: number) => void;
}

const JogButton: React.FC<JogButtonProps> = memo(({
  id,
  axis,
  direction,
  icon,
  label,
  hotkey,
  isControlDisabled,
  isZJogDisabledForStep,
  unit,
  flashingButton,
  onFlash,
  onStartJog,
  onStopJog,
}) => {
  const isZButton = axis === "Z";
  const isDisabled = isControlDisabled || (isZButton && isZJogDisabledForStep);

  let title = `${label} (${axis}${direction > 0 ? "+" : "-"
    }) (Hotkey: ${hotkey})`;
  if (isZButton && isZJogDisabledForStep) {
    title = `Z-Jog disabled for step size > ${unit === "mm" ? "10mm" : "1in"
      }`;
  }

  const handleMouseDown = () => {
    if (isDisabled) return;
    onFlash(id);
    onStartJog(axis, direction);
  };

  const handleMouseUp = () => {
    if (isDisabled) return;
    onFlash("");
    onStopJog(axis, direction);
  };

  const handleMouseLeave = () => {
    // If mouse leaves button while pressed, stop jogging
    if (isDisabled) return;
    onFlash("");
    onStopJog(axis, direction);
  };

  return (
    <button
      id={id}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      disabled={isDisabled}
      className={`flex items-center justify-center py-3 bg-secondary/80 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md ${flashingButton === id ? "ring-2 ring-white ring-inset bg-primary text-white" : "text-text-primary"
        }`}
      title={title}
    >
      {icon}
    </button>
  );
});

const JogPanel: React.FC<JogPanelProps> = memo(
  ({
    isConnected,
    machineState,
    machineSettings,
    isHomed,
    onJog,
    onJogStop,
    onHome,
    onSetZero,
    onSpindleCommand,
    onProbe,
    jogStep,
    onStepChange,
    flashingButton,
    onFlash,
    unit,
    onUnitChange,
    isJobActive,
    isJogging,
    isMacroRunning,
    jogFeedRate,
    jobStatus,
  }) => {
    const { t } = useTranslation('translation') as any;
    const [spindleSpeed, setSpindleSpeed] = useState(1000);
    const pressedJogKey = useRef<string | null>(null);
    const jogManagerRef = useRef<JogManager | null>(null);
    const pressedKeys = useRef<Set<string>>(new Set());

    const isControlDisabled =
      !isConnected ||
      isJobActive ||
      isJogging ||
      isMacroRunning ||
      machineState?.status === "Alarm";

    const isProbeDisabled =
      isControlDisabled || machineState?.status !== "Idle";

    // Allow spindle control if paused, otherwise follow general disabled state
    const isSpindleDisabled = (!isConnected || (isJobActive && jobStatus !== JobStatus.Paused) || isJogging || isMacroRunning || machineState?.status === "Alarm");

    const isZJogDisabledForStep =
      (unit === "mm" && jogStep > 10) || (unit === "in" && jogStep > 1);

    const stepSizes =
      unit === "mm" ? [0.01, 0.1, 1, 10, 50] : [0.001, 0.01, 0.1, 1, 2];

    const jogHotkeys: { [key: string]: { axis: string; direction: number; id: string } } = {
      ArrowUp: { axis: "Y", direction: 1, id: "jog-y-plus" },
      ArrowDown: { axis: "Y", direction: -1, id: "jog-y-minus" },
      ArrowLeft: { axis: "X", direction: -1, id: "jog-x-minus" },
      ArrowRight: { axis: "X", direction: 1, id: "jog-x-plus" },
      PageUp: { axis: "Z", direction: 1, id: "jog-z-plus" },
      PageDown: { axis: "Z", direction: -1, id: "jog-z-minus" },
    };

    // Gamepad Integration
    const { gamepadState, applyDeadzone } = useGamepad();
    const activeGamepadJogs = useRef<{ [key: string]: boolean }>({});

    useEffect(() => {
      // Safety: If gamepad is disconnected or controls disabled, stop all active gamepad jogs
      if (!gamepadState || !gamepadState.connected || isControlDisabled) {
        let anyActive = false;
        Object.keys(activeGamepadJogs.current).forEach(key => {
          if (activeGamepadJogs.current[key]) {
            anyActive = true;
            activeGamepadJogs.current[key] = false;
          }
        });

        if (anyActive) {
          jogManagerRef.current?.cancelAllJogs();
          onFlash("");
        }
        return;
      }

      // Helper to get axis value
      const getAxisValue = (index: number, invert: boolean = false) => {
        const raw = gamepadState.axes[index];
        if (raw === undefined) return 0;
        const val = applyDeadzone(raw);
        return invert ? -val : val;
      };

      const xVal = getAxisValue(0);
      const yVal = getAxisValue(1, true); // Invert Y
      const zVal = getAxisValue(3, true); // Invert Z

      const threshold = 0.1;

      // Find dominant axis
      let maxMag = 0;
      let dominantAxis: 'X' | 'Y' | 'Z' | null = null;

      if (Math.abs(xVal) > maxMag) { maxMag = Math.abs(xVal); dominantAxis = 'X'; }
      if (Math.abs(yVal) > maxMag) { maxMag = Math.abs(yVal); dominantAxis = 'Y'; }
      if (Math.abs(zVal) > maxMag) { maxMag = Math.abs(zVal); dominantAxis = 'Z'; }

      if (maxMag < threshold) dominantAxis = null;

      // Update jogs
      const updateAxis = (axis: 'X' | 'Y' | 'Z', val: number, isDominant: boolean) => {
        const key = `axis-${axis}`;
        const wasActive = activeGamepadJogs.current[key];

        if (isDominant && Math.abs(val) > threshold) {
          const direction = val > 0 ? 1 : -1;
          const magnitude = Math.abs(val);
          const variableFeedRate = Math.max(jogFeedRate * magnitude, 10);

          if (!wasActive) {
            activeGamepadJogs.current[key] = true;
            jogManagerRef.current?.startAnalogJog(axis, direction, variableFeedRate);
            onFlash('gamepad-jog');
          } else {
            jogManagerRef.current?.startAnalogJog(axis, direction, variableFeedRate);
          }
        } else {
          if (wasActive) {
            activeGamepadJogs.current[key] = false;
            jogManagerRef.current?.stopJog(axis, 1, jogStep, jogFeedRate);
            onFlash("");
          }
        }
      };

      updateAxis('X', xVal, dominantAxis === 'X');
      updateAxis('Y', yVal, dominantAxis === 'Y');
      updateAxis('Z', zVal, dominantAxis === 'Z');

    }, [gamepadState, isControlDisabled, jogStep, jogFeedRate, applyDeadzone, onFlash]);

    // Initialize JogManager
    useEffect(() => {
      jogManagerRef.current = new JogManager({
        onSendJogCommand: (axis, direction, step, feedRate) => {
          onJog(axis, direction, step, feedRate);
        },
        onJogCancel: () => {
          onJogStop();
        },
        onAlarmDetected: () => {
          console.warn('JogManager: Alarm detected, all jogs cancelled');
        },
      });

      return () => {
        jogManagerRef.current?.destroy();
      };
    }, [onJog, onJogStop]);

    // Update machine state in JogManager for alarm monitoring
    useEffect(() => {
      jogManagerRef.current?.updateMachineState(machineState);
      if (machineSettings) {
        jogManagerRef.current?.setMachineSettings(machineSettings);
      }
      jogManagerRef.current?.setIsHomed(isHomed);
    }, [machineState, machineSettings, isHomed]);



    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return; // Don't jog if typing in an input field
        }

        // Handle step size hotkeys (1-5)
        if (['1', '2', '3', '4', '5'].includes(event.key) && !isControlDisabled) {
          event.preventDefault();
          const stepIndex = parseInt(event.key) - 1;
          const newStep = stepSizes[stepIndex];
          if (newStep !== undefined) {
            onFlash(`step-${newStep}`);
            onStepChange(newStep);
            setTimeout(() => onFlash(""), 150); // Clear flash after 150ms
          }
          return;
        }

        const hotkey = jogHotkeys[event.key];
        if (hotkey && !isControlDisabled) {
          event.preventDefault();

          // Prevent key repeat - only process first keydown
          if (pressedKeys.current.has(event.key)) {
            return;
          }
          pressedKeys.current.add(event.key);

          // Flash the button
          onFlash(hotkey.id);

          // Start jog (JogManager will determine tap vs hold)
          jogManagerRef.current?.startJog(
            hotkey.axis as JogAxis,
            hotkey.direction as JogDirection,
            jogStep,
            jogFeedRate
          );
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return;
        }

        const hotkey = jogHotkeys[event.key];
        if (hotkey) {
          // Remove from pressed keys
          pressedKeys.current.delete(event.key);

          // Clear flashing button
          onFlash("");

          // Stop jog (JogManager will determine if it was tap or hold)
          jogManagerRef.current?.stopJog(
            hotkey.axis as JogAxis,
            hotkey.direction as JogDirection,
            jogStep,
            jogFeedRate
          );
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [isControlDisabled, jogStep, onFlash, stepSizes, onStepChange, jogHotkeys, jogFeedRate]);

    const handleStartJog = useCallback((axis: string, direction: number) => {
      jogManagerRef.current?.startJog(
        axis as JogAxis,
        direction as JogDirection,
        jogStep,
        jogFeedRate
      );
    }, [jogStep, jogFeedRate]);

    const handleStopJog = useCallback((axis: string, direction: number) => {
      jogManagerRef.current?.stopJog(
        axis as JogAxis,
        direction as JogDirection,
        jogStep,
        jogFeedRate
      );
    }, [jogStep, jogFeedRate]);

    return (
      <div className="flex flex-col p-1 gap-2 h-full">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
          {/* Left Column: Jog + Homing */}
          <div className="flex flex-col gap-4">
            {/* Jog Controls */}
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-xl border border-white/10 shadow-md flex-grow flex flex-col justify-center">
              <h4 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                {t('jog.title')}
              </h4>
              <div className="grid grid-cols-3 grid-rows-3 gap-2 flex-grow">
                <div className="col-start-1 row-start-1"></div> {/* empty */}
                <JogButton
                  id="jog-y-plus"
                  axis="Y"
                  direction={1}
                  icon={<ArrowUp className="w-6 h-6" />}
                  label={t('jog.yPlus')}
                  hotkey="Up Arrow"
                  isControlDisabled={isControlDisabled}
                  isZJogDisabledForStep={isZJogDisabledForStep}
                  unit={unit}
                  flashingButton={flashingButton}
                  onFlash={onFlash}
                  onStartJog={handleStartJog}
                  onStopJog={handleStopJog}
                />
                <JogButton
                  id="jog-z-plus"
                  axis="Z"
                  direction={1}
                  icon={<ArrowUp className="w-6 h-6" />}
                  label={t('jog.zPlus')}
                  hotkey="Page Up"
                  isControlDisabled={isControlDisabled}
                  isZJogDisabledForStep={isZJogDisabledForStep}
                  unit={unit}
                  flashingButton={flashingButton}
                  onFlash={onFlash}
                  onStartJog={handleStartJog}
                  onStopJog={handleStopJog}
                />
                <JogButton
                  id="jog-x-minus"
                  axis="X"
                  direction={-1}
                  icon={<ArrowLeft className="w-6 h-6" />}
                  label={t('jog.xMinus')}
                  hotkey="Left Arrow"
                  isControlDisabled={isControlDisabled}
                  isZJogDisabledForStep={isZJogDisabledForStep}
                  unit={unit}
                  flashingButton={flashingButton}
                  onFlash={onFlash}
                  onStartJog={handleStartJog}
                  onStopJog={handleStopJog}
                />
                <div className="col-start-2 row-start-2 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center shadow-inner">
                    <Pin className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <JogButton
                  id="jog-x-plus"
                  axis="X"
                  direction={1}
                  icon={<ArrowRight className="w-6 h-6" />}
                  label={t('jog.xPlus')}
                  hotkey="Right Arrow"
                  isControlDisabled={isControlDisabled}
                  isZJogDisabledForStep={isZJogDisabledForStep}
                  unit={unit}
                  flashingButton={flashingButton}
                  onFlash={onFlash}
                  onStartJog={handleStartJog}
                  onStopJog={handleStopJog}
                />
                <div className="col-start-1 row-start-3"></div> {/* empty */}
                <JogButton
                  id="jog-y-minus"
                  axis="Y"
                  direction={-1}
                  icon={<ArrowDown className="w-6 h-6" />}
                  label={t('jog.yMinus')}
                  hotkey="Down Arrow"
                  isControlDisabled={isControlDisabled}
                  isZJogDisabledForStep={isZJogDisabledForStep}
                  unit={unit}
                  flashingButton={flashingButton}
                  onFlash={onFlash}
                  onStartJog={handleStartJog}
                  onStopJog={handleStopJog}
                />
                <JogButton
                  id="jog-z-minus"
                  axis="Z"
                  direction={-1}
                  icon={<ArrowDown className="w-6 h-6" />}
                  label={t('jog.zMinus')}
                  hotkey="Page Down"
                  isControlDisabled={isControlDisabled}
                  isZJogDisabledForStep={isZJogDisabledForStep}
                  unit={unit}
                  flashingButton={flashingButton}
                  onFlash={onFlash}
                  onStartJog={handleStartJog}
                  onStopJog={handleStopJog}
                />
              </div>
              <div className="flex justify-around items-center mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xs font-bold text-text-secondary whitespace-nowrap">{t('jog.step')}</span>
                  <div className="flex gap-1 w-full">
                    {stepSizes.map((step, index) => (
                      <button
                        key={step}
                        id={`step-${step}`}
                        onClick={() => onStepChange(step)}
                        disabled={isControlDisabled}
                        className={`flex-1 py-2 text-xs rounded-md transition-all relative font-mono ${jogStep === step
                          ? "bg-primary text-white font-bold shadow-md"
                          : "bg-secondary/80 hover:bg-secondary text-text-secondary hover:text-text-primary"
                          } ${flashingButton === `step-${step}`
                            ? "ring-2 ring-white ring-inset"
                            : ""
                          } disabled:opacity-50 disabled:cursor-not-allowed border border-white/5`}
                        title={`${t('jog.stepSize')} ${step} (Hotkey: ${index + 1})`}
                      >
                        <span className="absolute -top-1 -right-1 text-[8px] opacity-40 font-sans">
                          {index + 1}
                        </span>
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Homing Controls (Moved here) */}
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-xl border border-white/10 shadow-md">
              <h4 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                {t('jog.homing.title')}
              </h4>
              <div className="grid grid-cols-5 gap-2 text-sm">
                <button
                  onClick={() => onHome("all")}
                  disabled={isControlDisabled}
                  className="p-3 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 font-bold flex items-center justify-center transition-all hover:shadow-md active:scale-95 text-text-primary"
                  title={t('jog.homing.all')}
                >
                  <Home className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onHome("x")}
                  disabled={isControlDisabled}
                  className="p-3 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 font-bold flex items-center justify-center transition-all hover:shadow-md active:scale-95 text-text-primary"
                  title={t('jog.homing.x')}
                >
                  <HomeX className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onHome("y")}
                  disabled={isControlDisabled}
                  className="p-3 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 font-bold flex items-center justify-center transition-all hover:shadow-md active:scale-95 text-text-primary"
                  title={t('jog.homing.y')}
                >
                  <HomeY className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onHome("z")}
                  disabled={isControlDisabled}
                  className="p-3 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 font-bold flex items-center justify-center transition-all hover:shadow-md active:scale-95 text-text-primary"
                  title={t('jog.homing.z')}
                >
                  <HomeZ className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onHome("xy")}
                  disabled={isControlDisabled}
                  className="p-3 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 font-bold flex items-center justify-center transition-all hover:shadow-md active:scale-95 text-text-primary"
                  title={t('jog.homing.xy')}
                >
                  <HomeXY className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Spindle, Zero, Probe, Units */}
          <div className="flex flex-col gap-2">
            {/* Spindle Controls */}
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-xl border border-white/10 shadow-md">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  {t('jog.spindle.title')}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-24 flex-shrink-0">
                  <input
                    type="number"
                    value={spindleSpeed}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSpindleSpeed(parseInt(e.target.value, 10))
                    }
                    disabled={isSpindleDisabled}
                    className="w-full bg-secondary/50 border border-white/10 rounded-lg py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 font-mono text-right pr-8"
                    aria-label="Spindle Speed in RPM"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-secondary pointer-events-none">RPM</span>
                </div>
                <div className="flex gap-1 flex-grow justify-end">
                  <button
                    title={t('jog.spindle.cw')}
                    onClick={() => onSpindleCommand("cw", spindleSpeed)}
                    disabled={isSpindleDisabled}
                    className="p-2 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 flex justify-center transition-all hover:shadow-md active:scale-95 text-text-primary hover:text-accent-green flex-1"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  <button
                    title={t('jog.spindle.ccw')}
                    onClick={() => onSpindleCommand("ccw", spindleSpeed)}
                    disabled={isSpindleDisabled}
                    className="p-2 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 flex justify-center transition-all hover:shadow-md active:scale-95 text-text-primary hover:text-accent-yellow flex-1"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    title={t('jog.spindle.off')}
                    onClick={() => onSpindleCommand("off", 0)}
                    disabled={isSpindleDisabled}
                    className="p-2 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 flex justify-center transition-all hover:shadow-md active:scale-95 text-text-primary hover:text-accent-red flex-1"
                  >
                    <PowerOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Zeroing Controls */}
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-xl border border-white/10 shadow-md">
              <h4 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                {t('jog.zero.title')}
              </h4>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => onSetZero("all")}
                    disabled={isControlDisabled}
                    className="p-3 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 font-bold flex items-center justify-center transition-all hover:shadow-md active:scale-95 text-text-primary"
                    title={t('jog.zero.all')}
                  >
                    <Crosshair className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onSetZero("x")}
                    disabled={isControlDisabled}
                    className="p-3 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 font-bold flex items-center justify-center transition-all hover:shadow-md active:scale-95 text-text-primary"
                    title={t('jog.zero.x')}
                  >
                    <CrosshairX className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onSetZero("y")}
                    disabled={isControlDisabled}
                    className="p-3 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 font-bold flex items-center justify-center transition-all hover:shadow-md active:scale-95 text-text-primary"
                    title={t('jog.zero.y')}
                  >
                    <CrosshairY className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onSetZero("z")}
                    disabled={isControlDisabled}
                    className="p-3 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 font-bold flex items-center justify-center transition-all hover:shadow-md active:scale-95 text-text-primary"
                    title={t('jog.zero.z')}
                  >
                    <CrosshairZ className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onSetZero("xy")}
                    disabled={isControlDisabled}
                    className="p-3 bg-secondary/80 rounded-lg hover:bg-secondary border border-white/10 disabled:opacity-50 font-bold flex items-center justify-center transition-all hover:shadow-md active:scale-95 text-text-primary"
                    title={t('jog.zero.xy')}
                  >
                    <CrosshairXY className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Probe Controls */}
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-xl border border-white/10 shadow-md">
              <h4 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                {t('jog.probe.title')}
              </h4>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <button
                  onClick={() => onProbe("X")}
                  disabled={isProbeDisabled}
                  className="p-3 bg-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/30 border border-primary/30 disabled:opacity-50 flex items-center justify-center transition-all hover:shadow-md active:scale-95"
                  title={t('jog.probe.x')}
                >
                  <ProbeX className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onProbe("Y")}
                  disabled={isProbeDisabled}
                  className="p-3 bg-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/30 border border-primary/30 disabled:opacity-50 flex items-center justify-center transition-all hover:shadow-md active:scale-95"
                  title={t('jog.probe.y')}
                >
                  <ProbeY className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onProbe("Z")}
                  disabled={isProbeDisabled}
                  className="p-3 bg-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/30 border border-primary/30 disabled:opacity-50 flex items-center justify-center gap-1 transition-all hover:shadow-md active:scale-95"
                  title={t('jog.probe.z')}
                >
                  <Probe className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onProbe("XY")}
                  disabled={isProbeDisabled}
                  className="p-3 bg-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/30 border border-primary/30 disabled:opacity-50 flex items-center justify-center transition-all hover:shadow-md active:scale-95"
                  title={t('jog.probe.xy')}
                >
                  <ProbeXY className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Units Controls */}
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-xl border border-white/10 shadow-md mt-auto">
              <h4 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                {t('jog.units.title')}
              </h4>
              <div className="flex bg-secondary/50 rounded-lg p-1 border border-white/5">
                <button
                  onClick={() => onUnitChange("mm")}
                  disabled={isControlDisabled}
                  className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-all ${unit === "mm"
                    ? "bg-primary text-white shadow-sm"
                    : "hover:bg-secondary text-text-secondary hover:text-text-primary"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  mm
                </button>
                <button
                  onClick={() => onUnitChange("in")}
                  disabled={isControlDisabled}
                  className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-all ${unit === "in"
                    ? "bg-primary text-white shadow-sm"
                    : "hover:bg-secondary text-text-secondary hover:text-text-primary"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    );
  }
);

export default JogPanel;
