import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { X, Move } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useJobStore } from '../../stores/jobStore';
import { translateGCodeToOrigin } from '../../utils/gcodeTranslation';
import NumberInput from '../ui/NumberInput';

function detectGCodeUnit(lines: string[]): 'mm' | 'in' {
    for (const line of lines.slice(0, 50)) {
        const clean = line.toUpperCase().split(';')[0];
        if (clean.includes('G21')) return 'mm';
        if (clean.includes('G20')) return 'in';
    }
    return 'mm';
}

const TranslateToOriginModal: React.FC = () => {
    const { isTranslateToOriginModalOpen, actions: uiActions } = useUIStore();
    const { gcodeLines, actions: jobActions } = useJobStore();

    const [toolDiameter, setToolDiameter] = useState('6.35');
    const [inputUnit, setInputUnit] = useState<'mm' | 'in'>('mm');

    const gcodeUnit = useMemo(() => detectGCodeUnit(gcodeLines), [gcodeLines]);

    if (!isTranslateToOriginModalOpen) return null;

    const diameter = parseFloat(toolDiameter);
    const isValid = !isNaN(diameter) && diameter > 0;

    // Convert input diameter to GCode native units
    const diameterInGCodeUnits = (() => {
        if (!isValid) return 0;
        if (inputUnit === 'mm' && gcodeUnit === 'in') return diameter / 25.4;
        if (inputUnit === 'in' && gcodeUnit === 'mm') return diameter * 25.4;
        return diameter;
    })();

    const handleApply = () => {
        if (!isValid || gcodeLines.length === 0) return;
        const translated = translateGCodeToOrigin(gcodeLines, diameterInGCodeUnits);
        jobActions.updateGCode(translated.join('\n'));
        uiActions.closeTranslateToOriginModal();
    };

    const conversionNote = inputUnit !== gcodeUnit && isValid
        ? `= ${diameterInGCodeUnits.toFixed(4)} ${gcodeUnit} (GCode units)`
        : null;

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
                        Shifts the toolpath so the nearest part edge lands at (0, 0), accounting for tool radius.
                    </p>

                    <div className="flex items-center gap-2 text-xs text-text-secondary bg-background/50 px-3 py-2 rounded-lg border border-white/5">
                        <span>Detected GCode unit:</span>
                        <span className="font-bold text-text-primary">{gcodeUnit === 'mm' ? 'Millimeters (G21)' : 'Inches (G20)'}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Tool Diameter
                        </label>
                        <div className="flex gap-2">
                            <NumberInput
                                value={toolDiameter}
                                onChange={setToolDiameter}
                                min={0}
                                step={0.01}
                                label="Tool Diameter"
                                unit={inputUnit}
                                placeholder="e.g. 6.35"
                                className="flex-1"
                            />
                            <div className="flex rounded-lg overflow-hidden border border-white/10 shrink-0">
                                <button
                                    onClick={() => setInputUnit('mm')}
                                    className={`px-3 py-2 text-sm font-bold transition-colors ${inputUnit === 'mm' ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:text-text-primary'}`}
                                >
                                    mm
                                </button>
                                <button
                                    onClick={() => setInputUnit('in')}
                                    className={`px-3 py-2 text-sm font-bold transition-colors ${inputUnit === 'in' ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:text-text-primary'}`}
                                >
                                    in
                                </button>
                            </div>
                        </div>
                        {conversionNote && (
                            <p className="text-xs text-accent-yellow mt-1.5">{conversionNote}</p>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between bg-surface/50">
                    <button onClick={uiActions.closeTranslateToOriginModal} className="btn btn-secondary">Cancel</button>
                    <button
                        onClick={handleApply}
                        disabled={gcodeLines.length === 0 || !isValid}
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
