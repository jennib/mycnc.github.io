import React from 'react';
import { Tool, MachineSettings } from '../types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface DrillingGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
}

const DrillingGenerator: React.FC<DrillingGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {

    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    const handleTypeChange = (newType: string) => {
        onParamsChange('drillType', newType);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />

            <RadioGroup
                selected={params.drillType}
                onChange={handleTypeChange}
                options={[
                    { value: 'single', label: 'Single Hole' },
                    { value: 'rect', label: 'Rectangular Pattern' },
                    { value: 'circ', label: 'Circular Pattern' },
                ]}
            />

            {params.drillType === 'single' && (
                <div className='grid grid-cols-2 gap-4'>
                    <Input label='X Coordinate' value={params.singleX} onChange={e => handleParamChange('singleX', e.target.value)} unit={unit} />
                    <Input label='Y Coordinate' value={params.singleY} onChange={e => handleParamChange('singleY', e.target.value)} unit={unit} />
                </div>
            )}

            {params.drillType === 'rect' && (
                <div className='grid grid-cols-2 gap-4'>
                    <Input label='Start X' value={params.rectStartX} onChange={e => handleParamChange('rectStartX', e.target.value)} unit={unit} />
                    <Input label='Start Y' value={params.rectStartY} onChange={e => handleParamChange('rectStartY', e.target.value)} unit={unit} />
                    <Input label='Columns' value={params.rectCols} onChange={e => handleParamChange('rectCols', e.target.value)} />
                    <Input label='Rows' value={params.rectRows} onChange={e => handleParamChange('rectRows', e.target.value)} />
                    <Input label='Spacing (X)' value={params.rectSpacingX} onChange={e => handleParamChange('rectSpacingX', e.target.value)} unit={unit} />
                    <Input label='Spacing (Y)' value={params.rectSpacingY} onChange={e => handleParamChange('rectSpacingY', e.target.value)} unit={unit} />
                </div>
            )}

            {params.drillType === 'circ' && (
                <div className='grid grid-cols-2 gap-4'>
                    <Input label='Center X' value={params.circCenterX} onChange={e => handleParamChange('circCenterX', e.target.value)} unit={unit} />
                    <Input label='Center Y' value={params.circCenterY} onChange={e => handleParamChange('circCenterY', e.target.value)} unit={unit} />
                    <Input label='Radius' value={params.circRadius} onChange={e => handleParamChange('circRadius', e.target.value)} unit={unit} />
                    <Input label='Number of Holes' value={params.circHoles} onChange={e => handleParamChange('circHoles', e.target.value)} />
                    <Input label='Start Angle' value={params.circStartAngle} onChange={e => handleParamChange('circStartAngle', e.target.value)} unit='°' />
                </div>
            )}

            <hr className='border-secondary' />

            <div className='grid grid-cols-2 gap-4'>
                <Input label='Final Depth' value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help='Should be negative' />
                <Input label='Peck Depth' value={params.peck} onChange={e => handleParamChange('peck', e.target.value)} unit={unit} help='Incremental depth per peck' />
                <Input label='Retract Height' value={params.retract} onChange={e => handleParamChange('retract', e.target.value)} unit={unit} help='Height to retract to between pecks' />
            </div>

            <SpindleAndFeedControls params={params} onParamChange={(field, value) => handleParamChange(field, value)} unit={unit} />
        </div>
    );
};

export default DrillingGenerator;