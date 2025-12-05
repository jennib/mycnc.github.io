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

            // Play completion sound using Web Audio API
            const soundUrl = '/completion-sound.mp3';
            const playSound = async () => {
              try {
                const response = await fetch(soundUrl);
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();

                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (!AudioContext) return;

                const audioCtx = new AudioContext();
                try {
                  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                  const source = audioCtx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(audioCtx.destination);
                  source.start(0);
                } catch (decodeError) {
                  // Fallback: Play a simple beep if file is corrupted
                  const oscillator = audioCtx.createOscillator();
                  oscillator.type = 'sine';
                  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
                  oscillator.connect(audioCtx.destination);
                  oscillator.start();
                  oscillator.stop(audioCtx.currentTime + 0.5);
                }
              } catch (e: any) {
                console.error("Error in audio playback:", e.message);
              }
            };
            playSound();
          }
        });

        await controller.connect(options);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        addLog({ type: 'error', message: `Failed to connect: ${errorMessage}` });
        set({ isConnecting: false });

        // Import dynamically to avoid circular dependency if needed, or just use the store
        const { openInfoModal } = require('./uiStore').useUIStore.getState().actions;
        openInfoModal('Connection Failed', errorMessage);
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
    }
  },
}));
