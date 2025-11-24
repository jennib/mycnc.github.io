import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from './Icons';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel"
}) => {

    const modalTitle = (
        <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-accent-yellow" />
            <span className="text-2xl font-bold text-text-primary">{title}</span>
        </div>
    );

    const footer = (
        <>
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus"
            >
                {cancelText}
            </button>
            <button
                type="button"
                onClick={onConfirm}
                className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2"
            >
                {confirmText}
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            footer={footer}
            size="md"
        >
            <p className="text-text-primary text-lg">{message}</p>
        </Modal>
    );
};

export default ConfirmationModal;
