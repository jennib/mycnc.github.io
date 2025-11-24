import { create } from 'zustand';
import { SerialManager } from '../services/serialService';
import { SimulatedSerialManager } from '../services/simulatedSerialService';
import { MachineSettings } from '../types';

import { useLogStore } from './logStore';
import { useMachineStore } from './machineStore';
import { useJobStore } from './jobStore';
import { useSettingsStore } from './settingsStore';

interface ConnectionState {
  serialManager: SerialManager | SimulatedSerialManager | null;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnecting: boolean;
  isSimulated: boolean;
  portInfo: any | null;
  actions: {
    connect: (options: import('../types').ConnectionOptions | { type: 'simulator' }) => Promise<void>;
    disconnect: () => Promise<void>;
    sendLine: (line: string, timeout?: number) => Promise<void>;
    sendRealtimeCommand: (command: string) => void;
  };
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  serialManager: null,
  isConnected: false,
  isConnecting: false,
  isDisconnecting: false,
  isSimulated: false,
  portInfo: null,
  actions: {
    connect: async (options: import('../types').ConnectionOptions | { type: 'simulator' }) => {
      if (get().isConnecting || get().isConnected || get().isDisconnecting) return;

      set({ isConnecting: true });

      const useSimulator = options.type === 'simulator';
      const { machineSettings } = useSettingsStore.getState();
      const { addLog } = useLogStore.getState().actions;
      const { setMachineState, setIsHomedSinceConnect, reset: resetMachine } = useMachineStore.getState().actions;
      const { setProgress, setJobStatus } = useJobStore.getState().actions;

      const commonCallbacks = {
        onConnect: (info: any) => {
          set({
            isConnected: true,
            isConnecting: false,
            isSimulated: useSimulator,
            portInfo: info,
          });
          addLog({
            type: 'status',
            message: `Connected to ${useSimulator ? 'simulator' : info.type === 'tcp' ? `TCP at ${info.ip}:${info.port}` : 'serial port'} at 115200 baud.`,
          });
          setIsHomedSinceConnect(false);

          // Run startup script
          if (machineSettings.runStartupScript && machineSettings.scripts.startup && get().serialManager) {
            const runStartupScript = async () => {
              addLog({ type: 'status', message: 'Running startup script...' });
              const startupCommands = machineSettings.scripts.startup
                .split('\n')
                .map(l => l.replace(/\(.*?\)/g, ''))
                .map(l => l.split(';')[0])
                .map(l => l.trim())
                .filter(l => l && l !== '%');
              
              let isUnlocked = false;
              for (const command of startupCommands) {
                try {
                  await get().serialManager?.sendLineAndWaitForOk(command);
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : "Unknown error";
                  if (errorMessage.includes('error:9') && !isUnlocked) {
                    isUnlocked = true; // Only try to unlock once
                    addLog({ type: 'status', message: 'Machine is locked. Attempting to unlock...' });
                    try {
                      await get().serialManager?.sendLineAndWaitForOk('$X');
                      addLog({ type: 'status', message: 'Machine unlocked. Retrying last command...' });
                      await get().serialManager?.sendLineAndWaitForOk(command); // Retry the failed command
                    } catch (unlockError) {
                      const unlockErrorMessage = unlockError instanceof Error ? unlockError.message : "Unknown error";
                      addLog({ type: 'error', message: `Failed to unlock machine: ${unlockErrorMessage}` });
                      break; // Stop script if unlock fails
                    }
                  } else {
                    let finalErrorMessage = `Startup script failed on command '${command}': ${errorMessage}`;
                    if (errorMessage.includes('error:9') && isUnlocked) {
                        finalErrorMessage = `Startup script failed on command '${command}' even after unlocking. Please check machine state.`;
                    }
                    addLog({ type: 'error', message: finalErrorMessage });
                    break; // Stop script on other errors
                  }
                }
              }
            };
            runStartupScript();
          }
        },
        onDisconnect: () => {
          addLog({ type: 'status', message: 'Disconnected.' });
          set({
            isConnected: false,
            isConnecting: false,
            isDisconnecting: false,
            isSimulated: false,
            portInfo: null,
            serialManager: null,
          });
          resetMachine();
          useJobStore.getState().actions.clearFile();
        },
        onLog: addLog,
        onProgress: (p: { percentage: number }) => {
          setProgress(p.percentage);
          if (p.percentage >= 100) {
            addLog({ type: 'status', message: 'Job complete!' });
            setJobStatus(useJobStore.getState().jobStatus === 'Running' ? 'Complete' : useJobStore.getState().jobStatus);
          }
        },
        onError: (message: string) => {
          addLog({ type: 'error', message });
        },
        onStatus: (status: any, raw: string) => {
          setMachineState(status);
          // Let the logStore decide whether to show it based on verbosity
          addLog({ type: 'status', message: raw });
        },
      };

      try {
        const manager = useSimulator
          ? new SimulatedSerialManager(commonCallbacks)
          : new SerialManager(machineSettings, commonCallbacks);
        
        set({ serialManager: manager });

        if (useSimulator) {
            await manager.connect(115200);
        } else if (options.type === 'usb') {
            await manager.connect(115200);
        } else if (options.type === 'tcp') {
            await (manager as SerialManager).connectTCP(options.ip, options.port);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        addLog({ type: 'error', message: `Failed to connect: ${errorMessage}` });
        set({ isConnecting: false });
      }
    },
    disconnect: async () => {
      if (get().isDisconnecting || !get().isConnected) return;
      set({ isDisconnecting: true });
      await get().serialManager?.disconnect();
    },
    sendLine: (line: string, timeout?: number) => {
      const manager = get().serialManager;
      if (manager) {
        const trimmedLine = line.trim();
        // Jog commands are real-time and don't get an 'ok' response.
        // They should not use sendLineAndWaitForOk.
        if (trimmedLine.startsWith('$J=')) {
          return manager.sendLine(line).catch(error => {
            useLogStore.getState().actions.addLog({ type: 'error', message: `Command failed: ${error.message}` });
            throw error; // Re-throw
          });
        } else {
          return (manager as SerialManager).sendLineAndWaitForOk(line, true, timeout).catch(error => {
            useLogStore.getState().actions.addLog({ type: 'error', message: `Command failed: ${error.message}` });
            throw error; // Re-throw
          });
        }
      }
      return Promise.reject(new Error("Not connected."));
    },
    sendRealtimeCommand: (command: string) => {
      get().serialManager?.sendRealtimeCommand(command);
    }
  },
}));
