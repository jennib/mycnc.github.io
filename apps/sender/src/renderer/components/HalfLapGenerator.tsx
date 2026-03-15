import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings } from '@mycnc/shared';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface HalfLapGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
}

const HalfLapGenerator: React.FC<HalfLapGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const { t } = useTranslation();

    if (!params) return <div className="p-4 text-text-secondary">Loading generator settings...</div>;

    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className="space-y-4 text-sm">
            <ToolSelector 
                selectedId={params.toolId} 
                onChange={(id) => handleParamChange('toolId', id)} 
                unit={unit} 
                toolLibrary={toolLibrary} 
            />
            <hr className="border-secondary" />

            <RadioGroup
                label={t('generators.halfLap.jointType')}
                options={[
                    { value: 'standard', label: t('generators.halfLap.standard') },
                    { value: 'mitered', label: t('generators.halfLap.mitered') }
                ]}
                selected={params.jointType}
                onChange={val => handleParamChange('jointType', val)}
            />

            <RadioGroup
                label={t('generators.halfLap.partToGenerate')}
                options={[
                    { value: 'both', label: t('generators.halfLap.both') },
                    { value: 'A', label: t('generators.halfLap.pieceA') },
                    { value: 'B', label: t('generators.halfLap.pieceB') }
                ]}
                selected={params.partToGenerate}
                onChange={val => handleParamChange('partToGenerate', val)}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input label={t('generators.halfLap.width')} value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                <Input label={t('generators.halfLap.lapLength')} value={params.lapLength} onChange={e => handleParamChange('lapLength', e.target.value)} unit={unit} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input label={t('generators.halfLap.boardThickness')} value={params.thickness} onChange={e => handleParamChange('thickness', e.target.value)} unit={unit} />
                <Input label={t('generators.halfLap.depthPerPass')} value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
            </div>

            <hr className="border-secondary" />

            <div className="grid grid-cols-2 gap-4">
                <Input label={t('generators.halfLap.plungeFeed')} value={params.plungeFeed} onChange={e => handleParamChange('plungeFeed', e.target.value)} unit={`${unit}/min`} />
            </div>

            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />

            <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg">
                <p className="text-xs text-accent-yellow leading-relaxed">
                    {params.jointType === 'mitered' 
                        ? `${t('generators.halfLap.miteredHelp')} Note: Piece B must be flipped face-down for assembly.`
                        : t('generators.halfLap.standardHelp')}
                </p>
            </div>
        </div>
    );
};

export default HalfLapGenerator;
