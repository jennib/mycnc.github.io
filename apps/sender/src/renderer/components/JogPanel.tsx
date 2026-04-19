import React, { useState, memo, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  RotateCw,
  RotateCcw,
  PowerOff,
  Probe,
  ProbeX,
  ProbeY,
  ProbeXY,
  ProbeXYZ,
  Home,
  Target,
} from "@mycnc/shared";
import { MachineState, MachineSettings, JobStatus } from "@mycnc/shared";
import { JogManager, JogAxis, JogDirection } from "../services/JogManager";
import { useGamepad } from "../hooks/useGamepad";
import NumberInput from "./ui/NumberInput";

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
  onXYZProbe: () => void;
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
  jobStatus?: JobStatus; // Add jobStatus prop
}

const getAxisColor = (axis: string) => {
  if (axis === "X") return "text-rose-400";
  if (axis === "Y") return "text-emerald-400";
  return "text-sky-400"; // Z
};

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

  const getButtonColor = () => {
    if (isDisabled) return "bg-secondary border border-white/10 text-text-secondary opacity-50";
    if (axis === "Z") return "bg-secondary border border-white/20 text-text-primary hover:bg-secondary-focus";
    return "bg-primary border border-primary text-white hover:bg-primary-focus";
  };

  return (
    <button
      id={id}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      disabled={isDisabled}
      className={`flex items-center justify-center py-4 rounded-lg border transition-all active:scale-95 shadow-md ${getButtonColor()} ${flashingButton === id ? "ring-2 ring-white ring-inset shadow-[0_0_15px_rgba(255,255,255,0.4)]" : ""
        }`}
      title={title}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          {icon}
        </div>
        <span className={`text-[9px] font-bold leading-none ${getAxisColor(axis)} drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]`}>
          {axis}{direction > 0 ? "+" : "−"}
        </span>
      </div>
    </button>
  );
});

interface TimedButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  disabled: boolean;
  title: string;
  id?: string;
  className?: string; // Optional className for custom styling
  label?: string; // Axis label shown below icon
}

const TimedButton: React.FC<TimedButtonProps> = memo(({
  onClick,
  icon,
  disabled,
  title,
  id,
  className = "btn btn-secondary btn-icon",
  label,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTimer = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    
    // Prevent default to avoid context menus or other touch behaviors
    if (e.type === 'touchstart') {
      // e.preventDefault(); // This might block scrolling if not careful, but for this button it's fine
    }

    setIsPressing(true);
    startTimeRef.current = Date.now();
    setProgress(0);
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = (elapsed / 3000) * 100;
      
      if (p >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setProgress(100);
        onClick();
        
        // Brief visual confirmation
        setTimeout(() => {
          setIsPressing(false);
          setProgress(0);
        }, 300);
      } else {
        setProgress(p);
      }
    }, 50);
  }, [disabled, onClick]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
    setProgress(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <button
      id={id}
      onMouseDown={startTimer}
      onMouseUp={stopTimer}
      onMouseLeave={stopTimer}
      onTouchStart={startTimer}
      onTouchEnd={stopTimer}
      onContextMenu={(e) => e.preventDefault()}
      disabled={disabled}
      className={`${className} relative overflow-hidden ${isPressing ? 'scale-[0.97] ring-1 ring-primary/50' : ''}`}
      title={title}
    >
      <div className={`relative z-10 transition-transform duration-200 ${isPressing ? 'scale-110' : ''} flex flex-col items-center gap-0.5`}>
        {icon}
        {label && <span className="text-[9px] font-bold leading-none text-text-secondary">{label}</span>}
      </div>
      
      {/* Background Pulse Effect when pressing */}
      {isPressing && (
        <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
      )}
      
      {/* Progress Bar at top */}
      <div 
        className="absolute top-0 left-0 h-1 bg-primary shadow-[0_0_10px_rgba(56,189,248,0.8)] z-20 transition-all duration-75 ease-linear"
        style={{ width: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
      />
      
      {/* Tinted Overlay during progress */}
      <div 
        className="absolute inset-0 bg-primary/5 pointer-events-none transition-opacity duration-200"
        style={{ opacity: progress / 100 }}
      />
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
    onXYZProbe,
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

    // Jog buttons must NOT be disabled while isJogging — they need to receive
    // the mouseUp/mouseLeave event to stop continuous jogging.
    const isJogButtonDisabled =
      !isConnected ||
      isJobActive ||
      isMacroRunning ||
      machineState?.status === "Alarm";

    // Everything else (probing, zeroing, homing) is disabled while jogging.
    const isControlDisabled = isJogButtonDisabled || isJogging;

    const isProbeDisabled =
      isControlDisabled || machineState?.status !== "Idle";

    // Allow spindle control if paused, otherwise follow general disabled state
    const isSpindleDisabled = (!isConnected || (isJobActive && jobStatus !== JobStatus.Paused) || isJogging || isMacroRunning || machineState?.status === "Alarm");

    const isZJogDisabledForStep =
      (unit === "mm" && jogStep > 10) || (unit === "in" && jogStep > 1);

    const stepSizes =
      unit === "mm" ? [0.01, 0.1, 1, 10, 50] : [0.001, 0.01, 0.1, 1, 2];

    const getScaledFeedRate = useCallback((step: number, maxFeed: number, unit: "mm" | "in"): number => {
      if (unit === "mm") {
        if (step <= 0.01) return Math.max(maxFeed * 0.05, 50);
        if (step <= 0.1) return Math.max(maxFeed * 0.2, 100);
        if (step <= 1.0) return Math.max(maxFeed * 0.5, 400);
        return maxFeed;
      } else {
        // Inch scaling
        if (step <= 0.001) return Math.max(maxFeed * 0.05, 2);
        if (step <= 0.01) return Math.max(maxFeed * 0.2, 4);
        if (step <= 0.1) return Math.max(maxFeed * 0.5, 15);
        return maxFeed;
      }
    }, []);

    const scaledJogFeedRate = useMemo(() =>
      getScaledFeedRate(jogStep, jogFeedRate, unit),
      [getScaledFeedRate, jogStep, jogFeedRate, unit]);

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
        if (hotkey && !isJogButtonDisabled) {
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
            scaledJogFeedRate,
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
            scaledJogFeedRate
          );
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [isJogButtonDisabled, jogStep, onFlash, stepSizes, onStepChange, jogHotkeys, jogFeedRate]);

    const handleStartJog = useCallback((axis: string, direction: number) => {
      jogManagerRef.current?.startJog(
        axis as JogAxis,
        direction as JogDirection,
        jogStep,
        scaledJogFeedRate,
        jogFeedRate
      );
    }, [jogStep, scaledJogFeedRate, jogFeedRate]);

    const handleStopJog = useCallback((axis: string, direction: number) => {
      jogManagerRef.current?.stopJog(
        axis as JogAxis,
        direction as JogDirection,
        jogStep,
        scaledJogFeedRate
      );
    }, [jogStep, scaledJogFeedRate]);

    return (
      <div className="flex flex-col p-1 gap-2 h-full">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
          {/* Left Column: Jog + Homing */}
          <div className="flex flex-col gap-4">
            {/* Jog Controls */}
            <div className="bg-surface p-4 rounded-lg border border-white/5 shadow-md flex-grow flex flex-col justify-center">
              <h4 className="text-[10px] font-black text-text-secondary mb-4 uppercase tracking-[0.2em] opacity-50">
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
                  isControlDisabled={isJogButtonDisabled}
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
                  isControlDisabled={isJogButtonDisabled}
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
                  isControlDisabled={isJogButtonDisabled}
                  isZJogDisabledForStep={isZJogDisabledForStep}
                  unit={unit}
                  flashingButton={flashingButton}
                  onFlash={onFlash}
                  onStartJog={handleStartJog}
                  onStopJog={handleStopJog}
                />
                  <div className="col-start-2 row-start-2 flex items-center justify-center">
                  <button
                    onClick={onJogStop}
                    title="Stop jog"
                    className="w-12 h-12 rounded-full bg-accent-red border-2 border-accent-red text-white flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all"
                  >
                    <div className="w-4 h-4 rounded-sm bg-white" />
                  </button>
                </div>
                <JogButton
                  id="jog-x-plus"
                  axis="X"
                  direction={1}
                  icon={<ArrowRight className="w-6 h-6" />}
                  label={t('jog.xPlus')}
                  hotkey="Right Arrow"
                  isControlDisabled={isJogButtonDisabled}
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
                  isControlDisabled={isJogButtonDisabled}
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
                  isControlDisabled={isJogButtonDisabled}
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
                        onContextMenu={(e) => e.preventDefault()}
                        disabled={isControlDisabled}
                        className={`flex-1 py-2 text-xs rounded-md transition-all relative font-mono ${jogStep === step
                          ? "bg-primary text-white font-bold shadow-md"
                          : "bg-secondary/20 hover:bg-secondary/40 text-text-secondary hover:text-text-primary"
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
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-md">
              <h4 className="text-xs font-bold text-text-primary mb-2 uppercase tracking-wider opacity-80">
                {t('jog.homing.title')}
              </h4>
              <div className={`grid gap-2 text-sm ${machineSettings?.controllerType === "grbl" ? "grid-cols-1" : "grid-cols-5"}`}>
                <TimedButton
                  onClick={() => onHome("all")}
                  disabled={isControlDisabled}
                  icon={<Home className="w-5 h-5" />}
                  title={t('jog.homing.all')}
                  label="All"
                  className="btn btn-secondary py-2 px-1 flex-col gap-1"
                />
                {machineSettings?.controllerType !== "grbl" && (
                  <>
                    <TimedButton
                      onClick={() => onHome("x")}
                      disabled={isControlDisabled}
                      icon={<Home className="w-5 h-5" />}
                      title={t('jog.homing.x')}
                      label="X"
                      className="btn btn-secondary py-2 px-1 flex-col gap-1"
                    />
                    <TimedButton
                      onClick={() => onHome("y")}
                      disabled={isControlDisabled}
                      icon={<Home className="w-5 h-5" />}
                      title={t('jog.homing.y')}
                      label="Y"
                      className="btn btn-secondary py-2 px-1 flex-col gap-1"
                    />
                    <TimedButton
                      onClick={() => onHome("z")}
                      disabled={isControlDisabled}
                      icon={<Home className="w-5 h-5" />}
                      title={t('jog.homing.z')}
                      label="Z"
                      className="btn btn-secondary py-2 px-1 flex-col gap-1"
                    />
                    <TimedButton
                      onClick={() => onHome("xy")}
                      disabled={isControlDisabled}
                      icon={<Home className="w-5 h-5" />}
                      title={t('jog.homing.xy')}
                      label="XY"
                      className="btn btn-secondary py-2 px-1 flex-col gap-1"
                    />
                  </>
                )}
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
                <div className="relative w-32 flex-shrink-0">
                  <NumberInput
                    value={spindleSpeed}
                    onChange={(val) => setSpindleSpeed(parseInt(val, 10) || 0)}
                    disabled={isSpindleDisabled}
                    min={0}
                    step={100}
                    unit="RPM"
                    label={t('jog.spindle.title')}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-1 flex-grow justify-end">
                  <button
                    title={t('jog.spindle.cw')}
                    onClick={() => onSpindleCommand("cw", spindleSpeed)}
                    onContextMenu={(e) => e.preventDefault()}
                    disabled={isSpindleDisabled}
                    className="btn btn-secondary btn-icon hover:text-accent-green flex-1"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  <button
                    title={t('jog.spindle.ccw')}
                    onClick={() => onSpindleCommand("ccw", spindleSpeed)}
                    onContextMenu={(e) => e.preventDefault()}
                    disabled={isSpindleDisabled}
                    className="btn btn-secondary btn-icon hover:text-accent-yellow flex-1"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    title={t('jog.spindle.off')}
                    onClick={() => onSpindleCommand("off", 0)}
                    onContextMenu={(e) => e.preventDefault()}
                    disabled={isSpindleDisabled}
                    className="btn btn-secondary btn-icon hover:text-accent-red flex-1"
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
              <div className="grid grid-cols-5 gap-2 text-sm">
                <TimedButton
                  onClick={() => onSetZero("all")}
                  disabled={isControlDisabled}
                  title={t('jog.zero.all')}
                  icon={<Crosshair className="w-5 h-5" />}
                  label="All"
                  className="btn btn-secondary py-2 px-1 flex-col gap-1"
                />
                <TimedButton
                  onClick={() => onSetZero("x")}
                  disabled={isControlDisabled}
                  title={t('jog.zero.x')}
                  icon={<Crosshair className="w-5 h-5" />}
                  label="X"
                  className="btn btn-secondary py-2 px-1 flex-col gap-1"
                />
                <TimedButton
                  onClick={() => onSetZero("y")}
                  disabled={isControlDisabled}
                  title={t('jog.zero.y')}
                  icon={<Crosshair className="w-5 h-5" />}
                  label="Y"
                  className="btn btn-secondary py-2 px-1 flex-col gap-1"
                />
                <TimedButton
                  onClick={() => onSetZero("z")}
                  disabled={isControlDisabled}
                  title={t('jog.zero.z')}
                  icon={<Crosshair className="w-5 h-5" />}
                  label="Z"
                  className="btn btn-secondary py-2 px-1 flex-col gap-1"
                />
                <TimedButton
                  onClick={() => onSetZero("xy")}
                  disabled={isControlDisabled}
                  title={t('jog.zero.xy')}
                  icon={<Crosshair className="w-5 h-5" />}
                  label="XY"
                  className="btn btn-secondary py-2 px-1 flex-col gap-1"
                />
              </div>
            </div>

            {/* Probe Controls */}
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-md">
              <h4 className="text-xs font-bold text-text-primary mb-2 uppercase tracking-wider opacity-80">
                {t('jog.probe.title')}
              </h4>
              <div className="grid grid-cols-5 gap-1.5 text-sm">
                {([
                  { axis: "X", icon: <ProbeX className="w-5 h-5" />, onClick: () => onProbe("X"), title: t('jog.probe.x') },
                  { axis: "Y", icon: <ProbeY className="w-5 h-5" />, onClick: () => onProbe("Y"), title: t('jog.probe.y') },
                  { axis: "Z", icon: <Probe className="w-5 h-5" />, onClick: () => onProbe("Z"), title: t('jog.probe.z') },
                  { axis: "XY", icon: <ProbeXY className="w-5 h-5" />, onClick: () => onProbe("XY"), title: t('jog.probe.xy') },
                  { axis: "XYZ", icon: <ProbeXYZ className="w-5 h-5" />, onClick: () => onXYZProbe(), title: t('jog.probe.xyz') },
                ] as { axis: string; icon: React.ReactNode; onClick: () => void; title: string }[]).map(({ axis, icon, onClick, title }) => (
                  <button
                    key={axis}
                    onClick={onClick}
                    disabled={isProbeDisabled}
                    className="btn btn-secondary flex-col py-2 px-1 gap-1 aspect-auto"
                    title={title}
                  >
                    {icon}
                    <span className="text-[9px] font-bold leading-none text-text-secondary">{axis}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  // Need to dynamically import or just use store outside, but we can just require uiStore
                  import('../stores/uiStore').then(({ useUIStore }) => {
                    useUIStore.getState().actions.openStockAlignmentWizard();
                  });
                }}
                disabled={isProbeDisabled}
                className="btn btn-info w-full mt-2"
              >
                <Target className="w-4 h-4" /> Stock Alignment Wizard
              </button>
              <button
                onClick={() => {
                  import('../stores/uiStore').then(({ useUIStore }) => {
                    useUIStore.getState().actions.openTranslateToOriginModal();
                  });
                }}
                className="btn btn-secondary w-full mt-2"
              >
                <Crosshair className="w-4 h-4" /> Translate to Origin
              </button>
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
