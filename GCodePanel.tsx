

import React, { useRef, useState, useEffect, DragEvent } from 'react';
import { JobStatus } from '../types.js';
import { Play, Pause, Square, Upload, FileText, Code, Eye, Maximize, Pencil, CheckCircle, X, Save, Plus, Minus, RefreshCw, Percent, ZoomIn, ZoomOut, Clock, BookOpen, Crosshair } from './Icons';
import GCodeVisualizer from './GCodeVisualizer';
import GCodeLine from './GCodeLine.js';

interface FeedrateOverrideControlProps {
    onFeedOverride: (command: 'reset' | 'inc10' | 'dec10' | 'inc1' | 'dec1') => void;
    currentFeedrate: number;
    className?: string;
}

const FeedrateOverrideControl: React.FC<FeedrateOverrideControlProps> = ({ onFeedOverride, currentFeedrate, className = '' }) => {
    return (
        <div className={`bg-background p-3 rounded-md ${className}`}>
            <h4 className='text-sm font-bold text-text-secondary mb-2 text-center'>Feed Rate Override</h4>
            <div className='flex items-center justify-center gap-4 mb-3'>
                <Percent className='w-8 h-8 text-primary' />
                <span className='text-4xl font-mono font-bold'>{currentFeedrate}</span>
            </div>
            <div className='grid grid-cols-5 gap-2 text-sm'>
                <button title='Decrease Feed Rate by 10%' onClick={() => onFeedOverride('dec10')} className='p-2 bg-secondary rounded hover:bg-secondary-focus flex items-center justify-center font-bold'><Minus className='w-4 h-4 mr-1' />10%</button>
                <button title='Decrease Feed Rate by 1%' onClick={() => onFeedOverride('dec1')} className='p-2 bg-secondary rounded hover:bg-secondary-focus flex items-center justify-center font-bold'><Minus className='w-4 h-4 mr-1' />1%</button>
                <button title='Reset Feed Rate to 100%' onClick={() => onFeedOverride('reset')} className='p-2 bg-primary rounded hover:bg-primary-focus flex items-center justify-center'><RefreshCw className='w-5 h-5' /></button>
                <button title='Increase Feed Rate by 1%' onClick={() => onFeedOverride('inc1')} className='p-2 bg-secondary rounded hover:bg-secondary-focus flex items-center justify-center font-bold'><Plus className='w-4 h-4 mr-1' />1%</button>
                <button title='Increase Feed Rate by 10%' onClick={() => onFeedOverride('inc10')} className='p-2 bg-secondary rounded hover:bg-secondary-focus flex items-center justify-center font-bold'><Plus className='w-4 h-4 mr-1' />10%</button>
            </div>
        </div>
    );
};

const formatTime = (totalSeconds) => {
    if (totalSeconds === Infinity) return '∞';
    if (totalSeconds < 1) return '...';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
};

interface GCodeVisualizerHandle {
    fitView: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
}

interface GCodePanelProps {
    onFileLoad: (content: string, name: string) => void;
    fileName: string;
    gcodeLines: string[];
    onJobControl: (action: 'start' | 'pause' | 'resume' | 'stop', options?: { startLine?: number }) => void;
    jobStatus: JobStatus;
    progress: number;
    isConnected: boolean;
    unit: 'mm' | 'in';
    onGCodeChange: (content: string) => void;
    machineState: any | null;
    onFeedOverride: (command: 'reset' | 'inc10' | 'dec10' | 'inc1' | 'dec1') => void;
    timeEstimate: any;
    machineSettings: any;
    toolLibrary: any[];
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const GCodePanel: React.FC<GCodePanelProps> = ({ 
    onFileLoad, fileName, gcodeLines, onJobControl, 
    jobStatus, progress, isConnected, unit, onGCodeChange, 
    machineState, onFeedOverride, timeEstimate, 
    machineSettings, toolLibrary, selectedToolId, onToolSelect 
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const visualizerRef = useRef<GCodeVisualizerHandle>(null);
    const codeContainerRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState<'visualizer' | 'code'>('visualizer');
    const [isEditing, setIsEditing] = useState(false);
    const [editedGCode, setEditedGCode] = useState('');
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);

    useEffect(() => {
        setEditedGCode(gcodeLines.join('\n'));
        setIsEditing(false); // Exit edit mode on new file load
    }, [gcodeLines]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                onFileLoad(content, file.name);
            };
            reader.readAsText(file);
            setView('visualizer'); // Default to visualizer on new file
        }
    };
    
    const handleSave = () => {
        onGCodeChange(editedGCode);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedGCode(gcodeLines.join('\n'));
        setIsEditing(false);
    };

    const handleSaveToDisk = () => {
        const blob = new Blob([editedGCode], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        let suggestedFilename = fileName || 'untitled.gcode';
        if (suggestedFilename.endsWith(' (edited)')) {
            const base = suggestedFilename.replace(' (edited)', '');
            const parts = base.split('.');
            if (parts.length > 1) {
                const ext = parts.pop();
                suggestedFilename = `${parts.join('.')}-edited.${ext}`;
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
        onJobControl('start', { startLine: lineNumber - 1 });
    };

    const isHoming = machineState?.status === 'Home';
    const isJobActive = jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused;
    const isReadyToStart = isConnected && gcodeLines.length > 0 && (jobStatus === JobStatus.Idle || jobStatus === JobStatus.Stopped || jobStatus === JobStatus.Complete) && !isHoming;
    const totalLines = gcodeLines.length;
    const currentLine = Math.floor((progress / 100) * totalLines);

    useEffect(() => {
        if ((jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused) && view === 'code' && codeContainerRef.current) {
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

                const scrollTop = lineElementOffsetTop - (containerHeight / 2) + (lineElementHeight / 2);

                container.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth',
                });
            }
        }
    }, [currentLine, jobStatus, view, gcodeLines.length]);
    
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); };
    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(false); };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith('.gcode') || file.name.endsWith('.nc') || file.name.endsWith('.txt'))) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                onFileLoad(ev.target?.result as string, file.name);
            };
            reader.readAsText(file);
            setView('visualizer');
        }
    };


    const renderContent = () => {
        if (gcodeLines.length > 0) {
            if (view === 'visualizer') {
                return (
                    <GCodeVisualizer
                        ref={visualizerRef}
                        gcodeLines={gcodeLines}
                        currentLine={currentLine}
                        unit={unit}
                        hoveredLineIndex={hoveredLineIndex}
                        machineSettings={machineSettings}
                    />
                );
            }
            if (view === 'code') {
                if (isEditing) {
                    return (
                        <textarea
                            className="w-full h-full absolute inset-0 bg-background font-mono text-sm p-2 rounded border border-secondary focus:ring-primary focus:border-primary"
                            value={editedGCode}
                            onChange={(e) => setEditedGCode(e.target.value)}
                            spellCheck="false"
                        />
                    );
                }
                return (
                    <div ref={codeContainerRef} className="absolute inset-0 bg-background rounded p-2 overflow-y-auto font-mono text-sm">
                        {gcodeLines.map((line, index) => (
                            <GCodeLine
                                key={index}
                                line={line}
                                lineNumber={index + 1}
                                isExecuted={index < currentLine}
                                isCurrent={isJobActive && (index === currentLine)}
                                isHovered={index === hoveredLineIndex}
                                onRunFromHere={handleRunFromLine}
                                isActionable={isReadyToStart}
                                onMouseEnter={() => setHoveredLineIndex(index)}
                                onMouseLeave={() => setHoveredLineIndex(null)}
                            />
                        ))}
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
                    onClick={() => onJobControl('start', { startLine: 0 })}
                    disabled={!isReadyToStart}
                    className="col-span-3 flex items-center justify-center gap-3 p-5 bg-accent-green text-white font-bold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:bg-secondary disabled:cursor-not-allowed text-xl"
                >
                    <Play className="w-8 h-8" />
                    Start Job
                </button>
            );
        }

        if (jobStatus === JobStatus.Running) {
            return (
                <>
                    <button key='pause' onClick={() => onJobControl('pause')} disabled={isHoming} className="flex items-center justify-center gap-3 p-5 bg-accent-yellow text-white font-bold rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-xl disabled:bg-secondary disabled:cursor-not-allowed">
                        <Pause className="w-8 h-8" />
                        Pause
                    </button>
                    <button key='stop' onClick={() => onJobControl('stop')} disabled={isHoming} className="col-span-2 flex items-center justify-center gap-3 p-5 bg-accent-red text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-xl disabled:bg-secondary disabled:cursor-not-allowed">
                        <Square className="w-8 h-8" />
                        Stop Job
                    </button>
                </>
            );
        }

        if (jobStatus === JobStatus.Paused) {
            return (
                <>
                    <button key='resume' onClick={() => onJobControl('resume')} disabled={isHoming} className="flex items-center justify-center gap-3 p-5 bg-accent-green text-white font-bold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-xl disabled:bg-secondary disabled:cursor-not-allowed">
                        <Play className="w-8 h-8" />
                        Resume
                    </button>
                    <button key='stop' onClick={() => onJobControl('stop')} disabled={isHoming} className="col-span-2 flex items-center justify-center gap-3 p-5 bg-accent-red text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-xl disabled:bg-secondary disabled:cursor-not-allowed">
                        <Square className="w-8 h-8" />
                        Stop Job
                    </button>
                </>
            );
        }

        return null;
    };

    // --- Dynamic Time Estimation Logic ---
    const { totalSeconds, cumulativeSeconds } = timeEstimate || { totalSeconds: 0, cumulativeSeconds: [] };
    let displayTime = totalSeconds;
    let timeLabel = "Est. Time";
    let timeTitle = "Estimated Job Time";

    if (isJobActive && totalSeconds > 0 && cumulativeSeconds) {
        const feedMultiplier = (machineState?.ov?.[0] ?? 100) / 100;
        
        timeLabel = "Time Rem.";
        timeTitle = "Estimated Time Remaining";
        
        if (feedMultiplier > 0) {
            const timeElapsedAt100 = (currentLine > 0 && cumulativeSeconds[currentLine - 1]) ? cumulativeSeconds[currentLine - 1] : 0;
            const timeRemainingAt100 = totalSeconds - timeElapsedAt100;
            const adjustedRemainingTime = timeRemainingAt100 / feedMultiplier;
            displayTime = adjustedRemainingTime;
        } else {
            displayTime = Infinity;
        }
    }
    // --- End of Logic ---

    return (
        <div 
            className="bg-surface rounded-lg shadow-lg flex flex-col p-4 h-full relative"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center mb-2 pb-4 border-b border-secondary">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold">G-Code</h2>
                    <div className="flex items-center bg-background rounded-md p-1">
                        <button onClick={() => setView('visualizer')} title="Visualizer View" className={`p-1 rounded transition-colors ${view === 'visualizer' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}>
                            <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => setView('code')} title="Code View" className={`p-1 rounded transition-colors ${view === 'code' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}>
                            <Code className="w-5 h-5" />
                        </button>
                        {view === 'visualizer' && gcodeLines.length > 0 && (
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
                                    <ZoomOut className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                    {view === 'code' && gcodeLines.length > 0 && (
                        isEditing ? (
                            <div className='flex items-center gap-2'>
                                <button 
                                    onClick={handleSave} 
                                    className="flex items-center gap-2 px-3 py-1 bg-accent-green text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                    title="Save Changes to Local Copy"
                                >
                                    <CheckCircle className="w-4 h-4" /> Save
                                </button>
                                <button 
                                    onClick={handleSaveToDisk} 
                                    className="flex items-center gap-2 px-3 py-1 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    title="Save to Disk"
                                >
                                    <Save className="w-4 h-4" /> Save to Disk
                                </button>
                                <button 
                                    onClick={handleCancel} 
                                    className="flex items-center gap-2 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                                    title="Cancel"
                                >
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="flex items-center gap-2 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                                title="Edit G-Code"
                            >
                                <Pencil className="w-4 h-4" /> Edit
                            </button>
                        )
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".gcode,.nc,.txt" />
                    <button 
                        onClick={handleUploadClick}
                        disabled={isJobActive}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload className="w-5 h-5" />
                        Load File
                    </button>
                </div>
            </div>
            {fileName && (
                <div className='grid grid-cols-2 gap-4 mb-2'>
                    <p className="text-sm text-text-secondary truncate" title={fileName}><strong>File: </strong>{fileName}</p>
                    <div className='flex items-center gap-2'>
                        <BookOpen className='w-5 h-5 text-text-secondary flex-shrink-0' />
                        <select
                            value={selectedToolId || ''}
                            onChange={e => onToolSelect(e.target.value ? parseInt(e.target.value, 10) : null)}
                            disabled={isJobActive || toolLibrary.length === 0}
                            className='w-full bg-background border border-secondary rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50'
                        >
                            <option value=''>{toolLibrary.length > 0 ? 'Select a tool...' : 'No tools in library'}</option>
                            {toolLibrary.map(tool => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
                        </select>
                    </div>
                </div>
            )}
            
            <div className="space-y-4 flex-shrink-0 mb-4">
                <div className="grid grid-cols-3 gap-4">
                    {renderJobControls()}
                </div>
                <div className="w-full bg-secondary rounded-full h-4">
                    <div className="bg-primary h-4 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                    <p>
                        Status: <span className="font-bold capitalize">{jobStatus}</span>
                        {(isJobActive && totalLines > 0) && <span className='ml-2 font-mono text-text-secondary bg-background px-2 py-0.5 rounded-md'>{`${currentLine} / ${totalLines}`}</span>}
                    </p>
                    <div className="flex items-center gap-4">
                        {(gcodeLines.length > 0 && totalSeconds > 0) && (
                            <div title={timeTitle} className='flex items-center gap-1.5 text-text-secondary'>
                                <Clock className='w-4 h-4' />
                                <span>{`${timeLabel}:`}</span>
                                <span className='font-mono ml-1'>{formatTime(displayTime)}</span>
                            </div>
                        )}
                        <p className="font-bold">{`${progress.toFixed(1)}%`}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex-grow relative min-h-0">
                {renderContent()}
                {isDraggingOver && (
                    <div
                        className="absolute inset-0 bg-primary/70 border-4 border-dashed border-primary-focus rounded-lg flex flex-col items-center justify-center pointer-events-none"
                    >
                        <Upload className="w-24 h-24 text-white" />
                        <p className="text-2xl font-bold text-white mt-4">Drop G-code file here</p>
                    </div>
                )}
            </div>

            {isJobActive && (
                <FeedrateOverrideControl
                    onFeedOverride={onFeedOverride}
                    currentFeedrate={machineState?.ov?.[0] ?? 100}
                    className='mt-4 flex-shrink-0'
                />
            )}
        </div>
    );
};

export default GCodePanel;