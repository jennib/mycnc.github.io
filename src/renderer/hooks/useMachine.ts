import { useCallback } from 'react';
import { useMachineStore } from '../stores/machineStore';
import { useConnectionStore } from '../stores/connectionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useLogStore } from '../stores/logStore';

export function useMachine() {
  const { machineState, isJogging, isHomedSinceConnect, isMacroRunning, actions: machineActions } = useMachineStore();
  const { isConnected, actions: connectionActions } = useConnectionStore();
  const { machineSettings, actions: settingsActions } = useSettingsStore();
  const { actions: logActions } = useLogStore();

  const handleHome = useCallback((axes: 'all' | 'x' | 'y' | 'z' | 'xy') => {
    if (axes === 'all') {
      // Homing can take a long time, so we use a longer timeout.
      connectionActions.sendLine('$H', 60000);
    }
    // Note: GRBL doesn't support homing individual axes with a single command.
    // This would require a macro or special handling if needed in the future.
  }, [connectionActions]);

  const handleSetZero = useCallback((axes: 'all' | 'x' | 'y' | 'z' | 'xy') => {
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
  }, [connectionActions]);

  const handleSpindleCommand = useCallback((command: 'cw' | 'ccw' | 'off', speed: number) => {
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
  }, [connectionActions]);

  const handleProbe = useCallback((axes: string) => {
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
    // The probe command G38.2 moves one or more axes. The first axis to touch the probe
    // stops all axes and records the coordinates.
    // We assume a negative direction for probing.
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
  }, [machineSettings, connectionActions, logActions]);

  const handleJog = useCallback(
    (axis: string, direction: number, step: number) => {
      const { jogFeedRate } = machineSettings;
      const distance = direction * step;
      const command = `$J=G91 ${axis}${distance} F${jogFeedRate}`;
      
      // Manually set the machine state to "Jog"
      if (machineState) {
        machineActions.setMachineState({
          ...machineState,
          status: 'Jog',
        });
      }

      connectionActions.sendLine(command);
    },
    [machineSettings, connectionActions, machineState, machineActions]
  );

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

  const handleUnitChange = useCallback((newUnit: "mm" | "in") => {
    settingsActions.setUnit(newUnit);
    connectionActions.sendLine(newUnit === "mm" ? "G21" : "G20");
  }, [settingsActions, connectionActions]);

  const handleRunMacro = useCallback(async (commands: string[]) => {
    machineActions.setIsMacroRunning(true);
    logActions.addLog({ type: 'info', message: `Running macro...` });
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
    logActions.addLog({ type: 'info', message: 'Macro finished.' });
    machineActions.setIsMacroRunning(false);
  }, [connectionActions, logActions, machineActions]);

  return {
    machineState,
    isJogging,
    isHomedSinceConnect,
    isMacroRunning,
    isConnected,
    handleHome,
    handleSetZero,
    handleSpindleCommand,
    handleProbe,
    handleJog,
    handleJogStop,
    handleRunMacro,
    handleManualCommand,
    handleUnitChange,
  };
}
