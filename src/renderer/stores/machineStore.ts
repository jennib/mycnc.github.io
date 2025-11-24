import { create } from 'zustand';
import { MachineState } from '@/types';
import { useConnectionStore } from './connectionStore';
import { useSettingsStore } from './settingsStore';
import { useLogStore } from './logStore';

// Can be 'X+', 'X-', 'Y+', 'Y-', 'Z+', 'Z-'
export type ActiveJog = string | null;

interface MachineStoreState {
  machineState: MachineState | null;
  isJogging: boolean;
  isHomedSinceConnect: boolean;
  isMacroRunning: boolean;
  activeJog: ActiveJog;
  actions: {
    setMachineState: (state: MachineState | null) => void;
    setIsJogging: (isJogging: boolean) => void;
    setActiveJog: (jog: ActiveJog) => void;
    setIsHomedSinceConnect: (isHomed: boolean) => void;
    setIsMacroRunning: (isRunning: boolean) => void;
    reset: () => void;
    handleHome: (axes: 'all' | 'x' | 'y' | 'z' | 'xy') => void;
    handleSetZero: (axes: 'all' | 'x' | 'y' | 'z' | 'xy') => void;
    handleSpindleCommand: (command: 'cw' | 'ccw' | 'off', speed: number) => void;
    handleProbe: (axes: string) => void;
    handleJog: (axis: string, direction: number, step: number) => void;
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
  activeJog: null,
};

export const useMachineStore = create<MachineStoreState>((set) => ({
  ...initialState,
  actions: {
    setMachineState: (state) => set({ machineState: state }),
    setIsJogging: (isJogging) => set({ isJogging }),
    setActiveJog: (jog) => set({ activeJog: jog }),
    setIsHomedSinceConnect: (isHomed) => set({ isHomedSinceConnect: isHomed }),
    setIsMacroRunning: (isRunning) => set({ isMacroRunning: isRunning }),
    reset: () => set(initialState),

    handleHome: (axes) => {
      const { actions: connectionActions } = useConnectionStore.getState();
      if (axes === 'all') {
        connectionActions.sendLine('$H', 60000);
      }
    },

    handleSetZero: (axes) => {
      const { actions: connectionActions } = useConnectionStore.getState();
      const commandMap = {
        all: 'G10 L20 P1 X0 Y0 Z0',
        x: 'G10 L20 P1 X0',
        y: 'G10 L20 P1 Y0',
        z: 'G10 L20 P1 Z0',
        xy: 'G10 L20 P1 X0 Y0',
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

    handleJog: (axis, direction, step) => {
      const { machineSettings } = useSettingsStore.getState();
      const { actions: connectionActions } = useConnectionStore.getState();
      const { machineState } = useMachineStore.getState();
      
      const { jogFeedRate } = machineSettings;
      const distance = direction * step;
      const command = `$J=G91 ${axis}${distance} F${jogFeedRate}`;
      
      if (machineState) {
        set((state) => ({
          machineState: {
            ...state.machineState,
            status: 'Jog',
          } as MachineState,
        }));
      }

      const jogId = `jog-${axis.toLowerCase()}${direction > 0 ? '-plus' : '-minus'}`;
      set({ activeJog: jogId });
      connectionActions.sendLine(command);
    },

    handleJogStop: () => {
      const { actions: connectionActions } = useConnectionStore.getState();
      connectionActions.sendRealtimeCommand('\x85');
      set({ activeJog: null });
    },

    handleManualCommand: (command) => {
      const { actions: connectionActions } = useConnectionStore.getState();
      connectionActions.sendLine(command);
    },

    handleUnitChange: (newUnit) => {
      const { actions: settingsActions } = useSettingsStore.getState();
      const { actions: connectionActions } = useConnectionStore.getState();
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