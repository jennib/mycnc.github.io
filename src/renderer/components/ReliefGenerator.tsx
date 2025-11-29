import React, { useRef, useEffect } from 'react';
import { Tool, MachineSettings, ReliefParams } from '@/types';
import { ToolSelector, Input, Checkbox, SpindleAndFeedControls } from './SharedControls';

interface ReliefGeneratorProps {
    params: ReliefParams;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null; // Not really used directly as we have two tools, but kept for consistency if needed
    onToolSelect: (id: number | null) => void; // Same
}

const ReliefGenerator: React.FC<ReliefGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings, selectedToolId, onToolSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    handleParamChange('imageDataUrl', event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Draw preview when image changes
    useEffect(() => {
        if (params.imageDataUrl && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                // Maintain aspect ratio in preview
                const aspect = img.width / img.height;
                canvas.width = 300;
                canvas.height = 300 / aspect;
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
            };
            img.src = params.imageDataUrl;
        }
    }, [params.imageDataUrl]);

    return (
        <div className='space-y-4'>
            {/* Image Upload & Settings */}
            <div className="border-b border-secondary pb-4">
                <h3 className="font-bold text-lg mb-2 text-text-primary">1. Source Image</h3>
                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="block w-full text-sm text-text-secondary
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary file:text-white
                            hover:file:bg-primary-focus
                        "
                    />
                    {params.imageDataUrl && (
                        <div className="mt-2">
                            <canvas ref={canvasRef} className="border border-secondary rounded max-w-full" />
                        </div>
                    )}
                    <Checkbox label="Invert Z (Dark = High)" checked={params.invert} onChange={(v) => handleParamChange('invert', v)} />
                </div>
            </div>

            {/* Operation Mode */}
            <div className="border-b border-secondary pb-4">
                <h3 className="font-bold text-lg mb-2 text-text-primary">2. Operation</h3>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text-secondary">Generate:</label>
                    <select
                        value={params.operation || 'both'}
                        onChange={(e) => handleParamChange('operation', e.target.value)}
                        className="bg-background border border-secondary rounded p-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                        <option value="both">Both Roughing & Finishing</option>
                        <option value="roughing">Roughing Only</option>
                        <option value="finishing">Finishing Only</option>
                    </select>
                </div>
            </div>

            {/* Dimensions */}
            <div className="border-b border-secondary pb-4">
                <h3 className="font-bold text-lg mb-2 text-text-primary">3. Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Width (X)" value={params.width} onChange={(e) => handleParamChange('width', e.target.value)} unit={unit} />
                    <Input label="Length (Y)" value={params.length} onChange={(e) => handleParamChange('length', e.target.value)} unit={unit} />
                    <Input label="Max Depth (Z)" value={params.maxDepth} onChange={(e) => handleParamChange('maxDepth', e.target.value)} unit={unit} help="Negative value" />
                    <Input label="Safe Z" value={params.zSafe} onChange={(e) => handleParamChange('zSafe', e.target.value)} unit={unit} />
                </div>
            </div>

            {/* Roughing Pass */}
            <div className="border-b border-secondary pb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-text-primary">4. Roughing Pass</h3>
                    <Checkbox label="Enable" checked={params.roughingEnabled} onChange={(v) => handleParamChange('roughingEnabled', v)} />
                </div>

                {params.roughingEnabled && (
                    <div className="space-y-3 pl-2 border-l-2 border-primary/30">
                        <ToolSelector
                            selectedId={params.roughingToolId}
                            onChange={(id) => handleParamChange('roughingToolId', id)}
                            unit={unit}
                            toolLibrary={toolLibrary}
                            label="Roughing Tool"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Stepdown" value={params.roughingStepdown} onChange={(e) => handleParamChange('roughingStepdown', e.target.value)} unit={unit} />
                            <Input label="Stepover %" value={params.roughingStepover} onChange={(e) => handleParamChange('roughingStepover', e.target.value)} unit="%" />
                            <Input label="Stock to Leave" value={params.roughingStockToLeave} onChange={(e) => handleParamChange('roughingStockToLeave', e.target.value)} unit={unit} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Feed Rate" value={params.roughingFeed} onChange={(e) => handleParamChange('roughingFeed', e.target.value)} unit={`${unit}/min`} />
                            <Input label="Spindle Speed" value={params.roughingSpindle} onChange={(e) => handleParamChange('roughingSpindle', e.target.value)} unit="RPM" />
                        </div>
                    </div>
                )}
            </div>

            {/* Finishing Pass */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-text-primary">5. Finishing Pass</h3>
                    <Checkbox label="Enable" checked={params.finishingEnabled} onChange={(v) => handleParamChange('finishingEnabled', v)} />
                </div>

                {params.finishingEnabled && (
                    <div className="space-y-3 pl-2 border-l-2 border-accent-yellow/30">
                        <ToolSelector
                            selectedId={params.finishingToolId}
                            onChange={(id) => handleParamChange('finishingToolId', id)}
                            unit={unit}
                            toolLibrary={toolLibrary}
                            label="Finishing Tool"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Stepover %" value={params.finishingStepover} onChange={(e) => handleParamChange('finishingStepover', e.target.value)} unit="%" />
                            <Input label="Raster Angle" value={params.finishingAngle} onChange={(e) => handleParamChange('finishingAngle', e.target.value)} unit="deg" help="0 = X-axis, 90 = Y-axis" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Feed Rate" value={params.finishingFeed} onChange={(e) => handleParamChange('finishingFeed', e.target.value)} unit={`${unit}/min`} />
                            <Input label="Spindle Speed" value={params.finishingSpindle} onChange={(e) => handleParamChange('finishingSpindle', e.target.value)} unit="RPM" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReliefGenerator;
