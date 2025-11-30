import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings, ThreadMillingParams } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface ThreadMillingGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const ThreadMillingGenerator: React.FC<ThreadMillingGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const { t } = useTranslation();
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <RadioGroup label={t('generators.thread.type')} options={[{ value: 'internal', label: t('generators.thread.internal') }, { value: 'external', label: t('generators.thread.external') }]} selected={params.type} onChange={val => handleParamChange('type', val)} />
            <RadioGroup label={t('generators.thread.hand')} options={[{ value: 'right', label: t('generators.thread.rightHand') }, { value: 'left', label: t('generators.thread.leftHand') }]} selected={params.hand} onChange={val => handleParamChange('hand', val)} />
            <hr className='border-secondary' />
            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.thread.diameter')} value={params.diameter} onChange={e => handleParamChange('diameter', e.target.value)} unit={unit} help={t('generators.thread.majorDiameter')} />
                <Input label={t('generators.thread.pitch')} value={params.pitch} onChange={e => handleParamChange('pitch', e.target.value)} unit={unit} help={t('generators.thread.pitchHelp')} />
            </div>
            <Input label={t('generators.thread.depth')} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help={t('generators.thread.depthHelp')} />
            <hr className='border-secondary' />
            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default ThreadMillingGenerator;