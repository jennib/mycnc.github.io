import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, Trash2, Play } from '@mycnc/shared';
import { useLibraryStore } from '../stores/libraryStore';
import { useJobStore } from '../stores/jobStore';
import { useUIStore } from '../stores/uiStore';

const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
};

const LibraryPanel: React.FC = () => {
    const { t } = useTranslation();
    const { jobs, actions: libraryActions } = useLibraryStore();
    const { actions: jobActions } = useJobStore();
    const uiActions = useUIStore((state) => state.actions);

    useEffect(() => {
        libraryActions.init();
    }, [libraryActions]);

    const handleUploadClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.nc,.gcode,.txt';
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const content = event.target?.result as string;
                    if (content) {
                        await libraryActions.addJob(file.name, content);
                        jobActions.loadFile(content, file.name);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleLoadJob = async (id: string, name: string) => {
        const content = await libraryActions.loadJobContent(id);
        if (content) {
            jobActions.loadFile(content, name);
        }
    };

    const handleDeleteJob = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Delete this job from the library?')) {
            await libraryActions.removeJob(id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/30 rounded-lg border border-white/5">
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-surface/50">
                <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
                    <FileText className="w-5 h-5 text-primary" />
                    Library
                </h2>
                <button
                    onClick={handleUploadClick}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-all shadow-lg active:scale-95"
                >
                    <Upload className="w-4 h-4" />
                    Upload File
                </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary opacity-70">
                        <FileText className="w-16 h-16 mb-4" />
                        <p>No recent jobs found.</p>
                        <p className="text-sm mt-2">Upload a file to get started.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="group flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all cursor-pointer shadow-sm"
                                onClick={() => handleLoadJob(job.id, job.name)}
                            >
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-semibold text-text-primary truncate" title={job.name}>
                                        {job.name}
                                    </span>
                                    <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                                        <span>{new Date(job.timestamp).toLocaleString()}</span>
                                        <span>•</span>
                                        <span>{formatSize(job.size)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLoadJob(job.id, job.name);
                                        }}
                                        className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                                        title="Load Job"
                                    >
                                        <Play className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteJob(e, job.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Delete Job"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryPanel;
