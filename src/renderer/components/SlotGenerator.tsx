import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings, SlotParams } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface SlotGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const SlotGenerator: React.FC<SlotGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const { t } = useTranslation();
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <RadioGroup options={[{ value: 'straight', label: t('generators.slot.straight') }, { value: 'arc', label: t('generators.slot.arc') }]} selected={params.type} onChange={val => handleParamChange('type', val)} />
            {params.type === 'straight' ? <>
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.slot.startX')} value={params.startX} onChange={e => handleParamChange('startX', e.target.value)} unit={unit} />
                    <Input label={t('generators.slot.startY')} value={params.startY} onChange={e => handleParamChange('startY', e.target.value)} unit={unit} />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.slot.endX')} value={params.endX} onChange={e => handleParamChange('endX', e.target.value)} unit={unit} />
                    <Input label={t('generators.slot.endY')} value={params.endY} onChange={e => handleParamChange('endY', e.target.value)} unit={unit} />
                </div>
            </> : <>
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.slot.centerX')} value={params.centerX} onChange={e => handleParamChange('centerX', e.target.value)} unit={unit} />
                    <Input label={t('generators.slot.centerY')} value={params.centerY} onChange={e => handleParamChange('centerY', e.target.value)} unit={unit} />
                </div>
                <Input label={t('generators.slot.radius')} value={params.radius} onChange={e => handleParamChange('radius', e.target.value)} unit={unit} />
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.slot.startAngle')} value={params.startAngle} onChange={e => handleParamChange('startAngle', e.target.value)} unit='°' />
                    <Input label={t('generators.slot.endAngle')} value={params.endAngle} onChange={e => handleParamChange('endAngle', e.target.value)} unit='°' />
                </div>
            </>}
            <hr className='border-secondary' />
            <Input label={t('generators.slot.slotWidth')} value={params.slotWidth} onChange={e => handleParamChange('slotWidth', e.target.value)} unit={unit} />
            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.slot.totalDepth')} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help={t('generators.slot.shouldBeNegative')} />
                <Input label={t('generators.slot.depthPerPass')} value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
            </div>
            <hr className='border-secondary' />
            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default SlotGenerator;