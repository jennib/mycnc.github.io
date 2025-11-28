import React, { useState, memo, useEffect, useRef } from "react";
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
import { MachineState } from "../types";
import { JogManager, JogAxis, JogDirection } from "../services/JogManager";
import { useGamepad } from "../hooks/useGamepad";

interface JogPanelProps {
  isConnected: boolean;
  machineState: MachineState | null;
  onJog: (axis: string, direction: number, step: number) => void;
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
  }) => {
    const [spindleSpeed, setSpindleSpeed] = useState(1000);
    const pressedJogKey = useRef<string | null>(null);
    const jogManagerRef = useRef<JogManager | null>(null);
    const pressedKeys = useRef<Set<string>>(new Set());

    const isControlDisabled =
      !isConnected ||
      isJobActive ||
      isJogging ||
      isMacroRunning ||
      ["Alarm", "Home", "Jog"].includes(machineState?.status || "");
    const isProbeDisabled =
      isControlDisabled || machineState?.spindle?.state !== "off";
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

      const checkAxis = (axisIndex: number, targetAxis: JogAxis, invert: boolean = false) => {
        const rawValue = gamepadState.axes[axisIndex];
        // Standard Gamepad Mapping:
        // Axis 0: Left Stick X
        // Axis 1: Left Stick Y
        // Axis 2: Right Stick X
        // Axis 3: Right Stick Y

        // Some gamepads might have different mappings, but this is standard for Xbox/Generic
        if (rawValue === undefined) return;

        const value = applyDeadzone(rawValue);
        const threshold = 0.1; // Lower threshold for fine control start

        // Determine direction and magnitude
        let direction: JogDirection | 0 = 0;
        let magnitude = 0;

        if (Math.abs(value) > threshold) {
          magnitude = (Math.abs(value) - threshold) / (1 - threshold); // Normalize 0-1
          direction = value > 0 ? (invert ? -1 : 1) : (invert ? 1 : -1);
        }

        const key = `axis-${axisIndex}`;
        const wasActive = activeGamepadJogs.current[key];

        if (direction !== 0) {
          // Calculate variable feed rate
          // Range: Very fine (10mm/min) to Medium (500mm/min or user setting)
          // Use exponential curve for better fine control: feed = min + (max - min) * magnitude^2
          const minFeed = 10;
          const maxFeed = jogFeedRate; // Use the setting as the max
          const targetFeed = Math.round(minFeed + (maxFeed - minFeed) * Math.pow(magnitude, 2));

          activeGamepadJogs.current[key] = true;

          // Always call startJog to update speed if already jogging
          jogManagerRef.current?.startJog(targetAxis, direction, jogStep, targetFeed);

          if (!wasActive) {
            onFlash(`gamepad-jog`); // Flash on start
          }
        } else {
          if (wasActive) {
            // Falling edge: Stop jogging
            activeGamepadJogs.current[key] = false;
            // Args don't matter for stopping continuous jog, but we pass valid ones just in case
            jogManagerRef.current?.stopJog(targetAxis, 1, jogStep, jogFeedRate);
            onFlash("");
          }
        }
      };

      // Left Stick X (Axis 0) -> X Axis
      checkAxis(0, 'X');

      // Left Stick Y (Axis 1) -> Y Axis (Inverted: Up is -1 on gamepad usually)
      checkAxis(1, 'Y', true);

      // Right Stick Y (Axis 3) -> Z Axis (Inverted)
      checkAxis(3, 'Z', true);

    }, [gamepadState, isControlDisabled, jogStep, jogFeedRate, applyDeadzone, onFlash]);

    // Initialize JogManager
    useEffect(() => {
      jogManagerRef.current = new JogManager({
        onSendJogCommand: (axis, direction, distance, feedRate) => {
          onJog(axis, direction, distance);
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
    }, [machineState]);



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

    const handleStartJog = (axis: string, direction: number) => {
      jogManagerRef.current?.startJog(
        axis as JogAxis,
        direction as JogDirection,
        jogStep,
        jogFeedRate
      );
    };

    const handleStopJog = (axis: string, direction: number) => {
      jogManagerRef.current?.stopJog(
        axis as JogAxis,
        direction as JogDirection,
        jogStep,
        jogFeedRate
      );
    };

    return (
      <div className="bg-surface rounded-lg shadow-lg flex flex-col p-1 gap-1">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {/* Jog Controls */}
          <div className="bg-background p-1 rounded-md">
            <h4 className="text-xs font-bold text-text-secondary mb-1 text-center">
              Jog Control
            </h4>
            <div className="grid grid-cols-3 grid-rows-3 gap-1">
              <div className="col-start-1 row-start-1"></div> {/* empty */}
              <JogButton
                id="jog-y-plus"
                axis="Y"
                direction={1}
                icon={<ArrowUp className="w-6 h-6" />}
                label="Jog Y+"
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
                label="Jog Z+"
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
                label="Jog X-"
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
                label="Jog X+"
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
                label="Jog Y-"
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
                label="Jog Z-"
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
                <span className="text-sm text-text-secondary">Step:</span>
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
                      title={`Step size: ${step} (Hotkey: ${index + 1})`}
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
                Homing
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <button
                  onClick={() => onHome("all")}
                  disabled={isControlDisabled}
                  className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 font-bold"
                >
                  Home All ($H)
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="bg-background p-1 rounded-md">
              <h4 className="text-xs font-bold text-text-secondary mb-1">
                Set Zero
              </h4>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => onSetZero("all")}
                    disabled={isControlDisabled}
                    className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50"
                  >
                    Zero All
                  </button>
                  <button
                    onClick={() => onSetZero("xy")}
                    disabled={isControlDisabled}
                    className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50"
                  >
                    Zero XY
                  </button>
                  <button
                    onClick={() => onSetZero("z")}
                    disabled={isControlDisabled}
                    className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50"
                  >
                    Zero Z
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-background p-1 rounded-md">
              <h4 className="text-xs font-bold text-text-secondary mb-1">
                Units
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
                Probe
              </h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <button
                  onClick={() => onProbe("X")}
                  disabled={isProbeDisabled}
                  className="p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50"
                >
                  Probe X
                </button>
                <button
                  onClick={() => onProbe("Y")}
                  disabled={isProbeDisabled}
                  className="p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50"
                >
                  Probe Y
                </button>
                <button
                  onClick={() => onProbe("Z")}
                  disabled={isProbeDisabled}
                  className="p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Probe className="w-4 h-4" /> Probe Z
                </button>
                <button
                  onClick={() => onProbe("XY")}
                  disabled={isProbeDisabled}
                  className="p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50"
                >
                  Probe XY
                </button>
              </div>
            </div>
            <div className="bg-background p-1 rounded-md">
              <h4 className="text-xs font-bold text-text-secondary mb-1">
                Spindle Control
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={spindleSpeed}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSpindleSpeed(parseInt(e.target.value, 10))
                  }
                  disabled={isControlDisabled}
                  className="w-full bg-secondary border border-secondary rounded-md py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                  aria-label="Spindle Speed in RPM"
                />
                <span className="text-sm text-text-secondary">RPM</span>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <button
                  title="Spindle On (CW)"
                  onClick={() => onSpindleCommand("cw", spindleSpeed)}
                  disabled={isControlDisabled}
                  className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 flex justify-center"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  title="Spindle On (CCW)"
                  onClick={() => onSpindleCommand("ccw", spindleSpeed)}
                  disabled={isControlDisabled}
                  className="p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 flex justify-center"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  title="Spindle Off"
                  onClick={() => onSpindleCommand("off", 0)}
                  disabled={isControlDisabled}
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
