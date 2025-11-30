import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Zap, ZapOff } from './Icons';

interface SpindleConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (startSpindle: boolean) => void;
    title?: string;
    message?: string;
}

const SpindleConfirmationModal: React.FC<SpindleConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message
}) => {
    const { t } = useTranslation();

    if (!isOpen) {
        return null;
    }

    const displayTitle = title || t('spindleConfirm.title');
    const displayMessage = message || t('spindleConfirm.message');

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
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
                <div className="p-6">
                    <p className="text-text-primary text-lg">{displayMessage}</p>
                </div>
                <div className="bg-background px-6 py-4 flex justify-end items-center gap-4 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(false)}
                        className="px-6 py-2 bg-accent-yellow text-black font-bold rounded-md hover:bg-yellow-500 flex items-center gap-2"
                    >
                        <ZapOff className="w-5 h-5" />
                        {t('spindleConfirm.continueNoSpindle')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(true)}
                        className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2"
                    >
                        <Zap className="w-5 h-5" />
                        {t('spindleConfirm.startSpindle')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpindleConfirmationModal;
