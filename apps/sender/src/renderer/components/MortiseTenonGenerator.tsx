import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface MortiseTenonGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const MortiseTenonGenerator: React.FC<MortiseTenonGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const { t } = useTranslation();
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4 text-sm'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />

            <RadioGroup
                label={'Part to Generate'}
                options={[
                    { value: 'mortise', label: 'Mortise (Slot)' },
                    { value: 'tenon', label: 'Tenon (Tab)' },
                    { value: 'both', label: 'Both' }
                ]}
                selected={params.partToGenerate}
                onChange={val => handleParamChange('partToGenerate', val)}
            />

            <div className='grid grid-cols-2 gap-4'>
                <Input label={'Mortise / Tenon Width'} value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                <Input label={'Mortise / Tenon Length'} value={params.height} onChange={e => handleParamChange('height', e.target.value)} unit={unit} />
                <Input label={'Depth (Tenon Height)'} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} />
                <Input label={'Joint Tolerance'} value={params.tolerance} onChange={e => handleParamChange('tolerance', e.target.value)} unit={unit} />
            </div>

            <hr className='border-secondary' />
            <SpindleAndFeedControls
                params={params}
                settings={settings}
                unit={unit}
                onChange={handleParamChange}
            />
        </div>
    );
};

export default MortiseTenonGenerator;
