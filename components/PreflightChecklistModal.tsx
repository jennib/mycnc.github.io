import React, { useState } from 'react';
import { CheckCircle, X, AlertTriangle, Play } from './Icons';
import { Tool } from '../types';

interface ChecklistItemProps {
    children: React.ReactNode;
    status: 'checked' | 'unchecked' | 'warning';
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ children, status }) => (
    <li className={`flex items-center gap-3 ${status === 'warning' ? 'text-accent-yellow' : ''}`}>
        {status === 'checked' ? <CheckCircle className="w-6 h-6 text-accent-green" /> : status === 'warning' ? <AlertTriangle className="w-6 h-6 text-accent-yellow" /> : <X className="w-6 h-6 text-accent-red" />}
        <span className="text-text-primary">{children}</span>
    </li>
);

interface PreflightChecklistModalProps {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: (options: { isDryRun: boolean }) => void;
    jobInfo: { fileName: string; gcodeLines: string[]; timeEstimate: { totalSeconds: number }; startLine: number };
    isHomed: boolean;
    warnings: { type: 'error' | 'warning'; message: string }[];
    selectedTool: Tool | null;
}

const PreflightChecklistModal: React.FC<PreflightChecklistModalProps> = ({ isOpen, onCancel, onConfirm, jobInfo, isHomed, warnings, selectedTool }) => {
    const [isDryRun, setIsDryRun] = useState(false);
    const [skipPreflight, setSkipPreflight] = useState(() => localStorage.getItem('cnc-app-skip-preflight') === 'true');

    if (!isOpen) return null;

    const hasErrors = warnings.some(w => w.type === 'error');

    const handleConfirm = () => {
        if (skipPreflight) {
            localStorage.setItem('cnc-app-skip-preflight', 'true');
        }
        onConfirm({ isDryRun });
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center" onClick={onCancel}>
            <div className="bg-surface rounded-lg shadow-2xl w-full max-w-2xl border border-secondary transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-secondary flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-accent-yellow" />Preflight Check</h2>
                    <button onClick={onCancel} className="p-1 rounded-md text-text-secondary hover:text-text-primary"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p>Please review the following before starting the job:</p>
                    <ul className="space-y-2 bg-background p-4 rounded-md">
                        <ChecklistItem status={jobInfo.fileName ? 'checked' : 'unchecked'}>Job file loaded: <strong>{jobInfo.fileName}</strong></ChecklistItem>
                        <ChecklistItem status={isHomed ? 'checked' : 'warning'}>{isHomed ? 'Machine has been homed' : 'Machine has not been homed since connecting'}</ChecklistItem>
                        <ChecklistItem status={hasErrors ? 'unchecked' : 'checked'}>G-code analysis passed</ChecklistItem>
                    </ul>
                    {warnings.length > 0 && (
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {warnings.map((w, i) => (
                                <div key={i} className={`p-3 rounded-md text-sm ${w.type === 'error' ? 'bg-accent-red/20 text-accent-red' : 'bg-accent-yellow/20 text-accent-yellow'}`}><strong>{w.type === 'error' ? 'Error:' : 'Warning:'}</strong> {w.message}</div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="bg-background px-6 py-4 flex justify-between items-center rounded-b-lg">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={isDryRun} onChange={e => setIsDryRun(e.target.checked)} className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary" />
                        Run in Dry Run mode (no spindle/laser, rapids only)
                    </label>
                    <div className="flex items-center gap-4">
                        <button onClick={onCancel} className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus">Cancel</button>
                        <button onClick={handleConfirm} disabled={hasErrors} className="px-6 py-2 bg-accent-green text-white font-bold rounded-md hover:bg-green-600 disabled:bg-secondary disabled:cursor-not-allowed flex items-center gap-2">
                            <Play className="w-5 h-5" />Confirm & Start Job
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreflightChecklistModal;