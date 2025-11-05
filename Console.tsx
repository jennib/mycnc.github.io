

import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronRight, ChevronsLeft, ChevronsRight, Info, AlertTriangle, Maximize, Minimize } from './Icons';

interface ConsoleProps {
    logs: any[];
    onSendCommand: (command: string) => void;
    isConnected: boolean;
    isJobActive: boolean;
    isMacroRunning: boolean;
    isLightMode: boolean;
}

const Console: React.FC<ConsoleProps> = ({ logs, onSendCommand, isConnected, isJobActive, isMacroRunning, isLightMode }) => {
    const [command, setCommand] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, isFullscreen]); // Re-check scroll on fullscreen toggle

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (command.trim() && isConnected && !isJobActive && !isMacroRunning) {
            onSendCommand(command.trim());
            setCommand('');
        }
    };

    const getLogColor = (type: any) => {
        if (isLightMode) {
            switch (type) {
                case 'sent': return 'text-blue-700';
                case 'received': return 'text-green-700';
                case 'status': return 'text-orange-600';
                case 'error': return 'text-red-700';
                default: return 'text-gray-600';
            }
        }
        switch (type) {
            case 'sent': return 'text-blue-400';
            case 'received': return 'text-green-400';
            case 'status': return 'text-yellow-400';
            case 'error': return 'text-red-400';
            default: return 'text-text-secondary';
        }
    };

    const getLogIcon = (type: any) => {
        const iconProps = { className: "w-4 h-4 mr-2 flex-shrink-0" };
        switch (type) {
            case 'sent': return <ChevronsRight {...iconProps} />;
            case 'received': return <ChevronsLeft {...iconProps} />;
            case 'status': return <Info {...iconProps} />;
            case 'error': return <AlertTriangle {...iconProps} />;
            default: return null;
        }
    };
    
    const containerClasses = isFullscreen
        ? "fixed inset-0 z-50 bg-surface p-4 flex flex-col"
        : "bg-surface rounded-lg shadow-lg flex flex-col p-4 flex-grow min-h-0";

    const isInputDisabled = !isConnected || isJobActive || isMacroRunning;
    
    const getPlaceholder = () => {
        if (!isConnected) return "Connect to send commands";
        if (isJobActive) return "Job running...";
        if (isMacroRunning) return "Macro running...";
        return "Enter G-code command...";
    };


    return (
        <div className={containerClasses}>
            <h2 className="text-lg font-bold mb-4 pb-4 border-b border-secondary flex-shrink-0 flex justify-between items-center">
                Console
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={isFullscreen ? "Minimize Console" : "Fullscreen Console"}
                    className="text-text-secondary hover:text-text-primary p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                >
                    {isFullscreen
                        ? <Minimize className="w-5 h-5" />
                        : <Maximize className="w-5 h-5" />}
                </button>
            </h2>
            <div ref={logContainerRef} className="h-40 bg-background rounded p-2 overflow-y-auto mb-4 font-mono text-sm">
                {logs.map((log, index) => (
                    <div key={index} className={`flex items-start ${getLogColor(log.type)}`}>
                        {getLogIcon(log.type)}
                        <span className="whitespace-pre-wrap break-all">{log.message}</span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0 mt-auto">
                <div className="relative flex-grow">
                    <ChevronRight className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder={getPlaceholder()}
                        disabled={isInputDisabled}
                        className="w-full bg-background border border-secondary rounded-md py-2 pr-12 pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isInputDisabled || !command.trim()}
                    className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:bg-secondary disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default Console;