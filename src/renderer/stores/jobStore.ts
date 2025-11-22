import { create } from 'zustand';
import { JobStatus } from '../types';
import { estimateGCodeTime } from '../services/gcodeTimeEstimator.js';

interface TimeEstimate {
  totalSeconds: number;
  cumulativeSeconds: number[];
}

interface JobState {
  gcodeLines: string[];
  fileName: string;
  jobStatus: JobStatus;
  progress: number;
  timeEstimate: TimeEstimate;
  actions: {
    loadFile: (content: string, name: string) => void;
    updateGCode: (content: string) => void;
    clearFile: () => void;
    setJobStatus: (status: JobStatus) => void;
    setProgress: (progress: number) => void;
  };
}

const initialState = {
  gcodeLines: [],
  fileName: '',
  jobStatus: JobStatus.Idle,
  progress: 0,
  timeEstimate: { totalSeconds: 0, cumulativeSeconds: [] },
};

const cleanGCode = (content: string): string[] => {
  return content
    .split('\n')
    .map((l) => l.replace(/\(.*?\)/g, '')) // Remove parenthetical comments
    .map((l) => l.split(';')[0]) // Remove semicolon comments
    .map((l) => l.trim())
    .filter((l) => l && l !== '%'); // Filter empty lines and program start/end markers
};

export const useJobStore = create<JobState>((set) => ({
  ...initialState,
  actions: {
    loadFile: (content, name) => {
      const lines = cleanGCode(content);
      set({
        gcodeLines: lines,
        fileName: name,
        jobStatus: JobStatus.Idle,
        progress: 0,
        timeEstimate: estimateGCodeTime(lines),
      });
    },
    updateGCode: (content) => {
      const lines = cleanGCode(content);
      set((state) => ({
        gcodeLines: lines,
        fileName: state.fileName.endsWith(' (edited)') ? state.fileName : `${state.fileName || 'untitled.gcode'} (edited)`,
        jobStatus: JobStatus.Idle,
        progress: 0,
        timeEstimate: estimateGCodeTime(lines),
      }));
    },
    clearFile: () => set(initialState),
    setJobStatus: (status) => set({ jobStatus: status }),
    setProgress: (progress) => set({ progress }),
  },
}));
