import React from 'react';
import { ModalType, useUIStore } from './stores/uiStore';
import { useSettingsStore } from './stores/settingsStore';
import { useMachineStore } from './stores/machineStore';
import { useJob } from './hooks/useJob';
import WelcomeModal from './components/WelcomeModal';
import PreflightChecklistModal from './components/PreflightChecklistModal';
import SpindleConfirmationModal from './components/SpindleConfirmationModal';
import InfoModal from './components/InfoModal';
import MacroEditorModal from './components/MacroEditorModal';
import SettingsModal from './components/SettingsModal';
import ToolLibraryModal from './components/ToolLibraryModal';
import GCodeGeneratorModal from './components/GCodeGeneratorModal';
import ContactModal from './components/ContactModal';
import ErrorBoundary from './ErrorBoundary';
import { Tool } from './types';

const AppModals: React.FC = () => {
  const {
    activeModal,
    modalProps,
    spindleModalArgs,
    infoModalTitle,
    infoModalMessage,
    editingMacroIndex,
    returnToWelcome,
    selectedToolId,
    actions: uiActions,
  } = useUIStore((state) => state);

  const {
    unit,
    macros,
    machineSettings,
    toolLibrary,
    generatorSettings,
    actions: settingsActions,
  } = useSettingsStore((state) => state);

  const { isHomedSinceConnect } = useMachineStore((state) => state);

  const {
    gcodeLines,
    fileName,
    timeEstimate,
    jobActions,
    jobStartOptions,
    preflightWarnings,
    handleStartJobConfirmed,
  } = useJob();

  const selectedTool =
    toolLibrary.find((t: Tool) => t.id === selectedToolId) || null;

  return (
    <>
      <WelcomeModal
        isOpen={activeModal === ModalType.Welcome}
        onClose={uiActions.closeModal}
        onOpenSettings={() => {
          uiActions.setReturnToWelcome(true);
          uiActions.openModal(ModalType.Settings);
        }}
        onOpenToolLibrary={() => {
          uiActions.setReturnToWelcome(true);
          uiActions.openModal(ModalType.ToolLibrary);
        }}
        onTrySimulator={() => {}}
        isMachineSetupComplete={!!machineSettings.isConfigured}
        isToolLibrarySetupComplete={toolLibrary.length > 0}
      />
      <ContactModal
        isOpen={activeModal === ModalType.Contact}
        onClose={uiActions.closeModal}
      />
      <PreflightChecklistModal
        isOpen={activeModal === ModalType.Preflight}
        onCancel={uiActions.closeModal}
        onConfirm={handleStartJobConfirmed}
        jobInfo={{
          fileName,
          gcodeLines,
          timeEstimate,
          startLine: jobStartOptions.startLine,
        }}
        isHomed={isHomedSinceConnect}
        warnings={preflightWarnings}
        selectedTool={selectedTool}
      />
      <SpindleConfirmationModal
        isOpen={activeModal === ModalType.SpindleConfirmation}
        onClose={uiActions.closeModal}
        onConfirm={(startSpindle) => {
          spindleModalArgs.onConfirm(startSpindle);
          uiActions.closeModal();
        }}
        title={spindleModalArgs.title}
        message={spindleModalArgs.message}
      />
      <InfoModal
        isOpen={activeModal === ModalType.Info}
        onClose={uiActions.closeModal}
        title={infoModalTitle}
        message={infoModalMessage}
      />
      <MacroEditorModal
        isOpen={activeModal === ModalType.MacroEditor}
        onCancel={uiActions.closeModal}
        onSave={() => {}}
        onDelete={() => {}}
        macro={editingMacroIndex !== null ? macros[editingMacroIndex] : null}
        index={editingMacroIndex}
      />
      <SettingsModal
        isOpen={activeModal === ModalType.Settings}
        onCancel={() => {
          uiActions.closeModal();
          if (returnToWelcome) {
            uiActions.openModal(ModalType.Welcome);
            uiActions.setReturnToWelcome(false);
          }
        }}
        onSave={(newSettings, newGeneratorSettings) => {
          settingsActions.setMachineSettings({
            ...newSettings,
            isConfigured: true,
          });
          settingsActions.setGeneratorSettings(newGeneratorSettings);
        }}
        settings={machineSettings}
        generatorSettings={generatorSettings}
        onResetDialogs={() => {}}
        onExport={() => {}}
        onImport={() => {}}
      />
      <ToolLibraryModal
        isOpen={activeModal === ModalType.ToolLibrary}
        onCancel={() => {
          uiActions.closeModal();
          if (returnToWelcome) {
            uiActions.openModal(ModalType.Welcome);
            uiActions.setReturnToWelcome(false);
          }
        }}
        onSave={settingsActions.setToolLibrary}
        library={toolLibrary}
      />
      {activeModal === ModalType.GCodeGenerator && (
        <ErrorBoundary>
          <GCodeGeneratorModal
            isOpen={true} // Always true when activeModal is GCodeGenerator
            onClose={uiActions.closeModal}
            onLoadGCode={(gcode, name) => {
              jobActions.loadFile(gcode, name);
              uiActions.closeModal();
            }}
            unit={unit}
            settings={machineSettings}
            toolLibrary={toolLibrary}
            selectedToolId={selectedToolId}
            onToolSelect={uiActions.setSelectedToolId}
            generatorSettings={generatorSettings}
            onSettingsChange={settingsActions.setGeneratorSettings}
          />
        </ErrorBoundary>
      )}
    </>
  );
};

export default AppModals;