import { create } from 'zustand';

type SpindleModalArgs = {
  onConfirm: (startSpindle: boolean) => void;
  title: string;
  message: string;
};

// Define an enum for modal types
export enum ModalType {
  Welcome = 'WelcomeModal',
  Contact = 'ContactModal',
  Preflight = 'PreflightChecklistModal',
  SpindleConfirmation = 'SpindleConfirmationModal',
  Info = 'InfoModal',
  MacroEditor = 'MacroEditorModal',
  Settings = 'SettingsModal',
  ToolLibrary = 'ToolLibraryModal',
  GCodeGenerator = 'GCodeGeneratorModal',
}

type UIState = {
  // Generic modal management
  activeModal: ModalType | null;
  modalProps: any; // To pass any necessary props to the active modal

  // Specific state for Spindle and Info modals (as they have required args)
  spindleModalArgs: SpindleModalArgs;
  infoModalTitle: string;
  infoModalMessage: string;

  // Other UI states
  editingMacroIndex: number | null;
  returnToWelcome: boolean;
  isTourOpen: boolean;
  selectedToolId: number | null;

  actions: {
    openModal: (type: ModalType, props?: any) => void;
    closeModal: () => void;
    // Specific actions that might set additional state
    openMacroEditor: (index: number | null) => void; // Keeps specific arg
    openSpindleModal: (args: SpindleModalArgs) => void; // Keeps specific arg
    openInfoModal: (title: string, message: string) => void; // Keeps specific arg
    setReturnToWelcome: (shouldReturn: boolean) => void;
    openTour: () => void;
    closeTour: () => void;
    setSelectedToolId: (id: number | null) => void;
  };
};

export const useUIStore = create<UIState>((set) => ({
  // Initial state for generic modal management
  activeModal: null,
  modalProps: {},

  // Initial state for specific modal args
  spindleModalArgs: {
    onConfirm: () => {},
    title: '',
    message: '',
  },
  infoModalTitle: '',
  infoModalMessage: '',

  // Initial state for other UI states
  editingMacroIndex: null,
  returnToWelcome: false,
  isTourOpen: false,
  selectedToolId: null,

  actions: {
    openModal: (type, props = {}) => set({ activeModal: type, modalProps: props }),
    closeModal: () => set({ activeModal: null, modalProps: {} }),

    openMacroEditor: (index) => set({ activeModal: ModalType.MacroEditor, editingMacroIndex: index }),
    openSpindleModal: (args) => set({ activeModal: ModalType.SpindleConfirmation, spindleModalArgs: args }),
    openInfoModal: (title, message) => set({ activeModal: ModalType.Info, infoModalTitle: title, infoModalMessage: message }),

    setReturnToWelcome: (shouldReturn) => set({ returnToWelcome: shouldReturn }),
    openTour: () => set({ isTourOpen: true }),
    closeTour: () => set({ isTourOpen: false }),
    setSelectedToolId: (id) => set({ selectedToolId: id }),
  },
}));
