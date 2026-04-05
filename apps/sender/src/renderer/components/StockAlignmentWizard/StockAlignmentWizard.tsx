import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, X, RotateCw } from "@mycnc/shared";
import { Navigation, Target } from "lucide-react";
import { useUIStore } from '../../stores/uiStore';
import { useMachineStore } from '../../stores/machineStore';
import { useConnectionStore } from '../../stores/connectionStore';
import { useJobStore } from '../../stores/jobStore';
import { rotateGCodeLines } from '../../utils/gcodeRotation';

const StockAlignmentWizard: React.FC = () => {
    const { t } = useTranslation();
    const { isStockAlignmentWizardOpen, actions: uiActions } = useUIStore();
    const { machineState, actions: machineActions } = useMachineStore();
    const { controller, actions: connectionActions } = useConnectionStore();
    const { gcodeLines, actions: jobActions } = useJobStore();

    const [step, setStep] = useState(1);
    const [pointA, setPointA] = useState<{ x: number, y: number } | null>(null);
    const [pointB, setPointB] = useState<{ x: number, y: number } | null>(null);
    const [angle, setAngle] = useState(0);
    const [isProbing, setIsProbing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isStockAlignmentWizardOpen) {
            setStep(1);
            setPointA(null);
            setPointB(null);
            setAngle(0);
            setErrorMsg('');
        }
    }, [isStockAlignmentWizardOpen]);

    if (!isStockAlignmentWizardOpen) return null;

    const captureProbe = async () => {
        if (!controller) throw new Error("Not connected");
        setIsProbing(true);
        setErrorMsg('');

        return new Promise<{ x: number, y: number }>((resolve, reject) => {
            const handler = (data: any) => {
                if (data.type === 'received' && data.message.includes('[PRB:')) {
                    controller.off('data', handler);
                    const match = data.message.match(/\[PRB:(-?[\d.]+),(-?[\d.]+),(-?[\d.]+):(\d)\]/);
                    if (match && match[4] === '1') {
                        resolve({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
                    } else {
                        reject(new Error("Probe failed to trigger"));
                    }
                }
            };

            controller.on('data', handler);
            machineActions.handleProbe('Y');

            setTimeout(() => {
                controller.off('data', handler);
                reject(new Error("Probe timed out."));
                connectionActions.sendRealtimeCommand('\x85'); // Feed hold / Cancel
            }, 10000);
        }).finally(() => {
            setIsProbing(false);
            // Retract
            connectionActions.sendLine('G91 G0 Y5\nG90');
        });
    };

    const handleProbeA = async () => {
        try {
            const pos = await captureProbe();
            setPointA(pos);
            setStep(3);
        } catch (err: any) {
            setErrorMsg(err.message);
        }
    };

    const handleProbeB = async () => {
        try {
            const pos = await captureProbe();
            setPointB(pos);

            // Calculate angle
            if (pointA) {
                const dy = pos.y - pointA.y;
                const dx = pos.x - pointA.x;
                const calculatedAngle = Math.atan2(dy, dx);
                setAngle(calculatedAngle);
            }

            setStep(5);
        } catch (err: any) {
            setErrorMsg(err.message);
        }
    };

    const applyCompensation = () => {
        if (gcodeLines.length > 0) {
            const newGcode = rotateGCodeLines(gcodeLines, angle);
            jobActions.updateGCode(newGcode.join('\n'));
        }
        jobActions.setStockRotationAngle(angle);
        uiActions.closeStockAlignmentWizard();
    };

    const angleDeg = (angle * 180 / Math.PI).toFixed(3);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[10000] flex items-center justify-center">
            <div className="bg-surface backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-2xl border border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <RotateCw className="w-6 h-6 text-accent-cyan" />
                        Stock Alignment Wizard
                    </h2>
                    <button onClick={uiActions.closeStockAlignmentWizard} className="p-2 rounded-lg text-text-secondary hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6 flex-1">
                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <p className="text-sm">{errorMsg}</p>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Step 1: Setup Touch Plate</h3>
                            <p className="text-text-secondary">Attach the grounding clip to your endmill. Position the XYZ touch plate against the front edge of your stock, near the bottom-left corner.</p>
                            <p className="text-text-secondary">Jog the machine so the tool is hovering closely in front of the touch plate along the Y axis.</p>
                            <div className="flex justify-end pt-4">
                                <button onClick={() => setStep(2)} className="btn-primary flex items-center gap-2">
                                    Next <Navigation className="w-4 h-4 rotate-90" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Step 2: Probe Point A</h3>
                            <p className="text-text-secondary">When ready, click 'Start Probe'. The machine will slowly probe along the Y-axis to find the edge.</p>
                            <div className="flex justify-center pt-8">
                                <button onClick={handleProbeA} disabled={isProbing} className="btn btn-info px-8 py-3 text-lg">
                                    {isProbing ? <RotateCw className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                                    {isProbing ? 'Probing...' : 'Start Probe'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Step 3: Reposition Touch Plate</h3>
                            <p className="text-text-secondary">Point A recorded successfully!</p>
                            <p className="text-text-secondary">Now, move the touch plate further right along the front edge of the stock. Jog the machine to position the tool in front of the new plate location.</p>
                            <div className="flex justify-end pt-4 gap-3">
                                <button onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
                                <button onClick={() => setStep(4)} className="btn btn-primary">Next</button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Step 4: Probe Point B</h3>
                            <p className="text-text-secondary">Click 'Start Probe' to find the second edge point.</p>
                            <div className="flex justify-center pt-8">
                                <button onClick={handleProbeB} disabled={isProbing} className="btn btn-info px-8 py-3 text-lg">
                                    {isProbing ? <RotateCw className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                                    {isProbing ? 'Probing...' : 'Start Probe'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-4 text-center">
                            <CheckCircle className="w-16 h-16 text-accent-green mx-auto mb-4" />
                            <h3 className="text-2xl font-bold">Alignment Complete!</h3>
                            <div className="bg-background/50 p-6 rounded-lg text-left mt-6 border border-white/5 space-y-2">
                                <p><span className="text-text-secondary">Point A:</span> X{pointA?.x.toFixed(3)} Y{pointA?.y.toFixed(3)}</p>
                                <p><span className="text-text-secondary">Point B:</span> X{pointB?.x.toFixed(3)} Y{pointB?.y.toFixed(3)}</p>
                                <div className="h-px bg-white/10 my-4" />
                                <p className="text-lg font-mono text-accent-yellow">Calculated Skew Offset: {angleDeg}°</p>
                            </div>
                            <p className="text-text-secondary mt-6">Do you want to apply this rotation offset to the loaded G-Code job?</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between bg-surface/50">
                    <button onClick={uiActions.closeStockAlignmentWizard} className="btn btn-secondary">Cancel</button>
                    {step === 5 && (
                        <button onClick={applyCompensation} className="btn btn-primary">Apply Compensation</button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StockAlignmentWizard;
