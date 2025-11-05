import React from 'react';
import { Tool, MachineSettings } from '../types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface SurfacingGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
}

const SurfacingGenerator: React.FC<SurfacingGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <div className='grid grid-cols-2 gap-4'>
                <Input label={`Width (X)`} value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                <Input label={`Length (Y)`} value={params.length} onChange={e => handleParamChange('length', e.target.value)} unit={unit} />
            </div>
            <RadioGroup label='Milling Direction' options={[{ value: 'horizontal', label: 'Horizontal (X)' }, { value: 'vertical', label: 'Vertical (Y)' }]} selected={params.direction} onChange={val => handleParamChange('direction', val)} />
            <Input label='Final Depth' value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help='Should be negative' />
            <Input label='Stepover' value={params.stepover} onChange={e => handleParamChange('stepover', e.target.value)} unit='%' />
            <SpindleAndFeedControls params={params} onParamChange={(field, value) => handleParamChange(field, value)} unit={unit} />
        </div>
    );
};

export default SurfacingGenerator;