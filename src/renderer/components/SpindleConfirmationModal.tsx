import React from 'react';
import { X, Zap, ZapOff } from './Icons';
import Modal from './Modal';

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
    title = "Confirm Spindle State",
    message = "Do you want to turn the spindle on before proceeding?"
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 border-b border-secondary flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                <button
                    onClick={onClose}
                    className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close dialog"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6">
                <p className="text-text-primary text-lg">{message}</p>
            </div>
            <div className="bg-background px-6 py-4 flex justify-end items-center gap-4 rounded-b-lg">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(false)}
                    className="px-6 py-2 bg-accent-yellow text-black font-bold rounded-md hover:bg-yellow-500 flex items-center gap-2"
                >
                    <ZapOff className="w-5 h-5" />
                    Continue without Spindle
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(true)}
                    className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2"
                >
                    <Zap className="w-5 h-5" />
                    Start Spindle
                </button>
            </div>
        </Modal>
    );
};

export default SpindleConfirmationModal;
