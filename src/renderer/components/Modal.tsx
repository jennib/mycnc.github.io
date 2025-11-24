import React from 'react';
import { X } from './Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = '2xl' }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            <div
                className={`bg-surface rounded-lg shadow-2xl w-full border border-secondary transform transition-all max-h-[90vh] flex flex-col ${sizeClasses[size]}`}
            >
                <div className="p-6 border-b border-secondary flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {children}
                </div>
                {footer && (
                    <div className="bg-background px-6 py-4 flex justify-end items-center gap-4 rounded-b-lg flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;