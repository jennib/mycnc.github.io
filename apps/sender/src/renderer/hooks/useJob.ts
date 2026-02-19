import { useCallback, useState } from 'react';
import { useJobStore } from '@/stores/jobStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { useLogStore } from '@/stores/logStore';
import { analyzeGCodeWithWorker, getMachineStateAtLine } from '@mycnc/shared';
import AnalysisWorker from '../workers/gcodeAnalysisWorker?worker';
import { JobStatus, TimeEstimate, Tool } from "@mycnc/shared";

export function useJob() {
  const { gcodeLines, fileName, jobStatus, progress, timeEstimate, actions: jobActions } = useJobStore();
  const { isConnected } = useConnectionStore();
  const { machineSettings } = useSettingsStore();
  const { isPreflightModalOpen, preflightWarnings, actions: uiActions } = useUIStore();
  const { actions: logActions } = useLogStore();
  const [jobStartOptions, setJobStartOptions] = useState({ startLine: 0, isDryRun: false });

  const handleJobControl = useCallback(async (action: 'start' | 'pause' | 'resume' | 'stop' | 'gracefulStop', options?: { startLine?: number }) => {
    // Check if Remote Client
    if (window.electronAPI && !window.electronAPI.isElectron && window.electronAPI.sendRemoteAction && action !== 'start') {
      console.log(`Remote Client: Delegating ${action.toUpperCase()}_JOB to Host`);
      let type = '';
      if (action === 'pause') type = 'PAUSE_JOB';
      else if (action === 'resume') type = 'RESUME_JOB';
      else if (action === 'stop' || action === 'gracefulStop') type = 'STOP_JOB';

      if (type) {
        window.electronAPI.sendRemoteAction({ type });
        return;
      }
    }

    const controller = useConnectionStore.getState().controller;
    if (!controller || !isConnected) return;

    switch (action) {
      case 'start':
        console.log("Job Start requested. GCode lines:", gcodeLines.length);
        if (gcodeLines.length > 0) {
          try {
            console.log("Starting GCode analysis...");
            const analysisPromise = analyzeGCodeWithWorker(() => new AnalysisWorker(), gcodeLines, machineSettings);
            const timeoutPromise = new Promise<any[]>((resolve) => setTimeout(() => resolve([{ type: 'warning', message: 'Analysis timed out. Network slow?' }]), 3000));
            // Race analysis with timeout
            const warnings = await Promise.race([analysisPromise, timeoutPromise]);

            console.log("Analysis complete. Warnings:", warnings);
            uiActions.setPreflightWarnings(warnings);
          } catch (error) {
            console.error("GCode analysis failed:", error);
            uiActions.setPreflightWarnings([{ type: 'warning', message: 'Pre-flight analysis failed. Proceed with caution.' }]);
          }
          setJobStartOptions({ startLine: options?.startLine ?? 0, isDryRun: false });
          console.log("Opening preflight modal");
          uiActions.openPreflightModal();
        } else {
          console.warn("Cannot start: No GCode loaded.");
        }
        break;
      case 'pause':
        if (jobStatus === JobStatus.Running) {
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
      case 'gracefulStop':
        if (jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused) {
          controller.stopJob();
          jobActions.setProgress(0);
          jobActions.setJobStatus(JobStatus.Stopped);
        }
        break;
    }
  }, [isConnected, gcodeLines, machineSettings, jobStatus, uiActions, jobActions]);

  const handleStartJobConfirmed = useCallback((options: { isDryRun: boolean }) => {
    // Check if Remote Client
    if (window.electronAPI && !window.electronAPI.isElectron) {
      console.log("Remote Client: Delegating Start Job to Host via Remote Action");
      if (window.electronAPI.sendRemoteAction) {
        window.electronAPI.sendRemoteAction({
          type: 'START_JOB',
          payload: { startLine: jobStartOptions.startLine, isDryRun: options.isDryRun }
        });
        uiActions.closePreflightModal();
        return;
      }
    }

    const controller = useConnectionStore.getState().controller;

    // Debug logging
    if (!controller) {
      console.error("Start Job Failed: Controller is null.");
      logActions.addLog({ type: 'error', message: "Cannot start job: Controller not found." });
      return;
    }
    if (!isConnected) {
      console.error("Start Job Failed: Not Connected.");
      logActions.addLog({ type: 'error', message: "Cannot start job: Not connected." });
      return;
    }
    if (gcodeLines.length === 0) {
      console.error("Start Job Failed: No GCode.");
      logActions.addLog({ type: 'error', message: "Cannot start job: No GCode loaded." });
      return;
    }

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
    // jobStartOptions already returned above? No, checked previous view_file, it was returned at line 144
  };
}
