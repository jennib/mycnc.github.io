import React, { useRef, useState, useEffect, DragEvent, memo } from "react";

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
import GCodeVisualizer, { GCodeVisualizerHandle } from "./GCodeVisualizer";
import GCodeLine from "./GCodeLine";

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
    <div className={`bg-background px-3 py-2 rounded-md ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-secondary">{label}</span>
          <span className="text-sm font-mono font-bold text-primary">{sliderValue}%</span>
        </div>
        <button
          onClick={() => {
            onOverride("reset");
            setSliderValue(100);
            lastSentValue.current = 100;
          }}
          className="text-[10px] text-text-secondary hover:text-primary transition-colors"
          title="Reset to 100%"
        >
          Reset
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
          className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visualizerRef = useRef<GCodeVisualizerHandle>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"visualizer" | "code">("visualizer");
  const [isEditing, setIsEditing] = useState(false);
  const [editedGCode, setEditedGCode] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [scrubberLine, setScrubberLine] = useState(0); // New state for the scrubber

  const isHoming = machineState?.status === "Home";
  const isJobActive =
    jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused;

  const lineHeight = 20; // Approximate height of a single line
  const containerHeight = codeContainerRef.current?.clientHeight || 0;
  const visibleLines = Math.ceil(containerHeight / lineHeight);
  const startIndex = Math.floor(scrollTop / lineHeight);
  const endIndex = Math.min(gcodeLines.length - 1, startIndex + visibleLines);

  const totalLines = gcodeLines.length;
  const currentLine = Math.floor((progress / 100) * totalLines);

  const visualizerCurrentLine = isJobActive ? currentLine : scrubberLine;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    setEditedGCode(gcodeLines.join("\n"));
    setIsEditing(false); // Exit edit mode on new file load
  }, [gcodeLines]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target?.result;
        onFileLoad(content, file.name);
      };
      reader.readAsText(file);
      setView("visualizer"); // Default to visualizer on new file
    }
  };

  const handleSave = () => {
    onGCodeChange(editedGCode);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedGCode(gcodeLines.join("\n"));
    setIsEditing(false);
  };

  const handleSaveToDisk = () => {
    const blob = new Blob([editedGCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    let suggestedFilename = fileName || "untitled.gcode";
    if (suggestedFilename.endsWith(" (edited)")) {
      const base = suggestedFilename.replace(" (edited)", "");
      const parts = base.split(".");
      if (parts.length > 1) {
        const ext = parts.pop();
        suggestedFilename = `${parts.join(".")}-edited.${ext}`;
      } else {
        suggestedFilename = `${base}-edited`;
      }
    }

    a.download = suggestedFilename;
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

  useEffect(() => {
    if (
      (jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused) &&
      view === "code" &&
      codeContainerRef.current
    ) {
      const lineIndexToScroll = currentLine;

      if (lineIndexToScroll >= gcodeLines.length) return;

      const container = codeContainerRef.current;
      const lineElement = container.children[lineIndexToScroll] as HTMLElement;

      if (lineElement) {
        // Manually calculate the scroll position to center the element
        // within the scrollable container.
        const containerHeight = container.clientHeight;
        const lineElementOffsetTop = lineElement.offsetTop;
        const lineElementHeight = lineElement.offsetHeight;

        const scrollTop =
          lineElementOffsetTop - containerHeight / 2 + lineElementHeight / 2;

        container.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      }
    }
  }, [currentLine, jobStatus, view, gcodeLines.length]);

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
      setView("visualizer");
    }
  };

  const renderContent = () => {
    if (gcodeLines.length > 0) {
      if (view === "visualizer")
        return (
          <div className="absolute inset-0 overflow-hidden flex flex-col">
            <div className="flex-grow relative min-h-0">
              <GCodeVisualizer
                ref={visualizerRef}
                gcodeLines={gcodeLines}
                currentLine={visualizerCurrentLine} // Use visualizerCurrentLine
                unit={unit}
                hoveredLineIndex={hoveredLineIndex}
                machineSettings={machineSettings}
              />
            </div>
            {/* Scrubber / Progress Bar */}
            {gcodeLines.length > 0 && (
              <div className="flex-shrink-0 p-2 bg-surface border-t border-secondary flex items-center gap-3">
                <span className="text-xs font-mono text-text-secondary w-12 text-right">
                  {isJobActive ? currentLine : scrubberLine}
                </span>

                {isJobActive ? (
                  <div className="flex-grow h-2 bg-gray-200 rounded-lg dark:bg-gray-700 overflow-hidden relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-linear"
                      style={{ width: `${(currentLine / (gcodeLines.length - 1)) * 100}%` }}
                    />
                  </div>
                ) : (
                  <input
                    type="range"
                    min="0"
                    max={gcodeLines.length > 0 ? gcodeLines.length - 1 : 0}
                    value={scrubberLine}
                    onChange={(e) => setScrubberLine(parseInt(e.target.value))}
                    className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                    title="Scrub G-code Toolpath"
                  />
                )}

                <span className="text-xs font-mono text-text-secondary w-12">{gcodeLines.length}</span>
              </div>
            )}
          </div>
        );
      if (view === "code" && machineSettings) {
        if (isEditing)
          return (
            <textarea
              className="w-full h-full absolute inset-0 bg-background font-mono text-sm p-2 rounded border border-secondary focus:ring-primary focus:border-primary"
              value={editedGCode}
              onChange={(e) => setEditedGCode(e.target.value)}
              spellCheck="false"
            />
          );
        return (
          <div
            className="absolute inset-0 bg-background rounded p-2 overflow-y-auto font-mono text-sm"
            ref={codeContainerRef}
            onScroll={handleScroll} // Add scroll handler
          >
            {/* This container sets the total scrollable height */}
            <div
              style={{
                height: `${gcodeLines.length * lineHeight}px`,
                position: "relative",
              }}
            >
              {/* Only render the visible lines */}
              {gcodeLines.slice(startIndex, endIndex + 1).map((line, index) => {
                const actualIndex = startIndex + index;
                return (
                  <div
                    key={actualIndex}
                    style={{
                      position: "absolute",
                      top: `${actualIndex * lineHeight}px`,
                      height: `${lineHeight}px`,
                      width: "100%",
                    }}
                  >
                    <GCodeLine
                      line={line}
                      lineNumber={actualIndex + 1}
                      isExecuted={actualIndex < currentLine}
                      isCurrent={isJobActive && actualIndex === currentLine}
                      isHovered={actualIndex === hoveredLineIndex}
                      onRunFromHere={handleRunFromLine}
                      isActionable={isReadyToStart}
                      onMouseEnter={() => setHoveredLineIndex(actualIndex)}
                      onMouseLeave={() => setHoveredLineIndex(null)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary">
        <FileText className="w-16 h-16 mb-4" />
        <p>No G-code file loaded.</p>
        <p>Click "Load File" or drag and drop here to begin.</p>
      </div>
    );
  };

  const renderJobControls = () => {
    if (isReadyToStart) {
      return (
        <button
          onClick={() => onJobControl("start", { startLine: 0 })}
          disabled={!isReadyToStart}
          className="col-span-3 flex items-center justify-center gap-2 p-3 bg-accent-green text-white font-bold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:bg-secondary disabled:cursor-not-allowed text-lg"
        >
          <Play className="w-6 h-6" />
          Start Job
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
            className="flex items-center justify-center gap-2 p-3 bg-accent-yellow text-white font-bold rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-lg disabled:bg-secondary disabled:cursor-not-allowed"
          >
            <Pause className="w-6 h-6" />
            Pause
          </button>
          <div className="relative col-span-2">
            <button
              key="stop"
              onClick={() => onJobControl("stop")}
              disabled={isHoming}
              className="w-full flex items-center justify-center gap-2 p-3 bg-accent-red text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-lg disabled:bg-secondary disabled:cursor-not-allowed"
            >
              <Square className="w-6 h-6" />
              Stop Job
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
            className="flex items-center justify-center gap-2 p-3 bg-accent-green text-white font-bold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-lg disabled:bg-secondary disabled:cursor-not-allowed"
          >
            <Play className="w-6 h-6" />
            Resume
          </button>
          <div className="col-span-2">
            <button
              key="stop"
              onClick={() => onJobControl("stop")}
              disabled={isHoming}
              className="w-full flex items-center justify-center gap-2 p-3 bg-accent-red text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-lg disabled:bg-secondary disabled:cursor-not-allowed"
            >
              <Square className="w-6 h-6" />
              Stop Job
            </button>
          </div>
        </>
      );
    }

    return null;
  };

  const { totalSeconds, cumulativeSeconds } = timeEstimate || {
    totalSeconds: 0,
    cumulativeSeconds: [],
  };
  let displayTime = totalSeconds;
  let timeLabel = "Est. Time";
  let timeTitle = "Estimated Job Time";

  if (isJobActive && totalSeconds > 0 && cumulativeSeconds) {
    const feedMultiplier = (machineState?.ov?.[0] ?? 100) / 100;
    timeLabel = "Time Rem.";
    timeTitle = "Estimated Time Remaining";
    if (feedMultiplier > 0) {
      const timeElapsedAt100 =
        currentLine > 0 && cumulativeSeconds[currentLine - 1]
          ? cumulativeSeconds[currentLine - 1]
          : 0;
      const timeRemainingAt100 = totalSeconds - timeElapsedAt100;
      displayTime = timeRemainingAt100 / feedMultiplier;
    } else {
      displayTime = Infinity;
    }
  }

  return (
    <div
      className="bg-surface rounded-lg shadow-lg flex flex-col p-4 h-full relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-1 pb-2 border-b border-secondary flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold">G-Code</h2>
          <div className="flex items-center bg-background rounded-md p-1">
            <button
              onClick={() => setView("visualizer")}
              title="Visualizer View"
              className={`p-1 rounded transition-colors ${view === "visualizer"
                ? "bg-primary text-white"
                : "hover:bg-secondary"
                }`}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("code")}
              title="Code View"
              className={`p-1 rounded transition-colors ${view === "code" ? "bg-primary text-white" : "hover:bg-secondary"
                }`}
            >
              <Code className="w-5 h-5" />
            </button>
            {view === "visualizer" && gcodeLines.length > 0 && (
              <>
                <button
                  onClick={() => visualizerRef.current?.resetView()}
                  title="Reset to Top-Down View"
                  className="p-1 rounded transition-colors hover:bg-secondary"
                >
                  <Crosshair className="w-5 h-5" />
                </button>
                <button
                  onClick={() => visualizerRef.current?.fitView()}
                  title="Fit to View"
                  className="p-1 rounded transition-colors hover:bg-secondary"
                >
                  <Maximize className="w-5 h-5" />
                </button>
                <button
                  onClick={() => visualizerRef.current?.zoomIn()}
                  title="Zoom In"
                  className="p-1 rounded transition-colors hover:bg-secondary"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => visualizerRef.current?.zoomOut()}
                  title="Zoom Out"
                  className="p-1 rounded transition-colors hover:bg-secondary"
                >
                  <ZoomOut className="w-5 h-8" />
                </button>

              </>
            )}
          </div>
          {view === "code" &&
            gcodeLines.length > 0 &&
            (isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-1 bg-accent-green text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  title="Save Changes to Local Copy"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleSaveToDisk}
                  className="flex items-center gap-2 px-3 py-1 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  title="Save to Disk"
                >
                  <Save className="w-4 h-4" />
                  Save to Disk
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                title="Edit G-Code"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGenerator}
            disabled={isJobActive}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate G-Code"
          >
            <Zap className="w-5 h-5" />
            Generate
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
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            Load File
          </button>
          <button
            onClick={onClearFile}
            disabled={isJobActive || gcodeLines.length === 0}
            className="p-2 bg-secondary text-text-primary font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear G-Code &amp; Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      {fileName && (
        <p
          className="text-sm text-text-secondary truncate mb-2"
          title={fileName}
        >
          <strong>File: </strong>
          {fileName}
        </p>
      )}
      <div className="space-y-2 flex-shrink-0 mb-2">
        <div className="grid grid-cols-3 gap-4">{renderJobControls()}</div>
        {!isConnected && gcodeLines.length > 0 && (
          <div className="bg-accent-yellow/20 border border-accent-yellow text-accent-yellow p-4 rounded-md text-center">
            <p className="font-bold">Not Connected</p>
            <p className="text-sm">
              Please connect to your machine or the simulator using the button
              in the top right corner.
            </p>
          </div>
        )}
        <div className="w-full bg-secondary rounded-full h-4">
          <div
            className="bg-primary h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-sm font-medium">
          <p>
            Status: <span className="font-bold capitalize">{jobStatus}</span>
            {isJobActive && totalLines > 0 && (
              <span className="ml-2 font-mono text-text-secondary bg-background px-2 py-0.5 rounded-md">{`${currentLine} / ${totalLines}`}</span>
            )}
          </p>
          <div className="flex items-center gap-4">
            {gcodeLines.length > 0 && totalSeconds > 0 && (
              <div
                title={timeTitle}
                className="flex items-center gap-1.5 text-text-secondary"
              >
                <Clock className="w-4 h-4" />
                <span>{`${timeLabel}:`}</span>
                <span className="font-mono ml-1">
                  {formatTime(displayTime)}
                </span>
              </div>
            )}
            <p className="font-bold">{`${progress.toFixed(1)}%`}</p>
          </div>
        </div>
      </div>
      <div className="flex-grow relative min-h-0">
        {renderContent()}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-primary/70 border-4 border-dashed border-primary-focus rounded-lg flex flex-col items-center justify-center pointer-events-none">
            <Upload className="w-24 h-24 text-white" />
            <p className="text-2xl font-bold text-white mt-4">
              Drop G-code file here
            </p>
          </div>
        )}
      </div>
      {isJobActive && (
        <div className="mt-4 flex-shrink-0 grid grid-cols-2 gap-2">
          <OverrideControl
            label="Feed Rate"
            value={machineState?.ov?.[0] ?? 100}
            onOverride={onFeedOverride}
            min={10}
            max={300}
          />
          <OverrideControl
            label="Spindle"
            value={machineState?.ov?.[2] ?? 100}
            onOverride={onSpindleOverride}
            min={20}
            max={200}
          />
        </div>
      )}
    </div>
  );
};

export default memo(GCodePanel);
