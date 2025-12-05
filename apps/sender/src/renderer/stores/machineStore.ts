import { create } from 'zustand';
import { MachineState } from '@/types';
import { useConnectionStore } from './connectionStore';
import { useSettingsStore } from './settingsStore';
import { useLogStore } from './logStore';
import { GRBL_REALTIME_COMMANDS } from '@/constants';

// GRBL Alarm codes and messages
function getAlarmMessage(code: number | string): string {
  const alarmMessages: Record<number, string> = {
    1: 'Hard limit triggered. Machine position is likely lost due to sudden and immediate halt. Re-homing is highly recommended.',
    2: 'G-code motion target exceeds machine travel. Machine position safely retained. Alarm may be unlocked.',
    3: 'Reset while in motion. Grbl cannot guarantee position. Lost steps are likely. Re-homing is highly recommended.',
    4: 'Probe fail. The probe is not in the expected initial state before starting probe cycle, where G38.2 and G38.3 is not triggered and G38.4 and G38.5 is triggered.',
    5: 'Probe fail. Probe did not contact the workpiece within the programmed travel for G38.2 and G38.4.',
    6: 'Homing fail. Reset during active homing cycle.',
    7: 'Homing fail. Safety door was opened during active homing cycle.',
    8: 'Homing fail. Cycle failed to clear limit switch when pulling off. Try increasing pull-off setting or check wiring.',
    9: 'Homing fail. Could not find limit switch within search distance. Defined as 1.5 * max_travel on search and 5 * pulloff on locate phases.',
  };

  const codeNum = typeof code === 'string' ? parseInt(code, 10) : code;
  return alarmMessages[codeNum] || `Alarm code ${code}. Please check GRBL documentation for details.`;
}


interface MachineStoreState {
  machineState: MachineState | null;
  isJogging: boolean;
  isHomedSinceConnect: boolean;
  isMacroRunning: boolean;
  actions: {
    setMachineState: (state: MachineState | null) => void;
    setIsJogging: (isJogging: boolean) => void;
    setIsHomedSinceConnect: (isHomed: boolean) => void;
    setIsMacroRunning: (isRunning: boolean) => void;
    reset: () => void;
    handleHome: (axes: 'all' | 'x' | 'y' | 'z' | 'xy') => void;
    handleSetZero: (axes: 'all' | 'x' | 'y' | 'z' | 'xy') => void;
    handleSpindleCommand: (command: 'cw' | 'ccw' | 'off', speed: number) => void;
    handleProbe: (axes: string) => void;
    handleJog: (axis: string, direction: number, step: number, feedRate?: number) => void;
    handleJogStop: () => void;
    handleRunMacro: (commands: string[]) => Promise<void>;
    handleManualCommand: (command: string) => void;
    handleUnitChange: (newUnit: "mm" | "in") => void;
  };
}

const initialState = {
  machineState: null,
  isJogging: false,
  isHomedSinceConnect: false,
  isMacroRunning: false,
  wcs: 'G54',
};

export const useMachineStore = create<MachineStoreState>((set, get) => ({
  ...initialState,
  actions: {
    setMachineState: (state) => {
      const prevState = get().machineState;
      set({ machineState: state });

      // Detect alarm state change
      if (state?.status === 'Alarm' && prevState?.status !== 'Alarm') {
        // Import useUIStore dynamically to avoid circular dependency
        import('./uiStore').then(({ useUIStore }) => {
          const { actions: uiActions } = useUIStore.getState();
          const alarmCode = state.code || 'Unknown';
          const alarmMessage = getAlarmMessage(alarmCode);

          uiActions.openInfoModal(
            `⚠️ ALARM ${alarmCode}`,
            `The machine has entered an alarm state.\n\n${alarmMessage}\n\nYou must send the unlock command ($X) to clear the alarm and resume operation.`
          );
        });
      }
    },
    setIsJogging: (isJogging) => set({ isJogging }),
    setIsHomedSinceConnect: (isHomed) => set({ isHomedSinceConnect: isHomed }),
    setIsMacroRunning: (isRunning) => set({ isMacroRunning: isRunning }),
    reset: () => set(initialState),

    handleHome: (axes) => {
      const { controller } = useConnectionStore.getState();
      if (axes === 'all') {
        controller?.home('all');
      }
    },

    handleSetZero: (axes) => {
      const { actions: connectionActions } = useConnectionStore.getState();
      const commandMap = {
        all: 'G10 L20 P0 X0 Y0 Z0',
        x: 'G10 L20 P0 X0',
        y: 'G10 L20 P0 Y0',
        z: 'G10 L20 P0 Z0',
        xy: 'G10 L20 P0 X0 Y0',
      };
      const command = commandMap[axes];
      if (command) {
        connectionActions.sendLine(command);
      }
    },

    handleSpindleCommand: (command, speed) => {
      const { actions: connectionActions } = useConnectionStore.getState();
      switch (command) {
        case 'cw':
          connectionActions.sendLine(`M3 S${speed}`);
          break;
        case 'ccw':
          connectionActions.sendLine(`M4 S${speed}`);
          break;
        case 'off':
          connectionActions.sendLine('M5');
          break;
      }
    },

    handleProbe: (axes) => {
      const { actions: logActions } = useLogStore.getState();
      const { machineSettings } = useSettingsStore.getState();
      const { actions: connectionActions } = useConnectionStore.getState();

      logActions.addLog({ type: 'info', message: `Probing axes: ${axes}` });
      const { probe } = machineSettings;
      if (!probe || !probe.feedRate || !probe.probeTravelDistance) {
        logActions.addLog({
          type: 'error',
          message: 'Probe settings are not configured.',
        });

        import('./uiStore').then(({ useUIStore }) => {
          useUIStore.getState().actions.openInfoModal(
            'Probe Settings Missing',
            'Please configure probe settings (Feed Rate and Travel Distance) in the Machine Settings before probing.'
          );
        });
        return;
      }

      const { feedRate, probeTravelDistance } = probe;

      let command = '';
      if (axes.includes('X')) {
        command += `X-${probeTravelDistance} `;
      }
      if (axes.includes('Y')) {
        command += `Y-${probeTravelDistance} `;
      }
      if (axes.includes('Z')) {
        command += `Z-${probeTravelDistance} `;
      }

      if (command) {
        const gcode = `G38.2 ${command.trim()} F${feedRate}`;
        logActions.addLog({ type: 'info', message: `Sending probe command: ${gcode}` });
        connectionActions.sendLine(gcode);
      }
    },

    handleJog: (axis, direction, step, feedRate) => {
      const { machineSettings } = useSettingsStore.getState();
      const { controller } = useConnectionStore.getState();

      const rate = feedRate || machineSettings.jogFeedRate;
      const x = axis === 'X' ? direction * step : 0;
      const y = axis === 'Y' ? direction * step : 0;
      const z = axis === 'Z' ? direction * step : 0;

      controller?.jog(x, y, z, rate);
    },

    handleJogStop: () => {
      const { controller } = useConnectionStore.getState();
      controller?.sendRealtimeCommand(GRBL_REALTIME_COMMANDS.JOG_CANCEL);
    },

    handleManualCommand: (command) => {
      const { actions: connectionActions } = useConnectionStore.getState();
      connectionActions.sendLine(command);
    },

    handleUnitChange: (newUnit) => {
      const { unit, machineSettings, actions: settingsActions } = useSettingsStore.getState();
      const { actions: connectionActions } = useConnectionStore.getState();

      if (unit === newUnit) return;

      // Reset jog step to a safe default for the new unit
      // This prevents dangerous jumps (e.g. switching from 50mm to 50in)
      const defaultStep = newUnit === "mm" ? 1 : 0.1;
      settingsActions.setJogStep(defaultStep);

      // Convert jog feed rate
      let newFeedRate = machineSettings.jogFeedRate;
      if (unit === 'mm' && newUnit === 'in') {
        newFeedRate = newFeedRate / 25.4;
      } else if (unit === 'in' && newUnit === 'mm') {
        newFeedRate = newFeedRate * 25.4;
      }

      // Update settings with converted feed rate
      settingsActions.setMachineSettings({
        ...machineSettings,
        jogFeedRate: Math.round(newFeedRate * 100) / 100
      });

      settingsActions.setUnit(newUnit);
      connectionActions.sendLine(newUnit === "mm" ? "G21" : "G20");
    },

    handleRunMacro: async (commands) => {
      const { actions: connectionActions } = useConnectionStore.getState();
      const { actions: logActions } = useLogStore.getState();

      set({ isMacroRunning: true });
      logActions.addLog({ type: 'info', message: `Running macro...` });
      for (const command of commands) {
        if (command.trim()) {
          try {
            await connectionActions.sendLine(command);
          } catch (error) {
            break;
          }
        }
      }
      logActions.addLog({ type: 'info', message: 'Macro finished.' });
      set({ isMacroRunning: false });
    },
  },
}));
