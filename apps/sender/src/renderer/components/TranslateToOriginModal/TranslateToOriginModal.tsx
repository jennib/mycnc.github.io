import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Move } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useJobStore } from '../../stores/jobStore';
import { translateGCodeToOrigin } from '../../utils/gcodeTranslation';

const TranslateToOriginModal: React.FC = () => {
    const { isTranslateToOriginModalOpen, actions: uiActions } = useUIStore();
    const { gcodeLines, actions: jobActions } = useJobStore();

    const [toolDiameter, setToolDiameter] = useState('6.35');

    if (!isTranslateToOriginModalOpen) return null;

    const handleApply = () => {
        const diameter = parseFloat(toolDiameter);
        if (isNaN(diameter) || diameter < 0) return;
        if (gcodeLines.length > 0) {
            const translated = translateGCodeToOrigin(gcodeLines, diameter);
            jobActions.updateGCode(translated.join('\n'));
        }
        uiActions.closeTranslateToOriginModal();
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[10000] flex items-center justify-center">
            <div className="bg-surface backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-md border border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <Move className="w-5 h-5 text-accent-cyan" />
                        Translate to Origin
                    </h2>
                    <button onClick={uiActions.closeTranslateToOriginModal} className="p-2 rounded-lg text-text-secondary hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-text-secondary text-sm">
                        Shifts the entire toolpath so the nearest part edge lands at the origin (0, 0), accounting for tool radius.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Tool Diameter (same units as G-Code)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={toolDiameter}
                            onChange={e => setToolDiameter(e.target.value)}
                            className="input w-full"
                            placeholder="e.g. 6.35"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between bg-surface/50">
                    <button onClick={uiActions.closeTranslateToOriginModal} className="btn btn-secondary">Cancel</button>
                    <button
                        onClick={handleApply}
                        disabled={gcodeLines.length === 0 || isNaN(parseFloat(toolDiameter))}
                        className="btn btn-primary"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TranslateToOriginModal;
