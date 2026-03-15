import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle, AlertTriangle, Play } from "@mycnc/shared";
import { useMachineStore } from '../stores/machineStore';

interface ProbeVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (diameter: number) => void;
    onCancel?: () => void;
    title?: string;
    message?: string;
    showToolDiameter?: boolean;
    initialToolDiameter?: number;
    status: 'idle' | 'probing' | 'success' | 'failed';
    statusMessage?: string;
}

const ProbeVerificationModal: React.FC<ProbeVerificationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    title,
    message,
    showToolDiameter,
    initialToolDiameter = 0,
    status = 'idle',
    statusMessage
}) => {
    const { t } = useTranslation();
    const machineState = useMachineStore((state) => state.machineState);
    const [hasTriggered, setHasTriggered] = useState(false);
    const [toolDiameter, setToolDiameter] = useState(initialToolDiameter);

    // Monitor pin state for probe (P)
    useEffect(() => {
        if (isOpen && machineState?.pins?.includes('P')) {
            setHasTriggered(true);
        }
    }, [isOpen, machineState?.pins]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setHasTriggered(false);
            setToolDiameter(initialToolDiameter);
        }
    }, [isOpen, initialToolDiameter]);

    if (!isOpen) {
        return null;
    }

    let displayTitle = title || t('probeVerification.title', 'Probe Safety Verification');
    let displayMessage = message || t('probeVerification.message', 'Please touch the probe to the tool or workpiece to verify the connection is working.');

    if (status === 'probing') {
        displayTitle = t('probeVerification.probingTitle', 'Probing in Progress...');
        displayMessage = statusMessage || t('probeVerification.probingMessage', 'The machine is currently performing the probing sequence. Please stand by.');
    } else if (status === 'success') {
        displayTitle = t('probeVerification.successTitle', 'Probing Successful');
        displayMessage = statusMessage || t('probeVerification.successMessage', 'Probing completed successfully.');
    } else if (status === 'failed') {
        displayTitle = t('probeVerification.failedTitle', 'Probing Failed');
        displayMessage = statusMessage || t('probeVerification.failedMessage', 'An error occurred during probing.');
    }

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[10000] flex items-center justify-center"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-surface rounded-lg shadow-2xl w-full max-w-md border border-secondary transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-secondary flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary">{displayTitle}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Close dialog"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${
                        status === 'probing' ? 'bg-primary/20 text-primary' :
                        status === 'success' ? 'bg-green-500/20 text-green-500' :
                        status === 'failed' ? 'bg-red-500/20 text-red-500' :
                        hasTriggered ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500 animate-pulse'
                    }`}>
                        {status === 'probing' ? (
                             <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : status === 'success' ? (
                            <CheckCircle className="w-12 h-12" />
                        ) : status === 'failed' ? (
                            <X className="w-12 h-12" />
                        ) : hasTriggered ? (
                            <CheckCircle className="w-12 h-12" />
                        ) : (
                            <AlertTriangle className="w-12 h-12" />
                        )}
                    </div>
                    
                    <p className="text-text-primary text-lg mb-4">{displayMessage}</p>
                    
                    {status === 'idle' && (
                        <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${hasTriggered ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-secondary bg-background text-text-secondary'}`}>
                            <div className={`w-3 h-3 rounded-full ${hasTriggered ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`} />
                            <span className="font-mono font-bold tracking-wider uppercase">
                                {hasTriggered ? t('probeVerification.statusTriggered', 'PROBE TRIGGERED') : t('probeVerification.statusWaiting', 'WAITING FOR TRIGGER')}
                            </span>
                        </div>
                    )}

                    {status === 'idle' && showToolDiameter && (
                        <div className="mt-8 w-full max-w-xs border-t border-secondary pt-6">
                            <label className="block text-sm font-medium text-text-secondary mb-2 text-left">
                                {t('probeVerification.toolDiameterLabel', 'Tool Diameter (mm)')}
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0"
                                value={toolDiameter}
                                onChange={(e) => setToolDiameter(parseFloat(e.target.value) || 0)}
                                className="w-full bg-background border border-secondary rounded-md px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    )}
                </div>

                <div className="bg-background px-6 py-4 flex justify-between items-center gap-4 rounded-b-lg border-t border-secondary">
                    {status === 'idle' ? (
                        <>
                            <button
                                type="button"
                                onClick={() => onConfirm(toolDiameter)}
                                className="text-text-secondary hover:text-text-primary underline font-medium"
                            >
                                {t('probeVerification.skip', 'Skip Test')}
                            </button>
                            
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="button"
                                    disabled={!hasTriggered}
                                    onClick={() => onConfirm(toolDiameter)}
                                    className={`px-6 py-2 flex items-center gap-2 font-bold rounded-md transition-all ${
                                        hasTriggered 
                                        ? 'bg-primary text-white hover:bg-primary-focus shadow-lg shadow-primary/20' 
                                        : 'bg-secondary text-text-secondary cursor-not-allowed grayscale'
                                    }`}
                                >
                                    <Play className="w-5 h-5" />
                                    {t('probeVerification.startProbing', 'Start Probing')}
                                </button>
                            </div>
                        </>
                    ) : status === 'probing' ? (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            {t('common.cancelProbing', 'Cancel Probing')}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus transition-colors"
                        >
                            {t('common.close', 'Close')}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProbeVerificationModal;
