import React from 'react';
import { Tool, MachineSettings } from '../types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface SlotGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
}

const SlotGenerator: React.FC<SlotGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <RadioGroup options={[{ value: 'straight', label: 'Straight' }, { value: 'arc', label: 'Arc' }]} selected={params.type} onChange={val => handleParamChange('type', val)} />
            {params.type === 'straight' ? <>
                <div className='grid grid-cols-2 gap-4'>
                    <Input label='Start X' value={params.startX} onChange={e => handleParamChange('startX', e.target.value)} unit={unit} />
                    <Input label='Start Y' value={params.startY} onChange={e => handleParamChange('startY', e.target.value)} unit={unit} />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    <Input label='End X' value={params.endX} onChange={e => handleParamChange('endX', e.target.value)} unit={unit} />
                    <Input label='End Y' value={params.endY} onChange={e => handleParamChange('endY', e.target.value)} unit={unit} />
                </div>
            </> : <>
                <div className='grid grid-cols-2 gap-4'>
                    <Input label='Center X' value={params.centerX} onChange={e => handleParamChange('centerX', e.target.value)} unit={unit} />
                    <Input label='Center Y' value={params.centerY} onChange={e => handleParamChange('centerY', e.target.value)} unit={unit} />
                </div>
                <Input label='Radius' value={params.radius} onChange={e => handleParamChange('radius', e.target.value)} unit={unit} />
                <div className='grid grid-cols-2 gap-4'>
                    <Input label='Start Angle' value={params.startAngle} onChange={e => handleParamChange('startAngle', e.target.value)} unit='°' />
                    <Input label='End Angle' value={params.endAngle} onChange={e => handleParamChange('endAngle', e.target.value)} unit='°' />
                </div>
            </>}
            <hr className='border-secondary' />
            <Input label='Slot Width' value={params.slotWidth} onChange={e => handleParamChange('slotWidth', e.target.value)} unit={unit} />
            <div className='grid grid-cols-2 gap-4'>
                <Input label='Total Depth' value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help='Should be negative' />
                <Input label='Depth per Pass' value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
            </div>
            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default SlotGenerator;