import React, { useState, useEffect, useRef } from 'react';
import { Log } from '../types';
import { Send, Trash2, ChevronDown, ChevronUp } from './Icons';

interface ConsoleProps {
    logs: Log[];
    onSendCommand: (command: string) => void;
    isConnected: boolean;
    isJobActive: boolean;
    isMacroRunning: boolean;
    isLightMode: boolean;
    isVerbose: boolean;
    onVerboseChange: (isVerbose: boolean) => void;
}

const Console: React.FC<ConsoleProps> = ({ logs, onSendCommand, isConnected, isJobActive, isMacroRunning, isLightMode, isVerbose, onVerboseChange }) => {
    const [command, setCommand] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const consoleEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAutoScroll) {
            consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isAutoScroll]);

    const handleSendCommand = () => {
        if (command.trim() === '') return;
        onSendCommand(command);
        if (commandHistory[commandHistory.length - 1] !== command) {
            setCommandHistory(prev => [...prev, command]);
        }
        setCommand('');
        setHistoryIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex < 0 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setCommand(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex >= 0) {
                const newIndex = historyIndex >= commandHistory.length - 1 ? -1 : historyIndex + 1;
                setHistoryIndex(newIndex);
                setCommand(newIndex < 0 ? '' : commandHistory[newIndex]);
            }
        }
    };

    const getLogColor = (type: string) => {
        switch (type) {
            case 'sent': return isLightMode ? 'text-blue-600' : 'text-blue-400';
            case 'received': return isLightMode ? 'text-gray-600' : 'text-gray-400';
            case 'status': return isLightMode ? 'text-purple-600' : 'text-purple-400';
            case 'error': return isLightMode ? 'text-red-600' : 'text-red-400';
            default: return 'text-text-primary';
        }
    };

    const isDisabled = !isConnected || isJobActive || isMacroRunning;

    return (
        <div className={`bg-surface rounded-lg shadow-lg flex flex-col transition-all duration-300 ${isMinimized ? 'h-12' : 'flex-grow min-h-0'}`}>
            <div className="flex justify-between items-center p-2 border-b border-secondary">
                <h3 className="text-md font-bold ml-2">Console</h3>
                <div className="flex items-center gap-2">
                    <label className="flex items-center text-sm cursor-pointer">
                        <input type="checkbox" checked={isVerbose} onChange={(e) => onVerboseChange(e.target.checked)} className="mr-1" />
                        Verbose
                    </label>
                    <label className="flex items-center text-sm cursor-pointer">
                        <input type="checkbox" checked={isAutoScroll} onChange={(e) => setIsAutoScroll(e.target.checked)} className="mr-1" />
                        Autoscroll
                    </label>
                    <button onClick={() => setCommandHistory([])} title="Clear History" className="p-1 rounded-md hover:bg-secondary">
                        <Trash2 className="w-4 h-4 text-text-secondary" />
                    </button>
                    <button onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Expand" : "Minimize"} className="p-1 rounded-md hover:bg-secondary">
                        {isMinimized ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
                    </button>
                </div>
            </div>
            {!isMinimized && (
                <>
                    <div className="flex-grow p-2 overflow-y-auto font-mono text-xs" onWheel={() => setIsAutoScroll(false)}>
                        {logs.map((log, index) => (
                            <div key={index} className={`flex items-start ${getLogColor(log.type)}`}>
                                <span className="w-20 flex-shrink-0 text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
                                <span className="flex-grow break-all">{log.message}</span>
                            </div>
                        ))}
                        <div ref={consoleEndRef} />
                    </div>
                    <div className="p-2 border-t border-secondary">
                        <div className="relative">
                            <input
                                type="text"
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isDisabled ? "Console locked during operation" : "Enter G-code command..."}
                                className="w-full bg-background border border-secondary rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isDisabled}
                            />
                            <button
                                onClick={handleSendCommand}
                                disabled={isDisabled}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md text-text-secondary hover:text-primary disabled:text-gray-500 disabled:cursor-not-allowed"
                                title="Send Command"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Console;
