
 
   import React from 'react';
import { Tool, MachineSettings } from '../types';
import { ToolSelector, Input, Checkbox, SpindleAndFeedControls } from './SharedControls';

interface BoreGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
}

const BoreGenerator: React.FC<BoreGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {

    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />

            <div className='grid grid-cols-2 gap-4'>
                <Input label='Center X' value={params.centerX} onChange={e => handleParamChange('centerX', e.target.value)} unit={unit} />
                <Input label='Center Y' value={params.centerY} onChange={e => handleParamChange('centerY', e.target.value)} unit={unit} />
                <Input label='Hole Diameter' value={params.holeDiameter} onChange={e => handleParamChange('holeDiameter', e.target.value)} unit={unit} />
                <Input label='Hole Depth' value={params.holeDepth} onChange={e => handleParamChange('holeDepth', e.target.value)} unit={unit} help="Should be negative" />
            </div>

            <hr className='border-secondary' />

            <Checkbox label="Enable Counterbore" checked={params.counterboreEnabled} onChange={(checked) => handleParamChange('counterboreEnabled', checked)} />
            
            {params.counterboreEnabled && (
                 <div className='grid grid-cols-2 gap-4 pl-4 mt-2 border-l-2 border-secondary'>
                    <Input label='CB Diameter' value={params.cbDiameter} onChange={e => handleParamChange('cbDiameter', e.target.value)} unit={unit} />
                    <Input label='CB Depth' value={params.cbDepth} onChange={e => handleParamChange('cbDepth', e.target.value)} unit={unit} help="Should be negative" />
                </div>
            )}

            <hr className='border-secondary' />
            
            <Input label='Depth per Pass' value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
            
            <SpindleAndFeedControls 
                params={params} 
                onParamChange={handleParamChange} 
                unit={unit}
                includePlungeFeed={true} 
            />
        </div>
    );
};

export default BoreGenerator;