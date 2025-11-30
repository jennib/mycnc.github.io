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
} from "./Icons";
import { MachineState, MachineSettings, JobStatus } from "../types";
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
      className={`flex items-center justify-center p-2 bg-secondary rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed ${flashingButton === id ? "ring-4 ring-white ring-inset" : ""
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
    const { t } = useTranslation();
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
      <div className="bg-surface rounded-lg shadow-lg flex flex-col p-1 gap-1">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {/* Jog Controls */}
          <div className="bg-background p-1 rounded-md">
            <h4 className="text-xs font-bold text-text-secondary mb-1 text-center">
              {t('jog.title')}
            </h4>
            <div className="grid grid-cols-3 grid-rows-3 gap-1">
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
                <Pin className="w-8 h-8 text-text-secondary" />
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
            <div className="flex justify-around items-center mt-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">{t('jog.step')}</span>
                <div className="flex gap-1">
                  {stepSizes.map((step, index) => (
                    <button
                      key={step}
                      id={`step-${step}`}
                      onClick={() => onStepChange(step)}
                      disabled={isControlDisabled}
                      className={`px-2 py-1 text-xs rounded-md transition-colors relative ${jogStep === step
                        ? "bg-primary text-white font-bold"
                        : "bg-secondary hover:bg-secondary-focus"
                        } ${flashingButton === `step-${step}`
                          ? "ring-2 ring-white ring-inset"
                          : ""
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={`${t('jog.stepSize')} ${step} (Hotkey: ${index + 1})`}
                    >
                      <span className="absolute -top-1 -right-1 text-[8px] opacity-50">
                        {index + 1}
                      </span>
                      {step}
                    </button>
                  ))}
                </div>
              </div>

            </div>
            <div className="mt-2 border-t border-secondary pt-2">
              <h4 className="text-sm font-bold text-text-secondary mb-2 text-center">
                {t('jog.homing.title')}
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <button
                  onClick={() => onHome("all")}
                  disabled={isControlDisabled}
                  className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 font-bold"
                >
                  {t('jog.homing.all')}
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="bg-background p-1 rounded-md">
              <h4 className="text-xs font-bold text-text-secondary mb-1">
                {t('jog.zero.title')}
              </h4>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => onSetZero("all")}
                    disabled={isControlDisabled}
                    className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50"
                  >
                    {t('jog.zero.all')}
                  </button>
                  <button
                    onClick={() => onSetZero("xy")}
                    disabled={isControlDisabled}
                    className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50"
                  >
                    {t('jog.zero.xy')}
                  </button>
                  <button
                    onClick={() => onSetZero("z")}
                    disabled={isControlDisabled}
                    className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50"
                  >
                    {t('jog.zero.z')}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-background p-1 rounded-md">
              <h4 className="text-xs font-bold text-text-secondary mb-1">
                {t('jog.units.title')}
              </h4>
              <div className="flex bg-secondary rounded-md p-1">
                <button
                  onClick={() => onUnitChange("mm")}
                  disabled={isControlDisabled}
                  className={`w-1/2 p-1 rounded-md text-sm font-semibold transition-colors ${unit === "mm"
                    ? "bg-primary text-white"
                    : "hover:bg-secondary-focus"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  mm
                </button>
                <button
                  onClick={() => onUnitChange("in")}
                  disabled={isControlDisabled}
                  className={`w-1/2 p-1 rounded-md text-sm font-semibold transition-colors ${unit === "in"
                    ? "bg-primary text-white"
                    : "hover:bg-secondary-focus"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  in
                </button>
              </div>
            </div>
            <div className="bg-background p-1 rounded-md">
              <h4 className="text-xs font-bold text-text-secondary mb-1">
                {t('jog.probe.title')}
              </h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <button
                  onClick={() => onProbe("X")}
                  disabled={isProbeDisabled}
                  className="p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50"
                >
                  {t('jog.probe.x')}
                </button>
                <button
                  onClick={() => onProbe("Y")}
                  disabled={isProbeDisabled}
                  className="p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50"
                >
                  {t('jog.probe.y')}
                </button>
                <button
                  onClick={() => onProbe("Z")}
                  disabled={isProbeDisabled}
                  className="p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Probe className="w-4 h-4" /> {t('jog.probe.z')}
                </button>
                <button
                  onClick={() => onProbe("XY")}
                  disabled={isProbeDisabled}
                  className="p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50"
                >
                  {t('jog.probe.xy')}
                </button>
              </div>
            </div>
            <div className="bg-background p-1 rounded-md">
              <h4 className="text-xs font-bold text-text-secondary mb-1">
                {t('jog.spindle.title')}
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={spindleSpeed}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSpindleSpeed(parseInt(e.target.value, 10))
                  }
                  disabled={isSpindleDisabled}
                  className="w-full bg-secondary border border-secondary rounded-md py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                  aria-label="Spindle Speed in RPM"
                />
                <span className="text-sm text-text-secondary">{t('jog.spindle.rpm')}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <button
                  title={t('jog.spindle.cw')}
                  onClick={() => onSpindleCommand("cw", spindleSpeed)}
                  disabled={isSpindleDisabled}
                  className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 flex justify-center"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  title={t('jog.spindle.ccw')}
                  onClick={() => onSpindleCommand("ccw", spindleSpeed)}
                  disabled={isSpindleDisabled}
                  className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 flex justify-center"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  title={t('jog.spindle.off')}
                  onClick={() => onSpindleCommand("off", 0)}
                  disabled={isSpindleDisabled}
                  className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 flex justify-center"
                >
                  <PowerOff className="w-5 h-5" />
                </button>
              </div>{" "}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default JogPanel;
