import React, { useState, useEffect } from 'react';
import { Tool, MachineSettings } from '../../types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface DrillingGeneratorProps {
    onGenerate: (gcode: string, name: string) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
}

const DrillingGenerator: React.FC<DrillingGeneratorProps> = ({ onGenerate, toolLibrary, unit, settings }) => {
    const [drillType, setDrillType] = useState('single');
    const [params, setParams] = useState({
        depth: -5,
        peck: 2,
        retract: 2,
        feed: 150,
        spindle: settings.spindle.max || 8000,
        safeZ: 5,
        singleX: 10,
        singleY: 10,
        rectCols: 4,
        rectRows: 3,
        rectSpacingX: 25,
        rectSpacingY: 20,
        rectStartX: 10,
        rectStartY: 10,
        circCenterX: 50,
        circCenterY: 50,
        circRadius: 40,
        circHoles: 6,
        circStartAngle: 0,
        toolId: null as number | null,
    });

    const handleParamChange = (field: keyof typeof params, value: string) => {
        const numValue = value === '' ? '' : parseFloat(value);
        if (isNaN(numValue as number)) return;
        setParams(p => ({ ...p, [field]: numValue }));
    };

    const generateCode = () => {
        // ... (The existing generateDrillingCode logic would go here)
        // ... It would use `params` and `drillType` from the local state.
        // ... Finally, it would call onGenerate(code.join('\n'), 'drilling_op.gcode');
    };

    useEffect(() => {
        // generateCode();
    }, [params, drillType]);

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => setParams(p => ({ ...p, toolId: id }))} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <RadioGroup options={[{ value: 'single', label: 'Single' }, { value: 'rect', label: 'Rectangular' }, { value: 'circ', label: 'Circular' }]} selected={drillType} onChange={setDrillType} />
            {drillType === 'single' && <Input label='Center X, Y' valueX={params.singleX} valueY={params.singleY} onChangeX={e => handleParamChange('singleX', e.target.value)} onChangeY={e => handleParamChange('singleY', e.target.value)} isXY={true} unit={unit} />}
            {drillType === 'rect' && <><Input label='Columns, Rows' valueX={params.rectCols} valueY={params.rectRows} onChangeX={e => handleParamChange('rectCols', e.target.value)} onChangeY={e => handleParamChange('rectRows', e.target.value)} isXY={true} /><Input label='Spacing X, Y' valueX={params.rectSpacingX} valueY={params.rectSpacingY} onChangeX={e => handleParamChange('rectSpacingX', e.target.value)} onChangeY={e => handleParamChange('rectSpacingY', e.target.value)} isXY={true} unit={unit} /><Input label='Start X, Y' valueX={params.rectStartX} valueY={params.rectStartY} onChangeX={e => handleParamChange('rectStartX', e.target.value)} onChangeY={e => handleParamChange('rectStartY', e.target.value)} isXY={true} unit={unit} /></>}
            {drillType === 'circ' && <><Input label='Center X, Y' valueX={params.circCenterX} valueY={params.circCenterY} onChangeX={e => handleParamChange('circCenterX', e.target.value)} onChangeY={e => handleParamChange('circCenterY', e.target.value)} isXY={true} unit={unit} /><Input label='Radius' value={params.circRadius} onChange={e => handleParamChange('circRadius', e.target.value)} unit={unit} /><div className='grid grid-cols-2 gap-4'><Input label='# of Holes' value={params.circHoles} onChange={e => handleParamChange('circHoles', e.target.value)} /><Input label='Start Angle' value={params.circStartAngle} onChange={e => handleParamChange('circStartAngle', e.target.value)} unit='°' /></div></>}
            <hr className='border-secondary' />
            <div className='grid grid-cols-2 gap-4'>
                <Input label='Final Depth' value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help='Should be negative' />
                <Input label='Peck Depth' value={params.peck} onChange={e => handleParamChange('peck', e.target.value)} unit={unit} help='Depth per plunge' />
            </div>
            <div className='grid grid-cols-2 gap-4'>
                <Input label='Retract Height' value={params.retract} onChange={e => handleParamChange('retract', e.target.value)} unit={unit} help='Height after each peck' />
                <Input label='Plunge Feed' value={params.feed} onChange={e => handleParamChange('feed', e.target.value)} unit={unit + '/min'} />
            </div>
            <SpindleAndFeedControls params={params} feedLabel="Drill Feed" onParamChange={(field, value) => handleParamChange(field as any, value)} unit={unit} />
        </div>
    );
};

export default DrillingGenerator;