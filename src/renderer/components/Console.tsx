import React, { useState, useEffect, useRef, memo } from "react";
import { ConsoleLog } from "../types";
import { Send, Trash2, Maximize, Minimize } from "./Icons";

interface ConsoleProps {
  logs: ConsoleLog[];
  onSendCommand: (command: string) => void;
  onClearLogs: () => void;
  isConnected: boolean;
  isJobActive: boolean;
  isMacroRunning: boolean;
  isLightMode: boolean;
  isVerbose: boolean;
  onVerboseChange: (isVerbose: boolean) => void;
}

const Console: React.FC<ConsoleProps> = ({
  logs,
  onSendCommand,
  onClearLogs,
  isConnected,
  isJobActive,
  isMacroRunning,
  isLightMode,
  isVerbose,
  onVerboseChange,
}) => {
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAutoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const handleSendCommand = () => {
    if (command.trim() === "") return;
    onSendCommand(command);
    if (commandHistory[commandHistory.length - 1] !== command) {
      setCommandHistory((prev) => [...prev, command]);
    }
    setCommand("");
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex < 0
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex =
          historyIndex >= commandHistory.length - 1 ? -1 : historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(newIndex < 0 ? "" : commandHistory[newIndex]);
      }
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "sent":
        return isLightMode ? "text-blue-600" : "text-blue-400";
      case "received":
        return isLightMode ? "text-gray-600" : "text-gray-400";
      case "status":
        return isLightMode ? "text-purple-600" : "text-purple-400";
      case "error":
        return isLightMode ? "text-red-600" : "text-red-400";
      default:
        return "text-text-primary";
    }
  };

  const isDisabled = !isConnected || isJobActive || isMacroRunning;

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-50 bg-surface p-4 flex flex-col"
    : "bg-surface rounded-lg shadow-lg flex flex-col p-4 h-full";

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center pb-2 border-b border-secondary flex-shrink-0">
        <h3 className="text-lg font-bold">Console</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isVerbose}
              onChange={(e) => onVerboseChange(e.target.checked)}
              className="mr-1"
            />
            Verbose
          </label>
          <label className="flex items-center text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isAutoScroll}
              onChange={(e) => setIsAutoScroll(e.target.checked)}
              className="mr-1"
              title="Toggle Autoscroll"
            />
            Autoscroll
          </label>
          <button
            onClick={onClearLogs}
            title="Clear Console Logs"
            className="p-1 rounded-md hover:bg-secondary"
          >
            <Trash2 className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Minimize Console" : "Fullscreen Console"}
            className="p-1 rounded-md hover:bg-secondary"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-text-secondary" />
            ) : (
              <Maximize className="w-5 h-5 text-text-secondary" />
            )}
          </button>
        </div>
      </div>
      <div
        ref={logContainerRef}
        className="h-40 bg-background rounded p-2 my-2 overflow-y-auto font-mono text-sm"
        onWheel={() => setIsAutoScroll(false)}
      >
        {logs.map((log, index) => (
          <div
            key={index}
            className={`flex items-start ${getLogColor(log.type)}`}
          >
            <span className="w-20 flex-shrink-0 text-gray-500">
              {log.timestamp.toLocaleTimeString()}
            </span>
            <span className="flex-grow break-all">{log.message}</span>
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>
      <div className="flex-shrink-0 mt-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendCommand();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isDisabled
                ? "Console locked during operation"
                : "Enter G-code command..."
            }
            className="w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isDisabled}
          />
          <button
            type="submit"
            disabled={isDisabled || !command.trim()}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:bg-secondary disabled:cursor-not-allowed"
            title="Send Command"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default memo(Console);
