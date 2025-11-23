import { create } from 'zustand';
import { MachineState } from '../types';

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
  };
}

const initialState = {
  machineState: null,
  isJogging: false,
  isHomedSinceConnect: false,
  isMacroRunning: false,
};

export const useMachineStore = create<MachineStoreState>((set) => ({
  ...initialState,
  actions: {
    setMachineState: (state) => set({ machineState: state }),
    setIsJogging: (isJogging) => set({ isJogging }),
    setIsHomedSinceConnect: (isHomed) => set({ isHomedSinceConnect: isHomed }),
    setIsMacroRunning: (isRunning) => set({ isMacroRunning: isRunning }),
    reset: () => set(initialState),
  },
}));
