import React from 'react';
import { Tool, MachineSettings } from '../types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface ThreadMillingGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
}

const ThreadMillingGenerator: React.FC<ThreadMillingGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <RadioGroup label='Type' options={[{ value: 'internal', label: 'Internal' }, { value: 'external', label: 'External' }]} selected={params.type} onChange={val => handleParamChange('type', val)} />
            <RadioGroup label='Hand' options={[{ value: 'right', label: 'Right-Hand' }, { value: 'left', label: 'Left-Hand' }]} selected={params.hand} onChange={val => handleParamChange('hand', val)} />
            <hr className='border-secondary' />
            <div className='grid grid-cols-2 gap-4'>
                <Input label='Thread Diameter' value={params.diameter} onChange={e => handleParamChange('diameter', e.target.value)} unit={unit} help='Major diameter' />
                <Input label='Pitch' value={params.pitch} onChange={e => handleParamChange('pitch', e.target.value)} unit={unit} help='Distance between threads' />
            </div>
            <Input label='Thread Depth' value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help='Length of thread' />
            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default ThreadMillingGenerator;