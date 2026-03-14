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
                label={t('generators.mortiseTenon.partToGenerate')}
                options={[
                    { value: 'mortise', label: t('generators.mortiseTenon.mortise') },
                    { value: 'tenon', label: t('generators.mortiseTenon.tenon') },
                    { value: 'both', label: t('generators.mortiseTenon.both') }
                ]}
                selected={params.partToGenerate}
                onChange={val => handleParamChange('partToGenerate', val)}
            />

            <RadioGroup
                label={t('generators.mortiseTenon.jointType')}
                options={[
                    { value: 'standard', label: t('generators.mortiseTenon.standard') },
                    { value: 'tbone', label: t('generators.mortiseTenon.tbone') },
                    { value: 'dogbone', label: t('generators.mortiseTenon.dogbone') }
                ]}
                selected={params.jointType}
                onChange={val => handleParamChange('jointType', val)}
            />

            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.mortiseTenon.width')} value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                <Input label={t('generators.mortiseTenon.length')} value={params.height} onChange={e => handleParamChange('height', e.target.value)} unit={unit} />
                <Input label={t('generators.mortiseTenon.depth')} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} />
                <Input label={t('generators.mortiseTenon.tolerance')} value={params.tolerance} onChange={e => handleParamChange('tolerance', e.target.value)} unit={unit} />
            </div>

            <hr className='border-secondary' />
            <SpindleAndFeedControls
                params={params}
                unit={unit}
                onParamChange={handleParamChange}
                plunge
            />
        </div>
    );
};

export default MortiseTenonGenerator;
