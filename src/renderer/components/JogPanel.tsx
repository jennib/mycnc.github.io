import React, { useState, memo, useEffect } from "react";
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

interface JogPanelProps {
  isConnected: boolean;
  machineState: MachineState | null;
  onJog: (axis: string, direction: number, step: number) => void;
  onHome: (axes: "all" | "x" | "y" | "z" | "xy") => void;
  onSetZero: (axes: "all" | "x" | "y" | "z" | "xy") => void;
  onSpindleCommand: (command: "cw" | "ccw" | "off", speed: number) => void;
  onProbe: (axes: string) => void;
  jogStep: number;
  onStepChange: (step: number) => void;
  flashingButton: string | null;
  onFlash: (buttonId: string) => void;
  unit: "mm" | "in";
  onUnitChange: (unit: "mm" | "in") => void;
  isJobActive: boolean;
  isJogging: boolean;
  isMacroRunning: boolean;
}

const JogPanel: React.FC<JogPanelProps> = memo(
  ({
    isConnected,
    machineState,
    onJog,
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
  }) => {
    const [spindleSpeed, setSpindleSpeed] = useState(1000);

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

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Ignore hotkeys if the user is typing in an input field
        const activeElement = document.activeElement;
        if (
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA")
        ) {
          return;
        }

        if (isControlDisabled) {
          return;
        }

        let handled = false;
        let buttonToFlash: string | null = null;

        switch (event.key) {
          case "ArrowUp":
            onJog("Y", 1, jogStep);
            buttonToFlash = "jog-y-plus";
            handled = true;
            break;
          case "ArrowDown":
            onJog("Y", -1, jogStep);
            buttonToFlash = "jog-y-minus";
            handled = true;
            break;
          case "ArrowLeft":
            onJog("X", -1, jogStep);
            buttonToFlash = "jog-x-minus";
            handled = true;
            break;
          case "ArrowRight":
            onJog("X", 1, jogStep);
            buttonToFlash = "jog-x-plus";
            handled = true;
            break;
          case "PageUp":
            if (!isZJogDisabledForStep) {
              onJog("Z", 1, jogStep);
              buttonToFlash = "jog-z-plus";
              handled = true;
            }
            break;
          case "PageDown":
            if (!isZJogDisabledForStep) {
              onJog("Z", -1, jogStep);
              buttonToFlash = "jog-z-minus";
              handled = true;
            }
            break;
          // Step size hotkeys
          case "1":
            if (stepSizes[0] !== undefined) {
              onStepChange(stepSizes[0]);
              buttonToFlash = `step-${stepSizes[0]}`;
              handled = true;
            }
            break;
          case "2":
            if (stepSizes[1] !== undefined) {
              onStepChange(stepSizes[1]);
              buttonToFlash = `step-${stepSizes[1]}`;
              handled = true;
            }
            break;
          case "3":
            if (stepSizes[2] !== undefined) {
              onStepChange(stepSizes[2]);
              buttonToFlash = `step-${stepSizes[2]}`;
              handled = true;
            }
            break;
          case "4":
            if (stepSizes[3] !== undefined) {
              onStepChange(stepSizes[3]);
              buttonToFlash = `step-${stepSizes[3]}`;
              handled = true;
            }
            break;
          case "5":
            if (stepSizes[4] !== undefined) {
              onStepChange(stepSizes[4]);
              buttonToFlash = `step-${stepSizes[4]}`;
              handled = true;
            }
            break;
        }

        if (handled) {
          event.preventDefault();
          if (buttonToFlash) {
            onFlash(buttonToFlash);
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [
      onJog,
      jogStep,
      isControlDisabled,
      isZJogDisabledForStep,
      onFlash,
      onStepChange,
      stepSizes,
    ]);

    const JogButton = ({
      id,
      axis,
      direction,
      icon,
      label,
      hotkey,
    }: {
      id: string;
      axis: string;
      direction: number;
      icon: React.ReactNode;
      label: string;
      hotkey: string;
    }) => {
      const isZButton = axis === "Z";
      const isDisabled =
        isControlDisabled || (isZButton && isZJogDisabledForStep);

      let title = `${label} (${axis}${
        direction > 0 ? "+" : "-"
      }) (Hotkey: ${hotkey})`;
      if (isZButton && isZJogDisabledForStep) {
        title = `Z-Jog disabled for step size > ${
          unit === "mm" ? "10mm" : "1in"
        }`;
      }

      return (
        <button
          id={id}
          onMouseDown={() => {
            onJog(axis, direction, jogStep);
            onFlash(id);
          }}
          disabled={isDisabled}
          className={`flex items-center justify-center p-4 bg-secondary rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed ${
            flashingButton === id ? "ring-4 ring-white ring-inset" : ""
          }`}
          title={title}
        >
          {icon}
        </button>
      );
    };

    return (
      <div className="bg-surface rounded-lg shadow-lg flex flex-col p-4 gap-4">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Jog Controls */}
          <div className="bg-background p-3 rounded-md">
            <h4 className="text-sm font-bold text-text-secondary mb-2 text-center">
              Jog Control
            </h4>
            <div className="grid grid-cols-3 grid-rows-3 gap-2">
              <div className="col-start-1 row-start-1"></div> {/* empty */}
              <JogButton
                id="jog-y-plus"
                axis="Y"
                direction={1}
                icon={<ArrowUp className="w-6 h-6" />}
                label="Jog Y+"
                hotkey="Up Arrow"
              />
              <JogButton
                id="jog-z-plus"
                axis="Z"
                direction={1}
                icon={<ArrowUp className="w-6 h-6" />}
                label="Jog Z+"
                hotkey="Page Up"
              />
              <JogButton
                id="jog-x-minus"
                axis="X"
                direction={-1}
                icon={<ArrowLeft className="w-6 h-6" />}
                label="Jog X-"
                hotkey="Left Arrow"
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
              />
              <div className="col-start-1 row-start-3"></div> {/* empty */}
              <JogButton
                id="jog-y-minus"
                axis="Y"
                direction={-1}
                icon={<ArrowDown className="w-6 h-6" />}
                label="Jog Y-"
                hotkey="Down Arrow"
              />
              <JogButton
                id="jog-z-minus"
                axis="Z"
                direction={-1}
                icon={<ArrowDown className="w-6 h-6" />}
                label="Jog Z-"
                hotkey="Page Down"
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-text-secondary">Step:</span>
              <div className="flex gap-1">
                {stepSizes.map((step) => (
                  <button
                    key={step}
                    id={`step-${step}`}
                    onClick={() => onStepChange(step)}
                    disabled={isControlDisabled}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      jogStep === step
                        ? "bg-primary text-white font-bold"
                        : "bg-secondary hover:bg-secondary-focus"
                    } ${
                      flashingButton === `step-${step}`
                        ? "ring-2 ring-white ring-inset"
                        : ""
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 border-t border-secondary pt-3">
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
          <div className="flex flex-col gap-3">
            <div className="bg-background p-3 rounded-md">
              <h4 className="text-sm font-bold text-text-secondary mb-2">
                Set Zero
              </h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
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
            <div className="bg-background p-3 rounded-md">
              <h4 className="text-sm font-bold text-text-secondary mb-2">
                Units
              </h4>
              <div className="flex bg-secondary rounded-md p-1">
                <button
                  onClick={() => onUnitChange("mm")}
                  disabled={isControlDisabled}
                  className={`w-1/2 p-1 rounded-md text-sm font-semibold transition-colors ${
                    unit === "mm"
                      ? "bg-primary text-white"
                      : "hover:bg-secondary-focus"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  mm
                </button>
                <button
                  onClick={() => onUnitChange("in")}
                  disabled={isControlDisabled}
                  className={`w-1/2 p-1 rounded-md text-sm font-semibold transition-colors ${
                    unit === "in"
                      ? "bg-primary text-white"
                      : "hover:bg-secondary-focus"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  in
                </button>
              </div>
            </div>
            <div className="bg-background p-3 rounded-md">
              <h4 className="text-sm font-bold text-text-secondary mb-2">
                Probe
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
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
            <div className="bg-background p-3 rounded-md">
              <h4 className="text-sm font-bold text-text-secondary mb-2">
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
              <div className="grid grid-cols-3 gap-2 mt-2">
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
