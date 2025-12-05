import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MachineSettings, Tool, Macro, GeneratorSettings, WebcamSettings } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_MACROS, DEFAULT_TOOLS, DEFAULT_GENERATOR_SETTINGS, DEFAULT_WEBCAM_SETTINGS } from '@/constants';

interface SettingsState {
  jogStep: number;
  unit: 'mm' | 'in';
  isLightMode: boolean;
  playCompletionSound: boolean;
  macros: Macro[];
  machineSettings: MachineSettings;
  toolLibrary: Tool[];
  generatorSettings: GeneratorSettings;
  webcamSettings: WebcamSettings;
  buildAreaMeasurementDirections: { X: 1 | -1; Y: 1 | -1; Z: 1 | -1 };
  actions: {
    setJogStep: (step: number) => void;
    setUnit: (unit: 'mm' | 'in') => void;
    setIsLightMode: (isLight: boolean) => void;
    setPlayCompletionSound: (play: boolean) => void;
    setMacros: (macros: Macro[] | ((prev: Macro[]) => Macro[])) => void;
    setMachineSettings: (settings: MachineSettings | ((prev: MachineSettings) => MachineSettings)) => void;
    setToolLibrary: (library: Tool[] | ((prev: Tool[]) => Tool[])) => void;
    setGeneratorSettings: (settings: GeneratorSettings | ((prev: GeneratorSettings) => GeneratorSettings)) => void;
    setWebcamSettings: (settings: Partial<WebcamSettings>) => void;
    setBuildAreaMeasurementDirections: (directions: { X: 1 | -1; Y: 1 | -1; Z: 1 | -1 }) => void;
    importSettings: (settings: Partial<SettingsState>) => void;
  };
}

const deepMerge = (current: any, persisted: any): any => {
  const result = { ...current };
  for (const key in persisted) {
    if (persisted.hasOwnProperty(key)) {
      const currentValue = current[key];
      const persistedValue = persisted[key];
      if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue) && typeof persistedValue === 'object' && persistedValue !== null && !Array.isArray(persistedValue)) {
        result[key] = deepMerge(currentValue, persistedValue);
      } else {
        result[key] = persistedValue;
      }
    }
  }
  return result;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      jogStep: 1,
      unit: 'mm',
      isLightMode: true,
      playCompletionSound: true,
      macros: DEFAULT_MACROS,
      machineSettings: DEFAULT_SETTINGS,
      toolLibrary: DEFAULT_TOOLS,
      generatorSettings: DEFAULT_GENERATOR_SETTINGS,
      webcamSettings: DEFAULT_WEBCAM_SETTINGS,
      buildAreaMeasurementDirections: { X: 1, Y: 1, Z: 1 },
      actions: {
        setJogStep: (step) => set({ jogStep: step }),
        setUnit: (unit) => set({ unit: unit }),
        setIsLightMode: (isLight) => set({ isLightMode: isLight }),
        setPlayCompletionSound: (play) => set({ playCompletionSound: play }),
        setMacros: (macros) => set((state) => ({ macros: typeof macros === 'function' ? macros(state.macros) : macros })),
        setMachineSettings: (settings) => set((state) => ({ machineSettings: typeof settings === 'function' ? settings(state.machineSettings) : settings })),
        setToolLibrary: (library) => set((state) => ({ toolLibrary: typeof library === 'function' ? library(state.toolLibrary) : library })),
        setGeneratorSettings: (settings) => set((state) => ({ generatorSettings: typeof settings === 'function' ? settings(state.generatorSettings) : settings })),
        setWebcamSettings: (settings) => set((state) => ({ webcamSettings: { ...state.webcamSettings, ...settings } })),
        setBuildAreaMeasurementDirections: (directions) => set({ buildAreaMeasurementDirections: directions }),
        importSettings: (importedSettings) => set((state) => {
          const newState = { ...state };
          if (importedSettings.machineSettings) newState.machineSettings = deepMerge(state.machineSettings, importedSettings.machineSettings);
          if (importedSettings.generatorSettings) newState.generatorSettings = deepMerge(state.generatorSettings, importedSettings.generatorSettings);
          if (importedSettings.webcamSettings) newState.webcamSettings = { ...state.webcamSettings, ...importedSettings.webcamSettings };

          // For arrays and primitives, we usually want to overwrite
          if (importedSettings.macros) newState.macros = importedSettings.macros;
          if (importedSettings.toolLibrary) newState.toolLibrary = importedSettings.toolLibrary;
          if (importedSettings.jogStep) newState.jogStep = importedSettings.jogStep;
          if (importedSettings.unit) newState.unit = importedSettings.unit;
          if (importedSettings.isLightMode !== undefined) newState.isLightMode = importedSettings.isLightMode;
          if (importedSettings.playCompletionSound !== undefined) newState.playCompletionSound = importedSettings.playCompletionSound;

          return newState;
        }),
      },
    }),
    {
      name: 'cnc-app-settings', // The base key for local storage
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== 'actions')
        ),
      merge: (persistedState, currentState) => {
        const state = persistedState as any;
        return {
          ...currentState,
          ...state,
          machineSettings: deepMerge(currentState.machineSettings, state.machineSettings || {}),
          generatorSettings: deepMerge(currentState.generatorSettings, state.generatorSettings || {}),
          webcamSettings: { ...currentState.webcamSettings, ...(state.webcamSettings || {}) },
        };
      },
    }
  )
);