import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings, PocketParams } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface PocketGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const PocketGenerator: React.FC<PocketGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const { t } = useTranslation();
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <RadioGroup options={[{ value: 'rect', label: t('generators.pocket.rectangle') }, { value: 'circ', label: t('generators.pocket.circle') }]} selected={params.shape} onChange={val => handleParamChange('shape', val)} />
            {params.shape === 'rect' ? <>
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.pocket.width')} value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                    <Input label={t('generators.pocket.length')} value={params.length} onChange={e => handleParamChange('length', e.target.value)} unit={unit} />
                </div>
                <Input label={t('generators.pocket.cornerRadius')} value={params.cornerRadius} onChange={e => handleParamChange('cornerRadius', e.target.value)} unit={unit} />
            </> : <>
                <Input label={t('generators.pocket.diameter')} value={params.diameter} onChange={e => handleParamChange('diameter', e.target.value)} unit={unit} />
            </>}
            <hr className='border-secondary' />
            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.pocket.totalDepth')} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help={t('generators.pocket.shouldBeNegative')} />
                <Input label={t('generators.pocket.depthPerPass')} value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
            </div>
            <Input label={t('generators.pocket.stepover')} value={params.stepover} onChange={e => handleParamChange('stepover', e.target.value)} unit='%' />
            <hr className='border-secondary' />
            <SpindleAndFeedControls
                params={params}
                onParamChange={handleParamChange}
                unit={unit}
                plunge={true}
            />
        </div>
    );
};

export default PocketGenerator;