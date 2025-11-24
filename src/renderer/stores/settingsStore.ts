import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MachineSettings, Tool, Macro, GeneratorSettings } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_MACROS, DEFAULT_TOOLS, DEFAULT_GENERATOR_SETTINGS } from '@/constants';

interface SettingsState {
  jogStep: number;
  unit: 'mm' | 'in';
  isLightMode: boolean;
  macros: Macro[];
  machineSettings: MachineSettings;
  toolLibrary: Tool[];
  generatorSettings: GeneratorSettings;
  actions: {
    setJogStep: (step: number) => void;
    setUnit: (unit: 'mm' | 'in') => void;
    setIsLightMode: (isLight: boolean) => void;
    setMacros: (macros: Macro[] | ((prev: Macro[]) => Macro[])) => void;
    setMachineSettings: (settings: MachineSettings | ((prev: MachineSettings) => MachineSettings)) => void;
    setToolLibrary: (library: Tool[] | ((prev: Tool[]) => Tool[])) => void;
    setGeneratorSettings: (settings: GeneratorSettings | ((prev: GeneratorSettings) => GeneratorSettings)) => void;
  };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      jogStep: 1,
      unit: 'mm',
      isLightMode: false,
      macros: DEFAULT_MACROS,
      machineSettings: DEFAULT_SETTINGS,
      toolLibrary: DEFAULT_TOOLS,
      generatorSettings: DEFAULT_GENERATOR_SETTINGS,
      actions: {
        setJogStep: (step) => set({ jogStep: step }),
        setUnit: (unit) => set({ unit: unit }),
        setIsLightMode: (isLight) => set({ isLightMode: isLight }),
        setMacros: (macros) => set((state) => ({ macros: typeof macros === 'function' ? macros(state.macros) : macros })),
        setMachineSettings: (settings) => set((state) => ({ machineSettings: typeof settings === 'function' ? settings(state.machineSettings) : settings })),
        setToolLibrary: (library) => set((state) => ({ toolLibrary: typeof library === 'function' ? library(state.toolLibrary) : library })),
        setGeneratorSettings: (settings) => set((state) => ({ generatorSettings: typeof settings === 'function' ? settings(state.generatorSettings) : settings })),
      },
    }),
    {
      name: 'cnc-app-settings', // The base key for local storage
      // We can specify which parts of the state to persist.
      // Here, we persist everything except the actions.
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== 'actions')
        ),
      merge: (persistedState, currentState) => {
        const state = persistedState as any;
        const deepMerge = (current: object, persisted: object) => {
            const result = { ...current };
            for (const key in persisted) {
                if (persisted.hasOwnProperty(key)) {
                    const currentValue = (current as any)[key];
                    const persistedValue = (persisted as any)[key];
                    if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue) && typeof persistedValue === 'object' && persistedValue !== null && !Array.isArray(persistedValue)) {
                        (result as any)[key] = deepMerge(currentValue, persistedValue);
                    } else {
                        (result as any)[key] = persistedValue;
                    }
                }
            }
            return result;
        };

        return {
            ...currentState,
            ...state,
            machineSettings: deepMerge(currentState.machineSettings, state.machineSettings || {}),
            generatorSettings: deepMerge(currentState.generatorSettings, state.generatorSettings || {}),
        };
      },
    }
  )
);
