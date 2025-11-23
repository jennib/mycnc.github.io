import React from 'react';
import { Tool, MachineSettings } from '../types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface TextGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    fontOptions: string[];
}

const TextGenerator: React.FC<TextGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings, fontOptions }) => {
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Text</label>
                <textarea
                    value={params.text}
                    onChange={e => handleParamChange('text', e.target.value)}
                    className="w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Font</label>
                <select value={params.font} onChange={e => handleParamChange('font', e.target.value)} className="w-full bg-background border-secondary rounded-md py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <Input label='Height' value={params.height} onChange={e => handleParamChange('height', e.target.value)} unit={unit} />
                <Input label='Character Spacing' value={params.spacing} onChange={e => handleParamChange('spacing', e.target.value)} unit={unit} />
                <Input label='Start X' value={params.startX} onChange={e => handleParamChange('startX', e.target.value)} unit={unit} />
                <Input label='Start Y' value={params.startY} onChange={e => handleParamChange('startY', e.target.value)} unit={unit} />
            </div>
            <RadioGroup label='Alignment' options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} selected={params.alignment} onChange={val => handleParamChange('alignment', val)} />
            <Input label='Engraving Depth' value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help="Should be negative" />
            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default TextGenerator;