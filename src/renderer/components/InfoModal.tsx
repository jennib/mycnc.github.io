import React from 'react';
import { X, Info } from './Icons';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ 
    isOpen, 
    onClose, 
    title,
    message
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-surface rounded-lg shadow-2xl w-full max-w-md border border-secondary transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-secondary flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Info className="w-7 h-7 text-primary" />
                        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Close dialog"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-text-primary text-lg whitespace-pre-wrap">{message}</p>
                </div>
                <div className="bg-background px-6 py-4 flex justify-end items-center gap-4 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
