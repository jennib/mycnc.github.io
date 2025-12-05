import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X } from "@mycnc/shared";
import { Input, ToolSelector, SpindleAndFeedControls } from './SharedControls';
import { SVGParams, Tool, MachineSettings } from '@/types';

interface SVGGeneratorProps {
    params: SVGParams;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const SVGGenerator: React.FC<SVGGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings, selectedToolId, onToolSelect }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onParamsChange('file', file);
            onParamsChange('fileName', file.name);

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                if (content) {
                    onParamsChange('svgContent', content);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleClearFile = () => {
        onParamsChange('file', null);
        onParamsChange('fileName', '');
        onParamsChange('svgContent', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <ToolSelector
                selectedId={selectedToolId}
                onChange={onToolSelect}
                unit={unit}
                toolLibrary={toolLibrary}
            />

            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <label className="block text-sm font-bold text-text-secondary mb-2">{t('generators.svg.file', 'SVG File')}</label>
                {!params.fileName ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all"
                    >
                        <Upload className="w-8 h-8 text-text-secondary mb-2" />
                        <span className="text-sm text-text-secondary font-medium">{t('generators.svg.upload', 'Click to upload SVG')}</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".svg"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">SVG</span>
                            </div>
                            <span className="text-sm font-medium text-text-primary truncate">{params.fileName}</span>
                        </div>
                        <button
                            onClick={handleClearFile}
                            className="p-1 hover:bg-white/10 rounded-md text-text-secondary hover:text-red-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {params.svgContent && (
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('generators.svg.scale', 'Scale')}
                            value={params.scale}
                            onChange={e => onParamsChange('scale', e.target.value)}
                            step="0.1"
                        />
                        <Input
                            label={t('generators.svg.rotation', 'Rotation (°)')}
                            value={params.rotation}
                            onChange={e => onParamsChange('rotation', e.target.value)}
                            unit="°"
                        />
                    </div>
                    <Input
                        label={t('generators.svg.position', 'Position Offset')}
                        valueX={params.positionX}
                        valueY={params.positionY}
                        onChangeX={e => onParamsChange('positionX', e.target.value)}
                        onChangeY={e => onParamsChange('positionY', e.target.value)}
                        isXY
                        unit={unit}
                    />
                    <Input
                        label={t('generators.svg.depth', 'Engraving Depth')}
                        value={params.depth}
                        onChange={e => onParamsChange('depth', e.target.value)}
                        unit={unit}
                        help={t('generators.svg.shouldBeNegative')}
                    />
                </div>
            )}

            <SpindleAndFeedControls
                params={params}
                onParamChange={onParamsChange}
                unit={unit}
            />
        </div>
    );
};

export default SVGGenerator;
