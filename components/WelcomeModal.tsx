import React from 'react';
import { X, Settings, BookOpen, Zap } from './Icons';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSettings: () => void;
    onOpenToolLibrary: () => void;
    onTrySimulator: () => void;
    isMachineSetupComplete: boolean;
    isToolLibrarySetupComplete: boolean;
}

const SetupStep: React.FC<{ title: string; description: string; isComplete: boolean; onAction: () => void; actionText: string }> = ({ title, description, isComplete, onAction, actionText }) => (
    <div className={`p-4 rounded-lg flex items-center justify-between ${isComplete ? 'bg-accent-green/10' : 'bg-secondary'}`}>
        <div>
            <h3 className={`font-bold ${isComplete ? 'text-accent-green' : 'text-text-primary'}`}>{title}</h3>
            <p className="text-sm text-text-secondary">{description}</p>
        </div>
        {isComplete ? (
            <span className="text-sm font-bold text-accent-green">Complete</span>
        ) : (
            <button onClick={onAction} className="px-3 py-1 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus text-sm">{actionText}</button>
        )}
    </div>
);

const WelcomeModal: React.FC<WelcomeModalProps> = ({
    isOpen,
    onClose,
    onOpenSettings,
    onOpenToolLibrary,
    onTrySimulator,
    isMachineSetupComplete,
    isToolLibrarySetupComplete
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface rounded-lg shadow-2xl w-full max-w-2xl border border-secondary transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-secondary flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary">Welcome to mycnc.app!</h2>
                    <button onClick={onClose} className="p-1 rounded-md text-text-secondary hover:text-text-primary"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p>To get started, please complete the following setup steps. This ensures the software knows about your machine's capabilities.</p>
                    <div className="space-y-3">
                        <SetupStep title="Machine Setup" description="Define your machine's work area and spindle speeds." isComplete={isMachineSetupComplete} onAction={onOpenSettings} actionText="Open Settings" />
                        <SetupStep title="Tool Library" description="Add at least one tool to your library." isComplete={isToolLibrarySetupComplete} onAction={onOpenToolLibrary} actionText="Open Tool Library" />
                    </div>
                    <div className="pt-6 border-t border-secondary space-y-4">
                        <button
                            onClick={onClose}
                            disabled={!isMachineSetupComplete || !isToolLibrarySetupComplete}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-primary text-white font-bold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:bg-secondary disabled:cursor-not-allowed text-xl"
                        >
                            Get Started
                        </button>
                        <div className="text-center">
                            <p className="text-sm text-text-secondary mb-2">Or, if you just want to try out the software:</p>
                            <button onClick={onTrySimulator} className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus flex items-center gap-2 mx-auto">
                                <Zap className="w-5 h-5" />Try the Simulator
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;