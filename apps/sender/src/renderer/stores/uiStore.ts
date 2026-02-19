import { create } from 'zustand';

type SpindleModalArgs = {
  onConfirm: (startSpindle: boolean) => void;
  title: string;
  message: string;
};

type UIState = {
  isPreflightModalOpen: boolean;
  isWelcomeModalOpen: boolean;
  isMacroEditorOpen: boolean;
  editingMacroIndex: number | null;
  isSettingsModalOpen: boolean;
  isToolLibraryModalOpen: boolean;
  isContactModalOpen: boolean;
  isGCodeModalOpen: boolean;
  isSpindleModalOpen: boolean;
  spindleModalArgs: SpindleModalArgs;
  isInfoModalOpen: boolean;
  infoModalTitle: string;
  infoModalMessage: string;
  returnToWelcome: boolean;
  isWebcamPeekOpen: boolean;
  isGrblSettingsModalOpen: boolean;
  preflightWarnings: { type: 'error' | 'warning'; message: string }[];
  actions: {
    openPreflightModal: () => void;
    closePreflightModal: () => void;
    openWelcomeModal: () => void;
    closeWelcomeModal: () => void;
    openMacroEditor: (index: number | null) => void;
    closeMacroEditor: () => void;
    openSettingsModal: () => void;
    closeSettingsModal: () => void;
    openToolLibraryModal: () => void;
    closeToolLibraryModal: () => void;
    openContactModal: () => void;
    closeContactModal: () => void;
    openGCodeModal: () => void;
    closeGCodeModal: () => void;
    openSpindleModal: (args: SpindleModalArgs) => void;
    closeSpindleModal: () => void;
    openInfoModal: (title: string, message: string) => void;
    closeInfoModal: () => void;
    setReturnToWelcome: (shouldReturn: boolean) => void;
    toggleWebcamPeek: () => void;
    openGrblSettingsModal: () => void;
    closeGrblSettingsModal: () => void;
    setPreflightWarnings: (warnings: { type: 'error' | 'warning'; message: string }[]) => void;
  };
};

export const useUIStore = create<UIState>((set) => ({
  isPreflightModalOpen: false,
  isWelcomeModalOpen: false,
  isMacroEditorOpen: false,
  editingMacroIndex: null,
  isSettingsModalOpen: false,
  isToolLibraryModalOpen: false,
  isContactModalOpen: false,
  isGCodeModalOpen: false,
  isSpindleModalOpen: false,
  spindleModalArgs: {
    onConfirm: () => { },
    title: '',
    message: '',
  },
  isInfoModalOpen: false,
  infoModalTitle: '',
  infoModalMessage: '',
  returnToWelcome: false,
  isWebcamPeekOpen: false,
  isGrblSettingsModalOpen: false,
  preflightWarnings: [],
  actions: {
    openPreflightModal: () => set({ isPreflightModalOpen: true }),
    closePreflightModal: () => set({ isPreflightModalOpen: false }),
    openWelcomeModal: () => set({ isWelcomeModalOpen: true }),
    closeWelcomeModal: () => set({ isWelcomeModalOpen: false }),
    openMacroEditor: (index) => set({ isMacroEditorOpen: true, editingMacroIndex: index }),
    closeMacroEditor: () => set({ isMacroEditorOpen: false, editingMacroIndex: null }),
    openSettingsModal: () => set({ isSettingsModalOpen: true }),
    closeSettingsModal: () => set({ isSettingsModalOpen: false }),
    openToolLibraryModal: () => set({ isToolLibraryModalOpen: true }),
    closeToolLibraryModal: () => set({ isToolLibraryModalOpen: false }),
    openContactModal: () => set({ isContactModalOpen: true }),
    closeContactModal: () => set({ isContactModalOpen: false }),
    openGCodeModal: () => set({ isGCodeModalOpen: true }),
    closeGCodeModal: () => set({ isGCodeModalOpen: false }),
    openSpindleModal: (args) => set({ isSpindleModalOpen: true, spindleModalArgs: args }),
    closeSpindleModal: () => set({ isSpindleModalOpen: false }),
    openInfoModal: (title, message) => set({ isInfoModalOpen: true, infoModalTitle: title, infoModalMessage: message }),
    closeInfoModal: () => set({ isInfoModalOpen: false }),
    setReturnToWelcome: (shouldReturn) => set({ returnToWelcome: shouldReturn }),
    toggleWebcamPeek: () => set((state) => ({ isWebcamPeekOpen: !state.isWebcamPeekOpen })),
    openGrblSettingsModal: () => set({ isGrblSettingsModalOpen: true }),
    closeGrblSettingsModal: () => set({ isGrblSettingsModalOpen: false }),
    setPreflightWarnings: (warnings) => set({ preflightWarnings: warnings }),
  },
}));
