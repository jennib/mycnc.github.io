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
  isSimulated: boolean;
  portInfo: any | null;
  actions: {
    connect: (useSimulator: boolean) => Promise<void>;
    disconnect: () => Promise<void>;
    sendLine: (line: string) => void;
    sendRealtimeCommand: (command: string) => void;
  };
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  serialManager: null,
  isConnected: false,
  isConnecting: false,
  isSimulated: false,
  portInfo: null,
  actions: {
    connect: async (useSimulator: boolean) => {
      if (get().isConnecting || get().isConnected) return;

      set({ isConnecting: true });

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
            message: `Connected to ${useSimulator ? 'simulator' : 'port'} at 115200 baud.`,
          });
          setIsHomedSinceConnect(false);

          // Run startup script
          if (machineSettings.scripts.startup && get().serialManager) {
            addLog({ type: 'status', message: 'Running startup script...' });
            const startupCommands = machineSettings.scripts.startup
              .split('\n')
              .map(l => l.replace(/\(.*?\)/g, ''))
              .map(l => l.split(';')[0])
              .map(l => l.trim())
              .filter(l => l && l !== '%');
            for (const command of startupCommands) {
              get().serialManager?.sendLineAndWaitForOk(command);
            }
          }
        },
        onDisconnect: () => {
          addLog({ type: 'status', message: 'Disconnected.' });
          set({
            isConnected: false,
            isConnecting: false,
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
        onStatus: setMachineState,
      };

      try {
        const manager = useSimulator
          ? new SimulatedSerialManager(commonCallbacks)
          : new SerialManager(machineSettings, commonCallbacks);
        
        set({ serialManager: manager });
        await manager.connect(115200);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        addLog({ type: 'error', message: `Failed to connect: ${errorMessage}` });
        set({ isConnecting: false });
      }
    },
    disconnect: async () => {
      await get().serialManager?.disconnect();
    },
    sendLine: (line: string) => {
      get().serialManager?.sendLine(line);
    },
    sendRealtimeCommand: (command: string) => {
      get().serialManager?.sendRealtimeCommand(command);
    }
  },
}));
