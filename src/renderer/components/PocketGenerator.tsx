import React from 'react';
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
    const handleParamChange = (field: string, value: any) => {
        // For numeric inputs, ensure the value is a number or null
        const numericFields = [
            'width', 'length', 'cornerRadius', 'diameter', 'depth', 'depthPerPass',
            'stepover', 'toolId', 'feed', 'spindle', 'plungeFeed', 'safeZ'
        ];

        if (numericFields.includes(field)) {
            const numValue = parseFloat(value);
            onParamsChange(field, isNaN(numValue) ? null : numValue);
        } else {
            onParamsChange(field, value);
        }
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <RadioGroup options={[{ value: 'rect', label: 'Rectangle' }, { value: 'circ', label: 'Circle' }]} selected={params.shape} onChange={val => handleParamChange('shape', val)} />
            {params.shape === 'rect' ? <>
                <div className='grid grid-cols-2 gap-4'>
                    <Input label='Width (X)' value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                    <Input label='Length (Y)' value={params.length} onChange={e => handleParamChange('length', e.target.value)} unit={unit} />
                </div>
                <Input label='Corner Radius' value={params.cornerRadius} onChange={e => handleParamChange('cornerRadius', e.target.value)} unit={unit} />
            </> : <>
                <Input label='Diameter' value={params.diameter} onChange={e => handleParamChange('diameter', e.target.value)} unit={unit} />
            </>}
            <hr className='border-secondary' />
            <div className='grid grid-cols-2 gap-4'>
                <Input label='Total Depth' value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help='Should be negative' />
                <Input label='Depth per Pass' value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
            </div>
            <Input label='Stepover' value={params.stepover} onChange={e => handleParamChange('stepover', e.target.value)} unit='%' />
            <hr className='border-secondary' />
            <RadioGroup
                label='Toolpath Origin'
                selected={params.toolpathOrigin}
                onChange={(value) => handleParamChange('toolpathOrigin', value)}
                options={[
                    { value: 'front_left_top', label: 'Front-Left-Top Corner' },
                    { value: 'top_center', label: 'Top Center' },
                ]}
            />
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