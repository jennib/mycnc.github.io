import React from 'react';
import { X, Settings, BookOpen, Zap } from './Icons';
import Modal from './Modal';
import { useUIStore } from '../stores/uiStore';

// ... (WelcomeModalProps and SetupStep interfaces)

const WelcomeModal: React.FC<WelcomeModalProps> = ({
    // ... (props)
}) => {
    const { openTour } = useUIStore(state => state.actions);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* ... (modal header and content) */}
            <div className="pt-6 border-t border-secondary space-y-4">
                {/* ... (Get Started button) */}
                <div className="text-center">
                    <p className="text-sm text-text-secondary mb-2">Or, if you just want to try out the software:</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={onTrySimulator} className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus flex items-center gap-2">
                            <Zap className="w-5 h-5" />Try the Simulator
                        </button>
                        <button onClick={() => { onClose(); openTour(); }} className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />Take a Tour
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default WelcomeModal;