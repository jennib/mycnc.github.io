import React from 'react';
import { Tool, MachineSettings, ProfileParams } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls, Checkbox } from './SharedControls';

interface ProfileGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const ProfileGenerator: React.FC<ProfileGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
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
            <RadioGroup label='Cut Side' options={[{ value: 'outside', label: 'Outside' }, { value: 'inside', label: 'Inside' }, { value: 'online', label: 'On-line' }]} selected={params.cutSide} onChange={val => handleParamChange('cutSide', val)} />
            <div className='grid grid-cols-2 gap-4'>
                <Input label='Total Depth' value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help='Should be negative' />
                <Input label='Depth per Pass' value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
            </div>
            <hr className='border-secondary' />
            <Checkbox label="Enable Tabs" checked={params.tabsEnabled} onChange={(checked) => handleParamChange('tabsEnabled', checked)} />
            {params.tabsEnabled && (
                <div className='grid grid-cols-3 gap-4 pl-4 mt-2 border-l-2 border-secondary'>
                    <Input label='Number' value={params.numTabs} onChange={e => handleParamChange('numTabs', e.target.value)} />
                    <Input label='Width' value={params.tabWidth} onChange={e => handleParamChange('tabWidth', e.target.value)} unit={unit} />
                    <Input label='Height' value={params.tabHeight} onChange={e => handleParamChange('tabHeight', e.target.value)} unit={unit} />
                </div>
            )}
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
            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default ProfileGenerator;