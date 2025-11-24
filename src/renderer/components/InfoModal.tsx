import React from 'react';
import { Info } from './Icons';
import Modal from './Modal';

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

    const modalTitle = (
        <div className="flex items-center gap-3">
            <Info className="w-7 h-7 text-primary" />
            <span className="text-2xl font-bold text-text-primary">{title}</span>
        </div>
    );

    const footer = (
        <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2"
        >
            OK
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            footer={footer}
            size="md"
        >
            <p className="text-text-primary text-lg whitespace-pre-wrap">{message}</p>
        </Modal>
    );
};

export default InfoModal;