import { create } from 'zustand';
import { MachineState } from '@/types';
import { useConnectionStore } from './connectionStore';
import { useSettingsStore } from './settingsStore';
import { useLogStore } from './logStore';
import { useUIStore } from './uiStore';
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
    _executeProbe: (axes: string, diameter: number) => void;
    handleXYZProbe: () => void;
    _executeXYZProbe: (diameter: number) => void;
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
};

export const useMachineStore = create<MachineStoreState>((set, get) => ({
  ...initialState,
  actions: {
    setMachineState: (state) => {
      const prevState = get().machineState;
      set({ machineState: state });

      // Detect successful homing cycle completion
      if (
        prevState?.status === 'Home' &&
        state?.status === 'Idle'
      ) {
        set({ isHomedSinceConnect: true });
        useLogStore.getState().actions.addLog({
          type: 'info',
          message: 'Machine homing cycle complete.',
        });
      }

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
      const command = commandMap[axes as keyof typeof commandMap];
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

    handleProbe: async (axes) => {
      const { machineSettings } = useSettingsStore.getState();
      const uiActions = useUIStore.getState().actions;
      uiActions.openProbeVerificationModal({
        status: 'idle',
        showToolDiameter: true,
        initialToolDiameter: machineSettings.probe?.bitDiameter || 3.175,
        onConfirm: (diameter) => {
          console.log('Probe verification confirmed/skipped for axes:', axes, 'with diameter:', diameter);
          get().actions._executeProbe(axes, diameter);
        },
        onCancel: () => {
          useConnectionStore.getState().actions.sendRealtimeCommand('\x18'); // Soft Reset to stop any motion
          uiActions.updateProbeVerificationModalStatus('failed', 'Probing cancelled by user.');
        }
      });
    },

    _executeProbe: async (axes: string, diameter: number) => {
      console.log('Entering _executeProbe with axes:', axes, 'diameter:', diameter);
      const { actions: logActions } = useLogStore.getState();
      const { machineSettings } = useSettingsStore.getState();
      const { actions: connectionActions } = useConnectionStore.getState();
      const uiActions = useUIStore.getState().actions;

      try {
        uiActions.updateProbeVerificationModalStatus('probing', `Probing axes: ${axes}...`);
        logActions.addLog({ type: 'info', message: `Probing axes: ${axes}` });
        const { probe } = machineSettings;
        if (!probe || !probe.fastFeedRate || !probe.slowFeedRate || !probe.probeTravelDistance || !probe.retractDistance) {
          throw new Error('Probe settings are incomplete. Please check the settings panel.');
        }

        const { fastFeedRate, slowFeedRate, probeTravelDistance, retractDistance } = probe;

        let probeCommand = '';
        let retractCommand = '';
        
        if (axes.includes('X')) {
          probeCommand += `X${probeTravelDistance} `;
          retractCommand += `X-${retractDistance} `;
        }
        if (axes.includes('Y')) {
          probeCommand += `Y${probeTravelDistance} `;
          retractCommand += `Y-${retractDistance} `;
        }
        if (axes.includes('Z')) {
          probeCommand += `Z-${probeTravelDistance} `;
          retractCommand += `Z${retractDistance} `;
        }

        if (probeCommand) {
          // 1. Fast Probe
          const fastGcode = `G91 G38.2 ${probeCommand.trim()} F${fastFeedRate}`;
          logActions.addLog({ type: 'info', message: `Stage 1: Fast Probe (${fastGcode})` });
          await connectionActions.sendLine(fastGcode);

          // 2. Retract
          const retractGcode = `G91 G0 ${retractCommand.trim()}`;
          logActions.addLog({ type: 'info', message: `Stage 2: Retract (${retractGcode})` });
          await connectionActions.sendLine(retractGcode);
          connectionActions.sendLine('G90'); // Back to absolute

          // 3. Slow Probe
          const slowGcode = `G91 G38.2 ${probeCommand.trim()} F${slowFeedRate}`;
          logActions.addLog({ type: 'info', message: `Stage 3: Slow Probe (${slowGcode})` });
          await connectionActions.sendLine(slowGcode);
          
          logActions.addLog({ type: 'info', message: 'Two-stage probing sequence complete.' });
          uiActions.updateProbeVerificationModalStatus('success', `Probing axes ${axes} completed successfully.`);
        }
      } catch (error: any) {
        logActions.addLog({ type: 'error', message: `Probing failed: ${error.message || error}` });
        uiActions.updateProbeVerificationModalStatus('failed', `Probing failed: ${error.message || 'Unknown error'}`);
      }
    },

    handleXYZProbe: async () => {
      const { machineSettings } = useSettingsStore.getState();
      const uiActions = useUIStore.getState().actions;
      uiActions.openProbeVerificationModal({
        status: 'idle',
        showToolDiameter: true,
        initialToolDiameter: machineSettings.probe?.bitDiameter || 3.175,
        onConfirm: (diameter) => {
          console.log('XYZ Probe verification confirmed/skipped with diameter:', diameter);
          get().actions._executeXYZProbe(diameter);
        },
        onCancel: () => {
          useConnectionStore.getState().actions.sendRealtimeCommand('\x18'); // Soft Reset to stop any motion
          uiActions.updateProbeVerificationModalStatus('failed', 'XYZ Probing cancelled by user.');
        }
      });
    },

    _executeXYZProbe: async (diameter: number) => {
      console.log('Entering _executeXYZProbe with diameter:', diameter);
      const { actions: logActions } = useLogStore.getState();
      const { machineSettings } = useSettingsStore.getState();
      const { actions: connectionActions } = useConnectionStore.getState();
      const uiActions = useUIStore.getState().actions;

      try {
        uiActions.updateProbeVerificationModalStatus('probing', 'Starting XYZ Corner Probing sequence...');
        logActions.addLog({ type: 'info', message: 'Starting XYZ Corner Probing sequence' });
        const { probe } = machineSettings;
        
        if (!probe || !probe.fastFeedRate || !probe.slowFeedRate || !probe.probeTravelDistance || !probe.retractDistance || !probe.blockWidthX || !probe.blockWidthY || !probe.blockHeight) {
          throw new Error('Probe settings are incomplete. Please check all XYZ parameters in the settings panel.');
        }

        const { fastFeedRate, slowFeedRate, probeTravelDistance, retractDistance, blockWidthX, blockWidthY, blockHeight } = probe;
        const bitRadius = diameter / 2;

        // 1. PROBE Z
        uiActions.updateProbeVerificationModalStatus('probing', 'Step 1/3: Probing Z axis...');
        logActions.addLog({ type: 'info', message: 'Step 1: Probing Z' });
        await connectionActions.sendLine(`G38.2 Z-${probeTravelDistance} F${fastFeedRate}`);
        await connectionActions.sendLine(`G91 G0 Z${retractDistance}`);
        await connectionActions.sendLine(`G38.2 Z-${retractDistance * 2} F${slowFeedRate}`);
        await connectionActions.sendLine(`G10 L20 P0 Z${blockHeight}`);
        await connectionActions.sendLine(`G91 G0 Z${retractDistance * 2}`);
        await connectionActions.sendLine('G90');

        // 2. PROBE X
        uiActions.updateProbeVerificationModalStatus('probing', 'Step 2/3: Probing X axis...');
        logActions.addLog({ type: 'info', message: 'Step 2: Probing X' });
        await connectionActions.sendLine(`G91 G0 X-${blockWidthX}`);
        await connectionActions.sendLine(`G91 G0 Z-${blockHeight + retractDistance}`);
        await connectionActions.sendLine(`G38.2 X${blockWidthX} F${fastFeedRate}`);
        await connectionActions.sendLine(`G91 G0 X-${retractDistance}`);
        await connectionActions.sendLine(`G38.2 X${retractDistance * 2} F${slowFeedRate}`);
        await connectionActions.sendLine(`G10 L20 P0 X-${bitRadius}`);
        await connectionActions.sendLine(`G91 G0 X-${retractDistance}`);
        await connectionActions.sendLine(`G91 G0 Z${blockHeight + retractDistance}`);
        await connectionActions.sendLine('G90');

        // 3. PROBE Y
        uiActions.updateProbeVerificationModalStatus('probing', 'Step 3/3: Probing Y axis...');
        logActions.addLog({ type: 'info', message: 'Step 3: Probing Y' });
        await connectionActions.sendLine(`G91 G0 Y-${blockWidthY}`);
        await connectionActions.sendLine(`G91 G0 X${retractDistance + bitRadius + 5}`);
        await connectionActions.sendLine(`G91 G0 Z-${blockHeight + retractDistance}`);
        await connectionActions.sendLine(`G38.2 Y${blockWidthY} F${fastFeedRate}`);
        await connectionActions.sendLine(`G91 G0 Y-${retractDistance}`);
        await connectionActions.sendLine(`G38.2 Y${retractDistance * 2} F${slowFeedRate}`);
        await connectionActions.sendLine(`G10 L20 P0 Y-${bitRadius}`);
        await connectionActions.sendLine(`G91 G0 Y-${retractDistance}`);
        await connectionActions.sendLine(`G91 G0 Z${blockHeight + retractDistance}`);
        
        await connectionActions.sendLine('G90');
        logActions.addLog({ type: 'info', message: 'XYZ Corner Probing sequence complete.' });
        uiActions.updateProbeVerificationModalStatus('success', 'XYZ Corner Probing completed successfully.');
      } catch (error: any) {
        logActions.addLog({ type: 'error', message: `XYZ Probing failed: ${error.message || error}` });
        uiActions.updateProbeVerificationModalStatus('failed', `XYZ Probing failed: ${error.message || 'Unknown error'}`);
        await connectionActions.sendLine('G90');
      }
    },

    handleJog: (axis, direction, step, feedRate) => {
      const { machineSettings } = useSettingsStore.getState();
      const { controller } = useConnectionStore.getState();

      const rate = feedRate || machineSettings.jogFeedRate;
      const x = axis === 'X' ? direction * step : 0;
      const y = axis === 'Y' ? direction * step : 0;
      const z = axis === 'Z' ? direction * step : 0;

      if (!get().isJogging) {
        set({ isJogging: true });
      }
      controller?.jog(x, y, z, rate);
    },

    handleJogStop: () => {
      const { controller } = useConnectionStore.getState();
      set({ isJogging: false });
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
