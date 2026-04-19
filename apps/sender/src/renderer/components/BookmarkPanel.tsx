import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Pin, Play, FileText, X, Check, Crosshair, Home, ArrowUp, Maximize, ChevronsRight, Camera, Layers, Settings, Keyboard, Activity, Ruler, Image as ImageIcon } from '@mycnc/shared';
import type { WorkspaceBookmark } from '@mycnc/shared';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useMachineStore } from '../stores/machineStore';
import { useLibraryStore } from '../stores/libraryStore';
import { useJobStore } from '../stores/jobStore';
import { useSettingsStore } from '../stores/settingsStore';

const BookmarkPanel: React.FC = () => {
    const { t } = useTranslation();
    const { bookmarks, categories, actions: bookmarkActions } = useBookmarkStore();
    const { machineState, actions: machineActions } = useMachineStore();
    const { jobs, actions: libraryActions } = useLibraryStore();
    const { actions: jobActions } = useJobStore();
    const { machineSettings, toolLibrary } = useSettingsStore();

    const [isAdding, setIsAdding] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    
    // New Bookmark Form State
    const [newName, setNewName] = useState('');
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('General');
    const [reference, setReference] = useState<'machine' | 'work'>('work');
    const [snapshot, setSnapshot] = useState<string | undefined>(undefined);
    const [commands, setCommands] = useState<string>('');
    const [selectedToolId, setSelectedToolId] = useState<number | undefined>(undefined);
    
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (window.electronAPI?.isElectron) libraryActions.init();
    }, [libraryActions]);

    const captureSnapshot = () => {
        const video = document.querySelector('video');
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setSnapshot(canvas.toDataURL('image/jpeg', 0.8));
        }
    };

    const handleAddBookmark = (preset?: Partial<WorkspaceBookmark>) => {
        if (!machineState) {
            alert('Machine must be connected to save a bookmark.');
            return;
        }

        const bookmarkData: Omit<WorkspaceBookmark, 'id'> = {
            name: preset?.name || newName || `Bookmark ${bookmarks.length + 1}`,
            position: preset?.position || { ...machineState.wpos },
            mpos: preset?.mpos || { ...machineState.mpos },
            wcs: preset?.wcs || machineState.wcs,
            wco: preset?.wco || { ...machineState.wco },
            reference: preset?.reference || reference,
            category: preset?.category || selectedCategory,
            snapshot: preset?.snapshot || snapshot,
            toolId: preset?.toolId || selectedToolId,
            commands: preset?.commands || (commands.trim() ? commands.split('\n').filter(c => c.trim()) : undefined),
            jobId: preset?.jobId || selectedJobId || undefined,
            jobName: preset?.jobName || (selectedJobId ? jobs.find(j => j.id === selectedJobId)?.name : undefined)
        };

        bookmarkActions.addBookmark(bookmarkData);

        setIsAdding(false);
        setNewName('');
        setSelectedJobId('');
        setSnapshot(undefined);
        setCommands('');
        setSelectedToolId(undefined);
    };

    const generateSuggestion = (type: 'home' | 'center' | 'back_right' | 'top_z') => {
        if (!machineState || !machineSettings.workArea) return;

        const workArea = machineSettings.workArea;
        const wcs = machineState.wcs;
        const wco = machineState.wco;

        let targetMpos = { ...machineState.mpos };
        let name = "";

        switch (type) {
            case 'home':
                targetMpos = { x: 0, y: 0, z: 0 };
                name = "Machine Home";
                break;
            case 'center':
                targetMpos = { x: workArea.x / 2, y: workArea.y / 2, z: 0 };
                name = "Table Center";
                break;
            case 'back_right':
                targetMpos = { x: workArea.x, y: workArea.y, z: 0 };
                name = "Back Right Corner";
                break;
            case 'top_z':
                targetMpos = { ...machineState.mpos, z: 0 };
                name = "Safe Height (Top Z)";
                break;
        }

        // Calculate WPOS: WPOS = MPOS - WCO
        const targetWpos = {
            x: targetMpos.x - wco.x,
            y: targetMpos.y - wco.y,
            z: targetMpos.z - wco.z
        };

        handleAddBookmark({
            name,
            position: targetWpos,
            mpos: targetMpos,
            wcs,
            wco: { ...wco }
        });
    };

    const handleActivateBookmark = async (id: string) => {
        const bookmark = bookmarks.find(b => b.id === id);
        if (!bookmark) return;

        // 1. Restore WCS and Offsets if it's a Work-Relative bookmark
        if (bookmark.reference === 'work') {
            if (bookmark.wcs) {
                machineActions.handleManualCommand(bookmark.wcs);
            }

            if (bookmark.wco && bookmark.wcs) {
                const wcsMatch = bookmark.wcs.match(/G(5[4-9])/);
                if (wcsMatch) {
                    const pIndex = parseInt(wcsMatch[1]) - 53;
                    const { x, y, z } = bookmark.wco;
                    machineActions.handleManualCommand(`G10 L20 P0 X${(bookmark.position.x + x).toFixed(3)} Y${(bookmark.position.y + y).toFixed(3)} Z${(bookmark.position.z + z).toFixed(3)}`);
                    // Wait, G10 L20 P0 sets the CURRENT work coordinate to the given value.
                    // If we want to restore the EXACT offset, we should use G10 L2 Pn.
                    machineActions.handleManualCommand(`G10 L2 P${pIndex} X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)}`);
                }
            }
        }

        // 2. Move machine
        if (bookmark.reference === 'machine' && bookmark.mpos) {
            const { x, y, z } = bookmark.mpos;
            machineActions.handleManualCommand(`G53 G0 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)}`);
        } else {
            const { x, y, z } = bookmark.position;
            machineActions.handleManualCommand(`G0 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)}`);
        }

        // 3. Run sequential commands (Macros)
        if (bookmark.commands && bookmark.commands.length > 0) {
            machineActions.handleRunMacro(bookmark.commands);
        }

        // 4. Load associated job if it exists
        if (bookmark.jobId) {
            const content = await libraryActions.loadJobContent(bookmark.jobId);
            if (content) {
                jobActions.loadFile(content, bookmark.jobName || 'Bookmarked Job');
            }
        }
    };

    const handleDeleteBookmark = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Delete this bookmark?')) {
            bookmarkActions.removeBookmark(id);
        }
    };

    const filteredBookmarks = activeCategory === 'All' 
        ? bookmarks 
        : bookmarks.filter(b => b.category === activeCategory);

    return (
        <div className="flex flex-col h-full bg-background/30 rounded-lg border border-white/5 overflow-hidden">
            <div className="flex flex-col shrink-0 bg-surface/50 border-b border-white/10">
                <div className="flex items-center justify-between p-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
                        <Pin className="w-5 h-5 text-primary" />
                        Workspace Bookmarks
                    </h2>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-all shadow-lg active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        New Bookmark
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeCategory === 'All' ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {isAdding && (
                    <div className="mb-4 p-4 bg-surface border border-primary/30 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Bookmark Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Jig Zero A..."
                                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary text-sm"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary text-sm"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Reference System</label>
                                    <div className="flex bg-background rounded-lg p-1 border border-white/10">
                                        <button
                                            onClick={() => setReference('work')}
                                            className={`flex-1 py-1 text-[10px] font-bold rounded ${reference === 'work' ? 'bg-primary text-white' : 'text-text-secondary'}`}
                                        >
                                            Work (Relative)
                                        </button>
                                        <button
                                            onClick={() => setReference('machine')}
                                            className={`flex-1 py-1 text-[10px] font-bold rounded ${reference === 'machine' ? 'bg-primary text-white' : 'text-text-secondary'}`}
                                        >
                                            Machine (Absolute)
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Assign Job</label>
                                    <select
                                        value={selectedJobId}
                                        onChange={(e) => setSelectedJobId(e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary text-sm"
                                    >
                                        <option value="">None</option>
                                        {jobs.map(job => <option key={job.id} value={job.id}>{job.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Tool Reference</label>
                                    <select
                                        value={selectedToolId}
                                        onChange={(e) => setSelectedToolId(e.target.value ? Number(e.target.value) : undefined)}
                                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary text-sm"
                                    >
                                        <option value="">No Specific Tool</option>
                                        {toolLibrary.map(tool => <option key={tool.id} value={tool.id}>{tool.name} ({tool.diameter}mm)</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Visual Reference</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={captureSnapshot}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs text-text-primary transition-all"
                                        >
                                            <Camera className="w-4 h-4 text-primary" />
                                            {snapshot ? 'Retake' : 'Snapshot'}
                                        </button>
                                        {snapshot && (
                                            <div className="w-10 h-10 rounded border border-primary overflow-hidden shrink-0">
                                                <img src={snapshot} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">Sequential Commands (Macro)</label>
                                <textarea
                                    value={commands}
                                    onChange={(e) => setCommands(e.target.value)}
                                    placeholder="G0 Z10\nM3 S12000..."
                                    rows={2}
                                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary font-mono text-xs resize-none"
                                />
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-white/5">
                                <button
                                    onClick={() => handleAddBookmark()}
                                    disabled={!machineState}
                                    className={`flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${!machineState ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Check className="w-5 h-5" /> Save Bookmark
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-6 py-3 bg-secondary/50 text-text-primary font-bold rounded-lg hover:bg-secondary transition-all"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="mt-2 pt-2 border-t border-white/5">
                                <label className="text-[10px] font-bold text-text-secondary uppercase mb-2 block">Quick Suggestions</label>
                                <div className="grid grid-cols-4 gap-2">
                                    <button onClick={() => generateSuggestion('home')} className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-text-secondary transition-all">
                                        <Home className="w-4 h-4 text-primary" /> Home
                                    </button>
                                    <button onClick={() => generateSuggestion('top_z')} className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-text-secondary transition-all">
                                        <ArrowUp className="w-4 h-4 text-primary" /> Safe Z
                                    </button>
                                    <button onClick={() => generateSuggestion('center')} className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-text-secondary transition-all">
                                        <Maximize className="w-4 h-4 text-primary" /> Center
                                    </button>
                                    <button onClick={() => generateSuggestion('back_right')} className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-text-secondary transition-all">
                                        <ChevronsRight className="w-4 h-4 text-primary" /> Corner
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {filteredBookmarks.length === 0 && !isAdding ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary opacity-70 py-12">
                        <Pin className="w-16 h-16 mb-4 opacity-20" />
                        <p>No bookmarks in {activeCategory}.</p>
                        {activeCategory === 'All' && <p className="text-sm mt-2 text-center max-w-[200px]">Save your current position to quickly return to it later.</p>}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredBookmarks.map((bookmark) => (
                            <div
                                key={bookmark.id}
                                className={`group flex flex-col p-3 bg-white/5 rounded-xl border transition-all cursor-pointer shadow-sm hover:translate-y-[-1px] ${
                                    expandedId === bookmark.id ? 'border-primary/50 bg-white/10' : 'border-white/10 hover:border-white/30 hover:bg-white/8'
                                }`}
                                onClick={() => setExpandedId(expandedId === bookmark.id ? null : bookmark.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-12 h-12 bg-primary/20 rounded-lg shrink-0 overflow-hidden flex items-center justify-center border border-white/5">
                                            {bookmark.snapshot ? (
                                                <img src={bookmark.snapshot} alt={bookmark.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Crosshair className="w-6 h-6 text-primary/40" />
                                            )}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-text-primary truncate" title={bookmark.name}>
                                                    {bookmark.name}
                                                </span>
                                                <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] uppercase font-bold text-text-secondary">
                                                    {bookmark.category}
                                                </span>
                                                <span title="Machine Absolute">
                                                    <Settings className="w-3 h-3 text-accent-yellow" />
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-mono text-text-secondary opacity-60">
                                                {bookmark.reference === 'work' ? 'WPOS' : 'MPOS'}: X:{bookmark.position.x.toFixed(2)} Y:{bookmark.position.y.toFixed(2)} Z:{bookmark.position.z.toFixed(2)}
                                            </span>
                                            {bookmark.reference === 'work' && bookmark.wcs && (
                                                <span className="text-[10px] font-mono text-primary/70">
                                                    WCS: {bookmark.wcs}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActivateBookmark(bookmark.id);
                                            }}
                                            className="p-3 bg-primary text-white rounded-xl hover:bg-primary-focus transition-all shadow-md active:scale-90"
                                            title="Activate Bookmark"
                                        >
                                            <Play className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteBookmark(e, bookmark.id)}
                                            className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                {expandedId === bookmark.id && (
                                    <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {bookmark.toolId && (
                                            <div className="flex items-center gap-2 text-[10px] text-accent-yellow bg-accent-yellow/5 px-2 py-1 rounded border border-accent-yellow/10">
                                                <Ruler className="w-3 h-3" />
                                                Suggested Tool: {toolLibrary.find(t => t.id === bookmark.toolId)?.name || `ID: ${bookmark.toolId}`}
                                            </div>
                                        )}
                                        
                                        {bookmark.jobName && (
                                            <div className="flex items-center gap-2 text-[10px] text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">
                                                <FileText className="w-3 h-3" />
                                                Associated Job: {bookmark.jobName}
                                            </div>
                                        )}

                                        {bookmark.commands && bookmark.commands.length > 0 && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] uppercase font-bold text-text-secondary px-1">Macro Sequence</span>
                                                <div className="bg-black/20 rounded p-2 font-mono text-[9px] text-text-primary whitespace-pre-wrap">
                                                    {bookmark.commands.join('\n')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookmarkPanel;
