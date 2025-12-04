import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings, ReliefParams } from "@mycnc/shared";
import { ToolSelector, Input, Checkbox, SpindleAndFeedControls } from './SharedControls';
import { Slider } from './Slider';
import ReliefPreview3D from './ReliefPreview3D';

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
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const aspectRatioRef = useRef<number | null>(null);
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

    const handleParamChange = (field: string, value: any) => {
        if (field === 'width' && params.keepAspectRatio && aspectRatioRef.current) {
            const newWidth = parseFloat(value);
            if (!isNaN(newWidth)) {
                onParamsChange('width', value);
                onParamsChange('length', (newWidth / aspectRatioRef.current).toFixed(3));
            } else {
                onParamsChange(field, value);
            }
        } else if (field === 'length' && params.keepAspectRatio && aspectRatioRef.current) {
            const newLength = parseFloat(value);
            if (!isNaN(newLength)) {
                onParamsChange('length', value);
                onParamsChange('width', (newLength * aspectRatioRef.current).toFixed(3));
            } else {
                onParamsChange(field, value);
            }
        } else if (field === 'keepAspectRatio') {
            onParamsChange('keepAspectRatio', value);
            if (value && aspectRatioRef.current && !isNaN(Number(params.width))) {
                // Sync length to width when enabled
                onParamsChange('length', (Number(params.width) / aspectRatioRef.current).toFixed(3));
            }
        } else {
            onParamsChange(field, value);
        }
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
                aspectRatioRef.current = aspect;
                canvas.width = 300;
                canvas.height = 300 / aspect;
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }

                // Auto-scale to fit machine work area with 20% margin
                if (settings?.workArea) {
                    const margin = 0.2;
                    const maxW = settings.workArea.x * (1 - margin);
                    const maxL = settings.workArea.y * (1 - margin);

                    let newWidth = maxW;
                    let newLength = newWidth / aspect;

                    if (newLength > maxL) {
                        newLength = maxL;
                        newWidth = newLength * aspect;
                    }

                    onParamsChange('width', newWidth.toFixed(3));
                    onParamsChange('length', newLength.toFixed(3));
                }
            };
            img.src = params.imageDataUrl;
        }
    }, [params.imageDataUrl]);

    // Redraw canvas when switching back to 2D view
    useEffect(() => {
        if (viewMode === '2d' && params.imageDataUrl && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                const aspect = img.width / img.height;
                canvas.width = 300;
                canvas.height = 300 / aspect;
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
            };
            img.src = params.imageDataUrl;
        }
    }, [viewMode, params.imageDataUrl]);

    return (
        <div className='space-y-4'>
            {/* Image Upload & Settings */}
            <div className="border-b border-secondary pb-4">
                <h3 className="font-bold text-lg mb-2 text-text-primary">{t('generators.relief.sourceImage')}</h3>
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
                            {/* Operation Mode */}
                            <div className="border-b border-secondary pb-4">
                                <h3 className="font-bold text-lg mb-2 text-text-primary">{t('generators.relief.operation')}</h3>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-text-secondary">{t('generators.relief.generate')}</label>
                                    <select
                                        value={params.operation || 'both'}
                                        onChange={(e) => handleParamChange('operation', e.target.value)}
                                        className="bg-background border border-secondary rounded p-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        <option value="both">{t('generators.relief.both')}</option>
                                        <option value="roughing">{t('generators.relief.roughingOnly')}</option>
                                        <option value="finishing">{t('generators.relief.finishingOnly')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Dimensions */}
                            <div className="border-b border-secondary pb-4">
                                <h3 className="font-bold text-lg mb-2 text-text-primary">{t('generators.relief.dimensions')}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Checkbox label={t('generators.relief.keepAspectRatio')} checked={params.keepAspectRatio} onChange={(v) => handleParamChange('keepAspectRatio', v)} />
                                    </div>
                                    <Input label={t('generators.relief.width')} value={params.width} onChange={(e) => handleParamChange('width', e.target.value)} unit={unit} />
                                    <Input label={t('generators.relief.length')} value={params.length} onChange={(e) => handleParamChange('length', e.target.value)} unit={unit} />
                                    <Input label={t('generators.relief.maxDepth')} value={params.maxDepth} onChange={(e) => handleParamChange('maxDepth', e.target.value)} unit={unit} help={t('generators.relief.maxDepthHelp')} />
                                    <Input label={t('generators.common.safeZ')} value={params.zSafe} onChange={(e) => handleParamChange('zSafe', e.target.value)} unit={unit} />
                                </div>
                            </div>

                            {/* Tone Mapping (Gamma/Contrast/Smoothing) */}
                            <div className="border-b border-secondary pb-4">
                                <h3 className="font-bold text-lg mb-2 text-text-primary">{t('generators.relief.toneMapping')}</h3>
                                <div className="flex items-center justify-between mb-2">
                                    <Checkbox label={t('generators.relief.invert')} checked={params.invert} onChange={(v) => handleParamChange('invert', v)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <Slider
                                        label={t('generators.relief.gamma')}
                                        value={params.gamma}
                                        onChange={(v) => handleParamChange('gamma', v)}
                                        min={0.1}
                                        max={3.0}
                                        step={0.1}
                                        help={t('generators.relief.gammaHelp')}
                                    />
                                    <Slider
                                        label={t('generators.relief.contrast')}
                                        value={params.contrast}
                                        onChange={(v) => handleParamChange('contrast', v)}
                                        min={0.5}
                                        max={2.0}
                                        step={0.1}
                                        help={t('generators.relief.contrastHelp')}
                                    />
                                    <div className="col-span-2">
                                        <Slider
                                            label={t('generators.relief.smoothing')}
                                            value={params.smoothing || 0}
                                            onChange={(v) => handleParamChange('smoothing', v)}
                                            min={0}
                                            max={10}
                                            step={1}
                                            help={t('generators.relief.smoothingHelp')}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Slider
                                            label={t('generators.relief.detail')}
                                            value={params.detail || 0}
                                            onChange={(v) => handleParamChange('detail', v)}
                                            min={0}
                                            max={10}
                                            step={1}
                                            help={t('generators.relief.detailHelp')}
                                        />
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-text-secondary">{t('generators.relief.quality')}</label>
                                        <select
                                            value={params.quality || 'medium'}
                                            onChange={(e) => handleParamChange('quality', e.target.value)}
                                            className="bg-background border border-secondary rounded p-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                        >
                                            <option value="low">{t('generators.relief.qualityLow')} (500px)</option>
                                            <option value="medium">{t('generators.relief.qualityMedium')} (1000px)</option>
                                            <option value="high">{t('generators.relief.qualityHigh')} (2000px)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>





                            {/* Roughing Pass */}
                            <div className="border-b border-secondary pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg text-text-primary">{t('generators.relief.roughingPass')}</h3>
                                    <Checkbox label={t('generators.relief.enable')} checked={params.roughingEnabled} onChange={(v) => handleParamChange('roughingEnabled', v)} />
                                </div>

                                {params.roughingEnabled && (
                                    <div className="space-y-3 pl-2 border-l-2 border-primary/30">
                                        <ToolSelector
                                            selectedId={params.roughingToolId}
                                            onChange={(id) => handleParamChange('roughingToolId', id)}
                                            unit={unit}
                                            toolLibrary={toolLibrary}
                                            label={t('generators.relief.roughingTool')}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label={t('generators.relief.stepdown')} value={params.roughingStepdown} onChange={(e) => handleParamChange('roughingStepdown', e.target.value)} unit={unit} />
                                            <Input label={t('generators.relief.stepover')} value={params.roughingStepover} onChange={(e) => handleParamChange('roughingStepover', e.target.value)} unit="%" />
                                            <Input label={t('generators.relief.stockToLeave')} value={params.roughingStockToLeave} onChange={(e) => handleParamChange('roughingStockToLeave', e.target.value)} unit={unit} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label={t('generators.common.feedRate')} value={params.roughingFeed} onChange={(e) => handleParamChange('roughingFeed', e.target.value)} unit={`${unit}/min`} />
                                            <Input label={t('generators.common.spindleSpeed')} value={params.roughingSpindle} onChange={(e) => handleParamChange('roughingSpindle', e.target.value)} unit="RPM" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Finishing Pass */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg text-text-primary">{t('generators.relief.finishingPass')}</h3>
                                    <Checkbox label={t('generators.relief.enable')} checked={params.finishingEnabled} onChange={(v) => handleParamChange('finishingEnabled', v)} />
                                </div>

                                {params.finishingEnabled && (
                                    <div className="space-y-3 pl-2 border-l-2 border-accent-yellow/30">
                                        <ToolSelector
                                            selectedId={params.finishingToolId}
                                            onChange={(id) => handleParamChange('finishingToolId', id)}
                                            unit={unit}
                                            toolLibrary={toolLibrary}
                                            label={t('generators.relief.finishingTool')}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label={t('generators.relief.stepover')} value={params.finishingStepover} onChange={(e) => handleParamChange('finishingStepover', e.target.value)} unit="%" />
                                            <Input label={t('generators.relief.rasterAngle')} value={params.finishingAngle} onChange={(e) => handleParamChange('finishingAngle', e.target.value)} unit="deg" help={t('generators.relief.rasterAngleHelp')} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label={t('generators.common.feedRate')} value={params.finishingFeed} onChange={(e) => handleParamChange('finishingFeed', e.target.value)} unit={`${unit}/min`} />
                                            <Input label={t('generators.common.spindleSpeed')} value={params.finishingSpindle} onChange={(e) => handleParamChange('finishingSpindle', e.target.value)} unit="RPM" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Preview */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-text-secondary">{t('generators.relief.preview')}</label>
                    <div className="flex bg-secondary rounded-md p-1">
                        <button
                            onClick={() => setViewMode('2d')}
                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${viewMode === '2d' ? 'bg-primary text-white' : 'hover:bg-secondary-focus'
                                }`}
                        >
                            {t('generators.relief.image2d')}
                        </button>
                        <button
                            onClick={() => setViewMode('3d')}
                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${viewMode === '3d' ? 'bg-primary text-white' : 'hover:bg-secondary-focus'
                                }`}
                        >
                            {t('generators.relief.relief3d')}
                        </button>
                    </div>
                </div>

                {viewMode === '2d' ? (
                    <div className="border border-secondary rounded-md p-2 bg-black/20 flex justify-center">
                        <canvas ref={canvasRef} className="max-w-full h-auto border border-secondary/50" />
                    </div>
                ) : (
                    <ReliefPreview3D
                        imageDataUrl={params.imageDataUrl || ''}
                        width={parseFloat(String(params.width)) || 100}
                        height={parseFloat(String(params.length)) || 100}
                        maxDepth={parseFloat(String(params.maxDepth)) || -10}
                        gamma={params.gamma}
                        contrast={params.contrast}
                        invert={params.invert}
                        smoothing={params.smoothing || 0}
                    />
                )}
            </div>
        </div>
    );
};

export default ReliefGenerator;
