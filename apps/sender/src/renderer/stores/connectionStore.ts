import { create } from 'zustand';
import { Controller } from '@/controllers/Controller';
import { ControllerFactory } from '@/controllers/ControllerFactory';
import { MachineSettings, PortInfo, ConnectionOptions, JobStatus } from '@/types';

import { useLogStore } from './logStore';
import { useMachineStore } from './machineStore';
import { useJobStore } from './jobStore';
import { useSettingsStore } from './settingsStore';

interface ConnectionState {
  controller: Controller | null;
  isConnected: boolean;
  isConnecting: boolean;
  portInfo: PortInfo | null;
  actions: {
    connect: (options: ConnectionOptions) => Promise<void>;
    disconnect: () => Promise<void>;
    sendLine: (line: string, timeout?: number) => Promise<string>;
    sendRealtimeCommand: (command: string) => void;
    autoDetect: () => Promise<void>;
  };
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  controller: null,
  isConnected: false,
  isConnecting: false,
  portInfo: null,
  actions: {
    connect: async (options: ConnectionOptions) => {
      if (get().isConnected || get().isConnecting) {
        await get().actions.disconnect();
      }

      set({ isConnecting: true });

      const { machineSettings } = useSettingsStore.getState();
      const { addLog } = useLogStore.getState().actions;
      const { setMachineState, setIsHomedSinceConnect, reset: resetMachine } = useMachineStore.getState().actions;

      try {
        const controller = ControllerFactory.createController(machineSettings.controllerType, machineSettings);
        set({ controller });

        controller.on('state', (state: any) => {
          if (state.type === 'connect') {
            set({ isConnected: true, isConnecting: false, portInfo: state.data });
            addLog({ type: 'status', message: `Connected to ${state.data.type === 'tcp' ? `TCP at ${state.data.ip}:${state.data.port}` : 'serial port'}.` });
            setIsHomedSinceConnect(false);
          } else if (state.type === 'disconnect') {
            addLog({ type: 'status', message: 'Disconnected.' });
            set({ isConnected: false, isConnecting: false, portInfo: null, controller: null });
            resetMachine();
            useJobStore.getState().actions.clearFile();
          } else {
            setMachineState(state.data);
            addLog({ type: 'status', message: `[RAW] ${JSON.stringify(state.data)}` });
          }
        });

        controller.on('data', (data: any) => {
          addLog(data);
        });

        controller.on('error', (error: string) => {
          addLog({ type: 'error', message: error });
        });

        controller.on('progress', (data: any) => {
          const { setProgress } = useJobStore.getState().actions;
          setProgress(data.percentage);
        });

        controller.on('job', (data: any) => {
          const { setJobStatus } = useJobStore.getState().actions;
          if (data.status === 'complete') {
            setJobStatus(JobStatus.Complete);
            addLog({ type: 'info', message: 'Job completed successfully.' });

            // Play completion sound using AudioService
            import('../services/AudioService').then(({ audioService }) => {
              audioService.playCompletionSound();
            });
          }
        });

        await controller.connect(options);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        addLog({ type: 'error', message: `Failed to connect: ${errorMessage}` });
        set({ isConnecting: false });

        // Use dynamic import for uiStore to avoid circular dependency issues and 'require' issues in ESM/Vite
        import('./uiStore').then(({ useUIStore }) => {
          const { openInfoModal } = useUIStore.getState().actions;
          openInfoModal('Connection Failed', errorMessage as string); // Ensure it's a string
        });
      }
    },
    disconnect: async () => {
      await get().controller?.disconnect();
    },
    sendLine: (line: string, timeout?: number) => {
      const controller = get().controller;
      if (controller) {
        return controller.sendCommand(line, timeout).catch(error => {
          useLogStore.getState().actions.addLog({ type: 'error', message: `Command failed: ${error.message}` });
          throw error;
        });
      }
      return Promise.reject(new Error("Not connected."));
    },
    sendRealtimeCommand: (command: string) => {
      get().controller?.sendRealtimeCommand(command);
    },
    autoDetect: async () => {
      if (get().isConnected || get().isConnecting) return;

      const { machineSettings } = useSettingsStore.getState();
      const { setConnectionSettings } = useSettingsStore.getState().actions;
      const { addLog } = useLogStore.getState().actions;

      set({ isConnecting: true });

      const baudRatesToTest = [115200, 9600];

      if (window.electronAPI && window.electronAPI.setAutoSelectIndex) {
        let portIndex = 0;
        let found = false;

        while (true) {
          await window.electronAPI.setAutoSelectIndex(portIndex);

          for (const baudRate of baudRatesToTest) {
            addLog({ type: 'info', message: `Scanning port index ${portIndex} at ${baudRate} baud...` });

            try {
              // Attempt to connect via controller factory
              // Controller logic expects connect() to be called on its instance, 
              // which handles port connection AND grbl handshake.
              const controller = ControllerFactory.createController(machineSettings.controllerType, machineSettings);
              set({ controller });

              const connectPromise = new Promise<void>((resolve, reject) => {
                const stateListener = (state: any) => {
                  if (state.type === 'connect') {
                    controller.off('state', stateListener);
                    resolve();
                  } else if (state.type === 'disconnect') {
                    controller.off('state', stateListener);
                    reject(new Error("Disconnected during handshake"));
                  }
                };
                controller.on('state', stateListener);

                controller.connect({ type: 'usb', baudRate }).catch(err => {
                  controller.off('state', stateListener);
                  reject(err);
                });
              });

              await connectPromise;

              // If we reach here, handshake succeeded!
              addLog({ type: 'info', message: `Successfully auto-detected and connected at ${baudRate} baud!` });
              setConnectionSettings({ type: 'usb', baudRate });
              set({ isConnected: true, isConnecting: false });

              // Finalize store state listeners now that it's connected
              // We only bound a temporary one above. Let's disconnect and re-use the standard connect method to set up full bindings!
              await controller.disconnect();
              await window.electronAPI.setAutoSelectIndex(-1); // Resets prompt

              // Re-connect 'officially' using standard path
              set({ isConnecting: false });
              get().actions.connect({ type: 'usb', baudRate });

              found = true;
              break;
            } catch (err) {
              // Connection or handshake failed for this baud rate. 
              // Controller disconnects cleanly usually.
              get().controller?.disconnect();
              set({ controller: null });
            }
          }

          if (found) break;

          // Check if we exhausted the port list lengths by catching the selection error from Electron
          // The electron prompt throws when index >= portList.length
          // Since the error bubbles inside serialService.connect, if the error is "Failed to connect: ... no port selected", we can assume exhaustion.
          // We'll just try index 0 to 9 to be safe if error message isn't predictable.
          portIndex++;
          if (portIndex > 9) break;
        }
        await window.electronAPI.setAutoSelectIndex(-1);

        if (!found) {
          set({ isConnecting: false });
          addLog({ type: 'error', message: "Auto-detect failed. No GRBL device found on USB." });
          import('./uiStore').then(({ useUIStore }) => {
            useUIStore.getState().actions.openInfoModal('Auto-Detect Failed', 'Could not detect a responsive GRBL device on any USB port.');
          });
        }
      } else {
        set({ isConnecting: false });
        addLog({ type: 'error', message: "Auto-detect is only supported in the desktop app." });
      }
    }
  },
}));
