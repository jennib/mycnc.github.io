import React from 'react';
import { useTranslation } from 'react-i18next';
import { DecorativeJoineryParams, Tool, MachineSettings } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface DecorativeJoineryGeneratorProps {
    params: DecorativeJoineryParams;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const DecorativeJoineryGenerator: React.FC<DecorativeJoineryGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const { t } = useTranslation();

    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4 text-sm'>
            <ToolSelector 
                selectedId={params.toolId} 
                onChange={(id) => handleParamChange('toolId', id)} 
                unit={unit} 
                toolLibrary={toolLibrary} 
            />
            
            <hr className='border-secondary' />

            <RadioGroup
                label={t('generators.decorative.type')}
                options={[
                    { value: 'puzzle', label: t('generators.decorative.puzzle') },
                    { value: 'wave', label: t('generators.decorative.wave') },
                    { value: 'dovetail_inlay', label: t('generators.decorative.dovetail') },
                    { value: 'blind_mortise', label: t('generators.decorative.interlock') }
                ]}
                selected={params.type}
                onChange={val => handleParamChange('type', val)}
            />
            <RadioGroup
                label={t('generators.decorative.partToGenerate')}
                options={[
                    { value: 'socket', label: t('generators.decorative.socket') },
                    { value: 'pin', label: t('generators.decorative.pin') },
                    { value: 'both', label: t('generators.decorative.both') }
                ]}
                selected={params.part}
                onChange={val => handleParamChange('part', val)}
            />

            <div className='grid grid-cols-2 gap-x-4'>
                <RadioGroup
                    label={t('generators.decorative.orientation')}
                    options={[
                        { value: 'horizontal', label: t('generators.decorative.horizontal') },
                        { value: 'vertical', label: t('generators.decorative.vertical') }
                    ]}
                    selected={params.orientation}
                    onChange={val => handleParamChange('orientation', val)}
                />
                <Input 
                    label={t('generators.decorative.overallLength')} 
                    value={params.length} 
                    onChange={e => handleParamChange('length', e.target.value)} 
                    unit={unit} 
                />
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <Input 
                    label={t('generators.decorative.patternWidth')} 
                    value={params.width} 
                    onChange={e => handleParamChange('width', e.target.value)} 
                    unit={unit} 
                    help={t('generators.decorative.patternWidthHelp')}
                />
                <Input 
                    label={t('generators.decorative.pitch')} 
                    onChange={e => handleParamChange('pitch', e.target.value)} 
                    value={params.pitch} 
                    unit={unit} 
                    help={t('generators.decorative.pitchHelp')}
                />
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <Input 
                    label={t('generators.decorative.repeatCount')} 
                    value={params.repeatCount} 
                    onChange={e => handleParamChange('repeatCount', e.target.value)} 
                />
                <Input 
                    label={t('generators.decorative.tolerance')} 
                    value={params.tolerance} 
                    onChange={e => handleParamChange('tolerance', e.target.value)} 
                    unit={unit} 
                />
            </div>

            {params.type === 'blind_mortise' && (
                <div className='bg-primary/5 p-4 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300'>
                    <Input 
                        label={t('generators.decorative.inset')} 
                        value={params.inset} 
                        onChange={e => handleParamChange('inset', e.target.value)} 
                        unit={unit} 
                        help={t('generators.decorative.insetHelp')}
                    />
                </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
                <Input 
                    label={t('generators.decorative.depth')} 
                    value={params.depth} 
                    onChange={e => handleParamChange('depth', e.target.value)} 
                    unit={unit} 
                />
                <div className="grid grid-cols-2 gap-2">
                    <Input 
                        label={t('generators.decorative.offsetX')} 
                        value={params.offsetX} 
                        onChange={e => handleParamChange('offsetX', e.target.value)} 
                        unit={unit} 
                    />
                    <Input 
                        label={t('generators.decorative.offsetY')} 
                        value={params.offsetY} 
                        onChange={e => handleParamChange('offsetY', e.target.value)} 
                        unit={unit} 
                    />
                </div>
            </div>

            <hr className='border-secondary' />

            <div className='grid grid-cols-2 gap-4'>
                <Input 
                    label={t('generators.decorative.depthPerPass')} 
                    value={params.depthPerPass} 
                    onChange={e => handleParamChange('depthPerPass', e.target.value)} 
                    unit={unit} 
                />
                <Input 
                    label={t('generators.decorative.plungeFeed')} 
                    value={params.plungeFeed} 
                    onChange={e => handleParamChange('plungeFeed', e.target.value)} 
                    unit={`${unit}/min`} 
                />
            </div>

            <SpindleAndFeedControls 
                params={params} 
                onParamChange={handleParamChange} 
                unit={unit} 
            />
        </div>
    );
};

export default DecorativeJoineryGenerator;
