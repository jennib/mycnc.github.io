import React, { useRef, useState, useEffect, DragEvent, memo, Suspense } from "react";
import { useTranslation } from "react-i18next";

import { JobStatus, MachineState, Tool, MachineSettings } from "../types";
import {
  Play,
  Pause,
  Square,
  Upload,
  FileText,
  Code,
  Eye,
  Maximize,
  Pencil,
  CheckCircle,
  X,
  Save,
  Plus,
  Minus,
  RefreshCw,
  Percent,
  ZoomIn,
  ZoomOut,
  Clock,
  BookOpen,
  Crosshair,
  Zap,
  AlertTriangle,
} from "./Icons";
import type { GCodeVisualizerHandle } from "./GCodeVisualizer";
import GCodeLine from "./GCodeLine";
import { useUndoRedo } from "../hooks/useUndoRedo";

const GCodeVisualizer = React.lazy(() => import("./GCodeVisualizer"));
const GCodeEditorModal = React.lazy(() => import("./GCodeEditorModal"));

interface OverrideControlProps {
  label: string;
  value: number;
  onOverride: (
    command: "reset" | "inc10" | "dec10" | "inc1" | "dec1"
  ) => void;
  min: number;
  max: number;
  className?: string;
}

const OverrideControl: React.FC<OverrideControlProps> = ({
  label,
  value,
  onOverride,
  min,
  max,
  className = "",
}) => {
  const { t } = useTranslation();
  const [sliderValue, setSliderValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [ignoreUpdates, setIgnoreUpdates] = useState(false);
  const lastSentValue = useRef(value);
  const ignoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync slider with machine state when not dragging and not ignoring updates
  useEffect(() => {
    if (!isDragging && !ignoreUpdates) {
      setSliderValue(value);
      lastSentValue.current = value;
    }
  }, [value, isDragging, ignoreUpdates]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setSliderValue(newValue);
  };

  const handleSliderCommit = () => {
    setIsDragging(false);
    setIgnoreUpdates(true);

    // Clear any existing timeout
    if (ignoreTimeoutRef.current) {
      clearTimeout(ignoreTimeoutRef.current);
    }

    // Re-enable updates after a delay to allow round-trip
    ignoreTimeoutRef.current = setTimeout(() => {
      setIgnoreUpdates(false);
    }, 1500);

    let targetValue = sliderValue;
    let diff = targetValue - lastSentValue.current;

    if (diff === 0) return;

    // If resetting to 100, use the reset command for precision
    if (targetValue === 100) {
      onOverride("reset");
      lastSentValue.current = 100;
      return;
    }

    // Send commands to bridge the gap

    const sendCommands = () => {
      // Calculate 10% steps
      while (diff >= 10) {
        onOverride("inc10");
        diff -= 10;
      }
      while (diff <= -10) {
        onOverride("dec10");
        diff += 10;
      }

      // Calculate 1% steps
      while (diff >= 1) {
        onOverride("inc1");
        diff -= 1;
      }
      while (diff <= -1) {
        onOverride("dec1");
        diff += 1;
      }
    };

    sendCommands();
    lastSentValue.current = targetValue;
  };

  return (
    <div className={`bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</span>
          <span className="text-sm font-mono font-bold text-primary">{sliderValue}%</span>
        </div>
        <button
          onClick={() => {
            onOverride("reset");
            setSliderValue(100);
            lastSentValue.current = 100;
          }}
          className="text-[10px] text-text-secondary hover:text-primary transition-colors uppercase font-bold tracking-wide"
          title={t('gcode.controls.resetTitle')}
        >
          {t('gcode.controls.reset')}
        </button>
      </div>

      <div className="relative w-full h-4 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={handleSliderCommit}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={handleSliderCommit}
          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-focus transition-all"
        />
      </div>
    </div>
  );
};

interface GCodePanelProps {
  onFileLoad: (content: string, name: string) => void;
  fileName: string;
  gcodeLines: string[];
  onJobControl: (
    action: "start" | "pause" | "resume" | "stop" | "gracefulStop",
    options?: { startLine?: number }
  ) => void;
  jobStatus: JobStatus;
  progress: number;
  isConnected: boolean;
  unit: "mm" | "in";
  onGCodeChange: (content: string) => void;
  onClearFile?: () => void;
  machineState: MachineState | null;
  onFeedOverride: (
    command: "reset" | "inc10" | "dec10" | "inc1" | "dec1"
  ) => void;
  onSpindleOverride: (
    command: "reset" | "inc10" | "dec10" | "inc1" | "dec1"
  ) => void;
  timeEstimate: { totalSeconds: number; cumulativeSeconds: number[] };
  machineSettings: MachineSettings;
  toolLibrary: Tool[];
  selectedToolId: number | null;
  onToolSelect: (id: number | null) => void;
  onOpenGenerator: () => void;
  isSimulated: boolean;
}

const formatTime = (totalSeconds: number): string => {
  if (totalSeconds === Infinity) return "∞";
  if (totalSeconds < 1) return "...";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
};

const GCodePanel: React.FC<GCodePanelProps> = ({
  onFileLoad,
  fileName,
  gcodeLines,
  onJobControl,
  jobStatus,
  progress,
  isConnected,
  unit,
  onGCodeChange,
  onClearFile,
  machineState,
  onFeedOverride,
  onSpindleOverride,
  timeEstimate,
  machineSettings,
  toolLibrary,
  selectedToolId,
  onToolSelect,
  onOpenGenerator,
  isSimulated,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visualizerRef = useRef<GCodeVisualizerHandle>(null);

  const [isAdvancedEditorOpen, setIsAdvancedEditorOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [scrubberLine, setScrubberLine] = useState(0); // New state for the scrubber

  const isHoming = machineState?.status === "Home";
  const isJobActive =
    jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused;

  const containerHeight = 0; // Removed code view
  const visibleLines = 0; // Removed code view
  const startIndex = 0; // Removed code view
  const endIndex = 0; // Removed code view

  const totalLines = gcodeLines.length;
  const currentLine = Math.floor((progress / 100) * totalLines);

  const visualizerCurrentLine = isJobActive ? currentLine : scrubberLine;



  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target?.result;
        onFileLoad(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  // Advanced Editor handlers
  const handleAdvancedEditorSaveToApp = (content: string) => {
    onGCodeChange(content);
    setIsAdvancedEditorOpen(false);
  };

  const handleAdvancedEditorSaveToDisk = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRunFromLine = (lineNumber: number) => {
    // Line numbers are 1-based, array indices are 0-based
    onJobControl("start", { startLine: lineNumber - 1 });
  };

  const isReadyToStart =
    (isConnected || isSimulated) && // Allow starting if simulator is selected
    gcodeLines.length > 0 &&
    (jobStatus === JobStatus.Idle ||
      jobStatus === JobStatus.Stopped ||
      jobStatus === JobStatus.Complete) &&
    !isHoming;



  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (
      file &&
      (file.name.endsWith(".gcode") ||
        file.name.endsWith(".nc") ||
        file.name.endsWith(".txt"))
    ) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onFileLoad(ev.target?.result as string, file.name);
      };
      reader.readAsText(file);

    }
  };

  const renderContent = () => {
    if (gcodeLines.length > 0) {
      return (
        <div className="absolute inset-0 overflow-hidden flex flex-col">
          <div className="flex-grow relative min-h-0">
            <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <GCodeVisualizer
                ref={visualizerRef}
                gcodeLines={gcodeLines}
                currentLine={visualizerCurrentLine} // Use visualizerCurrentLine
                unit={unit}
                hoveredLineIndex={hoveredLineIndex}
                machineSettings={machineSettings}
              />
            </Suspense>
          </div>
          {/* Scrubber (Hidden during job) */}
          {gcodeLines.length > 0 && !isJobActive && (
            <div className="flex-shrink-0 p-2 bg-surface/50 border-t border-white/5 flex items-center gap-3 backdrop-blur-sm">
              <span className="text-xs font-mono text-text-secondary w-12 text-right">{scrubberLine}</span>
              <input
                type="range"
                min="0"
                max={gcodeLines.length > 0 ? gcodeLines.length - 1 : 0}
                value={scrubberLine}
                onChange={(e) => setScrubberLine(parseInt(e.target.value))}
                className="flex-grow h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-focus transition-all"
                title="Scrub G-code Toolpath"
              />
              <span className="text-xs font-mono text-text-secondary w-12">{gcodeLines.length}</span>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary">
        <FileText className="w-16 h-16 mb-4 opacity-20" />
        <p className="font-medium">{t('gcode.status.noFile')}</p>
        <p className="text-sm opacity-70">{t('gcode.status.loadInstruction')}</p>
      </div>
    );
  };

  const renderJobControls = () => {
    if (isReadyToStart) {
      return (
        <button
          onClick={() => onJobControl("start", { startLine: 0 })}
          disabled={!isReadyToStart}
          className="col-span-3 flex items-center justify-center gap-2 p-3 bg-accent-green text-white font-bold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-surface transition-all shadow-lg shadow-green-900/20 disabled:bg-secondary disabled:cursor-not-allowed disabled:shadow-none text-lg"
          title="Start Job"
        >
          <Play className="w-6 h-6" />
        </button>
      );
    }

    if (jobStatus === JobStatus.Running) {
      return (
        <>
          <button
            key="pause"
            onClick={() => onJobControl("pause")}
            disabled={isHoming}
            className="flex items-center justify-center gap-2 p-3 bg-accent-yellow text-white font-bold rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-surface transition-all shadow-lg shadow-yellow-900/20 text-lg disabled:bg-secondary disabled:cursor-not-allowed disabled:shadow-none"
            title="Pause Job"
          >
            <Pause className="w-6 h-6" />
          </button>
          <div className="relative col-span-2">
            <button
              key="stop"
              onClick={() => onJobControl("stop")}
              disabled={isHoming}
              className="w-full flex items-center justify-center gap-2 p-3 bg-accent-red text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-all shadow-lg shadow-red-900/20 text-lg disabled:bg-secondary disabled:cursor-not-allowed disabled:shadow-none"
              title="Stop Job"
            >
              <Square className="w-6 h-6" />
            </button>
          </div>
        </>
      );
    }

    if (jobStatus === JobStatus.Paused) {
      return (
        <>
          <button
            key="resume"
            onClick={() => onJobControl("resume")}
            disabled={isHoming}
            className="flex items-center justify-center gap-2 p-3 bg-accent-green text-white font-bold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-surface transition-all shadow-lg shadow-green-900/20 text-lg disabled:bg-secondary disabled:cursor-not-allowed disabled:shadow-none"
            title="Resume Job"
          >
            <Play className="w-6 h-6" />
          </button>
          <div className="col-span-2">
            <button
              key="stop"
              onClick={() => onJobControl("stop")}
              disabled={isHoming}
              className="w-full flex items-center justify-center gap-2 p-3 bg-accent-red text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-all shadow-lg shadow-red-900/20 text-lg disabled:bg-secondary disabled:cursor-not-allowed disabled:shadow-none"
              title="Stop Job"
            >
              <Square className="w-6 h-6" />
            </button>
          </div>
        </>
      );
    }

    return null;
  };

  const { totalSeconds, cumulativeSeconds: cumulativeSecondsEstimate } = timeEstimate || {
    totalSeconds: 0,
    cumulativeSeconds: [],
  };
  let displayTime = totalSeconds;
  let timeLabel = t('gcode.status.estTime');
  let timeTitle = t('gcode.status.estJobTime');

  if (isJobActive && totalSeconds > 0 && cumulativeSecondsEstimate) {
    const feedMultiplier = (machineState?.ov?.[0] ?? 100) / 100;
    timeLabel = t('gcode.status.timeRem');
    timeTitle = t('gcode.status.estTimeRem');
    if (feedMultiplier > 0) {
      const timeElapsedAt100 =
        currentLine > 0 && cumulativeSecondsEstimate[currentLine - 1]
          ? cumulativeSecondsEstimate[currentLine - 1]
          : 0;
      const timeRemainingAt100 = totalSeconds - timeElapsedAt100;
      displayTime = timeRemainingAt100 / feedMultiplier;
    } else {
      displayTime = Infinity; // If feedMultiplier is 0, time remaining is infinite
    }
  }

  return (
    <div
      className="flex flex-col h-full relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10 flex-shrink-0 px-2 pt-2">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold tracking-tight">{t('gcode.title')}</h2>
          <div className="flex items-center bg-background/80 rounded-lg p-1 border border-white/10">

            {gcodeLines.length > 0 && (
              <>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                  onClick={() => visualizerRef.current?.resetView()}
                  title={t('gcode.view.reset')}
                  className="p-1.5 rounded-md transition-colors hover:bg-secondary text-text-secondary hover:text-text-primary"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
                <button
                  onClick={() => visualizerRef.current?.fitView()}
                  title={t('gcode.view.fit')}
                  className="p-1.5 rounded-md transition-colors hover:bg-secondary text-text-secondary hover:text-text-primary"
                >
                  <Maximize className="w-4 h-4" />
                </button>
                <button
                  onClick={() => visualizerRef.current?.zoomIn()}
                  title={t('gcode.view.zoomIn')}
                  className="p-1.5 rounded-md transition-colors hover:bg-secondary text-text-secondary hover:text-text-primary"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => visualizerRef.current?.zoomOut()}
                  title={t('gcode.view.zoomOut')}
                  className="p-1.5 rounded-md transition-colors hover:bg-secondary text-text-secondary hover:text-text-primary"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdvancedEditorOpen(true)}
            disabled={isJobActive}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary/80 text-text-primary font-semibold rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title={t('gcode.editor.advancedEdit')}
          >
            <Code className="w-4 h-4" />
            {t('gcode.editor.edit')}
          </button>
          <button
            onClick={onOpenGenerator}
            disabled={isJobActive}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title={t('gcode.actions.generateTitle')}
          >
            <Zap className="w-4 h-4" />
            {t('gcode.actions.generate')}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".gcode,.nc,.txt"
          />
          <button
            onClick={handleUploadClick}
            disabled={isJobActive}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary/80 text-text-primary font-semibold rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title={t('gcode.actions.load')}
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={onClearFile}
            disabled={isJobActive || gcodeLines.length === 0}
            className="p-1.5 bg-secondary/80 text-text-primary font-semibold rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('gcode.actions.clear')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-2 pt-1">
        {fileName && (
          <p
            className="text-xs text-text-secondary truncate mb-2 font-mono"
            title={fileName}
          >
            <strong className="text-text-primary">{t('gcode.status.file')} </strong>
            {fileName}
          </p>
        )}
        <div className="space-y-2 flex-shrink-0 mb-2">
          <div className="grid grid-cols-3 gap-2">{renderJobControls()}</div>
          {!isConnected && gcodeLines.length > 0 && (
            <div className="bg-accent-yellow/20 border border-accent-yellow/50 text-accent-yellow p-2 rounded-lg text-center backdrop-blur-sm">
              <p className="font-bold text-sm">{t('gcode.status.notConnected')}</p>
              <p className="text-xs opacity-90">
                {t('gcode.status.connectMessage')}
              </p>
            </div>
          )}
          <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs font-medium text-text-secondary">
            <p>
              {t('gcode.status.label')} <span className={`font-bold capitalize ${jobStatus === JobStatus.Running ? 'text-accent-green' : 'text-text-primary'}`}>{jobStatus}</span>
              {isJobActive && totalLines > 0 && (
                <span className="ml-2 font-mono bg-background/50 px-1.5 py-0.5 rounded text-[10px]">{`${currentLine} / ${totalLines}`}</span>
              )}
            </p>
            <div className="flex items-center gap-4">
              {gcodeLines.length > 0 && totalSeconds > 0 && (
                <div
                  title={timeTitle}
                  className="flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{`${timeLabel}:`}</span>
                  <span className="font-mono ml-1 text-text-primary">
                    {formatTime(displayTime)}
                  </span>
                </div>
              )}
              <p className="font-bold text-text-primary">{`${progress.toFixed(1)}%`}</p>
            </div>
          </div>
        </div>
      </div>


      <div className="flex-grow relative min-h-0 mx-2 mb-2 rounded-lg overflow-hidden border border-white/10 bg-background/50">
        {renderContent()}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm border-4 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center pointer-events-none z-50">
            <Upload className="w-16 h-16 text-white animate-bounce" />
            <p className="text-xl font-bold text-white mt-4">
              {t('gcode.status.drop')}
            </p>
          </div>
        )}
      </div>
      {isJobActive && (
        <div className="mt-auto px-2 pb-2 flex-shrink-0 grid grid-cols-2 gap-2">
          <OverrideControl
            label={t('gcode.controls.feedRate')}
            value={machineState?.ov?.[0] ?? 100}
            onOverride={onFeedOverride}
            min={10}
            max={300}
          />
          <OverrideControl
            label={t('gcode.controls.spindle')}
            value={machineState?.ov?.[2] ?? 100}
            onOverride={onSpindleOverride}
            min={20}
            max={200}
          />
        </div>
      )}

      {/* Advanced G-code Editor Modal */}
      <Suspense fallback={null}>
        {isAdvancedEditorOpen && (
          <GCodeEditorModal
            isOpen={isAdvancedEditorOpen}
            onClose={() => setIsAdvancedEditorOpen(false)}
            initialContent={gcodeLines.join("\n")}
            fileName={fileName || "untitled.gcode"}
            onSaveToApp={handleAdvancedEditorSaveToApp}
            onSaveToDisk={handleAdvancedEditorSaveToDisk}
            machineSettings={machineSettings}
            unit={unit}
          />
        )}
      </Suspense>
    </div>
  );
};

export default memo(GCodePanel);
