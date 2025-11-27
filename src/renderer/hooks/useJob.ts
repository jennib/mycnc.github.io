import { useCallback, useState } from 'react';
import { useJobStore } from '@/stores/jobStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { useLogStore } from '@/stores/logStore';
import { analyzeGCodeWithWorker, getMachineStateAtLine } from '@/services/gcodeAnalyzer.js';
import { JobStatus, TimeEstimate, Tool } from '@/types';

export function useJob() {
  const { gcodeLines, fileName, jobStatus, progress, timeEstimate, actions: jobActions } = useJobStore();
  const { isConnected } = useConnectionStore();
  const { machineSettings } = useSettingsStore();
  const { actions: uiActions } = useUIStore();
  const { actions: logActions } = useLogStore();
  const [jobStartOptions, setJobStartOptions] = useState({ startLine: 0, isDryRun: false });
  const [preflightWarnings, setPreflightWarnings] = useState<any[]>([]);

  const handleJobControl = useCallback(async (action: 'start' | 'pause' | 'resume' | 'stop', options?: { startLine?: number }) => {
    const controller = useConnectionStore.getState().controller;
    if (!controller || !isConnected) return;

    switch (action) {
      case 'start':
        if (gcodeLines.length > 0) {
          const warnings = await analyzeGCodeWithWorker(gcodeLines, machineSettings);
          setPreflightWarnings(warnings);
          setJobStartOptions({ startLine: options?.startLine ?? 0, isDryRun: false });
          uiActions.openPreflightModal();
        }
        break;
      case 'pause':
        if (jobStatus === JobStatus.Running) {
          // Spindle check logic would need to be in the controller or we access state directly
          // For now, let's assume controller handles safety or we check machine state from store

          await controller.pause();
          jobActions.setJobStatus(JobStatus.Paused);
        }
        break;
      case 'resume':
        if (jobStatus === JobStatus.Paused) {
          await controller.resume();
          jobActions.setJobStatus(JobStatus.Running);
        }
        break;
      case 'stop':
        if (jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused) {
          controller.stopJob();
          jobActions.setProgress(0);
          jobActions.setJobStatus(JobStatus.Stopped);
        }
        break;
    }
  }, [isConnected, gcodeLines, machineSettings, jobStatus, uiActions, jobActions]);

  const handleStartJobConfirmed = useCallback((options: { isDryRun: boolean }) => {
    const controller = useConnectionStore.getState().controller;
    if (!controller || !isConnected || gcodeLines.length === 0) return;

    const { startLine } = jobStartOptions;
    const { isDryRun } = options;

    const startJob = async (startSpindle: boolean) => {
      if (startLine > 0) {
        logActions.addLog({ type: 'status', message: `Calculating machine state for line ${startLine + 1}...` });
        const state = getMachineStateAtLine(gcodeLines, startLine);
        const setupCommands: string[] = [
          state.workCoordinateSystem,
          state.unitMode,
          state.distanceMode,
        ];
        if (state.feedRate) {
          setupCommands.push(`F${state.feedRate}`);
        }
        if (
          startSpindle &&
          !isDryRun &&
          (state.spindle === 'M3' || state.spindle === 'M4') &&
          state.speed &&
          state.speed > 0
        ) {
          setupCommands.push(`${state.spindle} S${state.speed}`, 'G4 P1');
        }
        if (!isDryRun && (state.coolant === 'M7' || state.coolant === 'M8')) {
          setupCommands.push(state.coolant);
        }
        logActions.addLog({ type: 'status', message: `Restoring machine state: ${setupCommands.join(', ')}` });
        for (const command of setupCommands) {
          try {
            await controller.sendCommand(command);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logActions.addLog({ type: 'error', message: `Failed to set initial state with command '${command}': ${errorMessage}` });
            jobActions.setJobStatus(JobStatus.Idle);
            return;
          }
        }
      }
      jobActions.setJobStatus(JobStatus.Running);
      controller.sendGCode(gcodeLines, { startLine, isDryRun });
    };

    uiActions.closePreflightModal();
    if (startLine === 0) {
      startJob(true);
    } else {
      uiActions.openSpindleModal({
        onConfirm: startJob,
        title: 'Start Job from Line',
        message: `Starting from line ${startLine + 1}. Do you want to turn the spindle on?`,
      });
    }
  }, [isConnected, gcodeLines, jobStartOptions, logActions, jobActions, uiActions]);

  return {
    gcodeLines,
    fileName,
    jobStatus,
    progress,
    timeEstimate,
    jobActions,
    jobStartOptions,
    preflightWarnings,
    handleJobControl,
    handleStartJobConfirmed,
  };
}
