import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings } from '@mycnc/shared';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls, Checkbox } from './SharedControls';

interface BoxJointGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
}

const BoxJointGenerator: React.FC<BoxJointGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const { t } = useTranslation();
    if (!params) return <div className="p-4 text-text-secondary">Loading generator settings...</div>;

    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4 text-sm'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.boxjoint.boardLength')} value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                <Input label={t('generators.boxjoint.jointLength')} value={params.length} onChange={e => handleParamChange('length', e.target.value)} unit={unit} />
                <Input label={t('generators.boxjoint.boardThickness')} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} />
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.boxjoint.numberOfFingers')} value={params.numberOfFingers} onChange={e => handleParamChange('numberOfFingers', e.target.value)} />
                <Input label={t('generators.boxjoint.tolerance')} value={params.tolerance} onChange={e => handleParamChange('tolerance', e.target.value)} unit={unit} />
                <Input label={t('generators.boxjoint.fingerStickOut')} value={params.fingerStickOut} onChange={e => handleParamChange('fingerStickOut', e.target.value)} unit={unit} />
            </div>

            <RadioGroup
                label={t('generators.boxjoint.cornerClearance')}
                options={[
                    { value: 'none', label: t('generators.boxjoint.none') },
                    { value: 'dogbone', label: t('generators.boxjoint.dogbone') },
                    { value: 'finger_cutout', label: t('generators.boxjoint.fingerCutout') },
                    { value: 't_bone', label: t('generators.boxjoint.tBone') }
                ]}
                selected={params.cornerClearance || 'dogbone'}
                onChange={val => handleParamChange('cornerClearance', val)}
            />

            <RadioGroup
                label={t('generators.boxjoint.partToGenerate')}
                options={[
                    { value: 'both', label: t('generators.boxjoint.both') },
                    { value: 'A', label: t('generators.boxjoint.boardA') },
                    { value: 'B', label: t('generators.boxjoint.boardB') }
                ]}
                selected={params.partToGenerate}
                onChange={val => handleParamChange('partToGenerate', val)}
            />

            <Checkbox
                label={t('generators.boxjoint.jointOnly')}
                checked={params.jointOnly}
                onChange={val => handleParamChange('jointOnly', val)}
            />

            <hr className='border-secondary' />

            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.boxjoint.depthPerPass')} value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
                <Input label={t('generators.boxjoint.plungeFeed')} value={params.plungeFeed} onChange={e => handleParamChange('plungeFeed', e.target.value)} unit={`${unit}/min`} />
            </div>

            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default BoxJointGenerator;
