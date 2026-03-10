import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface DrawerGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const DrawerGenerator: React.FC<DrawerGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const { t } = useTranslation();
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4 text-sm'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.drawer.width')} value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                <Input label={t('generators.drawer.height')} value={params.height} onChange={e => handleParamChange('height', e.target.value)} unit={unit} />
                <Input label={t('generators.drawer.depth')} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} />
                <Input label={t('generators.drawer.woodThickness')} value={params.woodThickness} onChange={e => handleParamChange('woodThickness', e.target.value)} unit={unit} />
            </div>

            <RadioGroup
                label={t('generators.drawer.joineryType')}
                options={[
                    { value: 'finger', label: t('generators.drawer.fingerJoint') },
                    { value: 'butt', label: t('generators.drawer.buttJoint') }
                ]}
                selected={params.joineryType}
                onChange={val => handleParamChange('joineryType', val)}
            />

            {params.joineryType === 'finger' && (
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.drawer.fingerWidth')} value={params.fingerWidth} onChange={e => handleParamChange('fingerWidth', e.target.value)} unit={unit} />
                    <Input label={t('generators.drawer.tolerance')} value={params.tolerance} onChange={e => handleParamChange('tolerance', e.target.value)} unit={unit} />
                </div>
            )}

            {params.joineryType === 'finger' && (
                <RadioGroup
                    label={t('generators.drawer.cornerClearance')}
                    options={[
                        { value: 'none', label: t('generators.drawer.none') },
                        { value: 'dogbone', label: t('generators.drawer.dogbone') },
                        { value: 'finger_cutout', label: t('generators.drawer.fingerCutout') },
                        { value: 't_bone', label: t('generators.drawer.tBone') }
                    ]}
                    selected={params.cornerClearance || 'dogbone'}
                    onChange={val => handleParamChange('cornerClearance', val)}
                />
            )}

            <hr className='border-secondary' />

            <RadioGroup
                label={t('generators.drawer.bottomJointType')}
                options={[
                    { value: 'flat', label: t('generators.drawer.flat') },
                    { value: 'groove', label: t('generators.drawer.groove') },
                    { value: 'rabbet', label: t('generators.drawer.rabbet') }
                ]}
                selected={params.bottomType || 'flat'}
                onChange={val => handleParamChange('bottomType', val)}
            />

            {params.bottomType && params.bottomType !== 'flat' && (
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.drawer.bottomWoodThickness')} value={params.bottomWoodThickness} onChange={e => handleParamChange('bottomWoodThickness', e.target.value)} unit={unit} />
                    <Input label={t('generators.drawer.channelDepth')} value={params.bottomChannelDepth} onChange={e => handleParamChange('bottomChannelDepth', e.target.value)} unit={unit} />
                    {params.bottomType === 'groove' && (
                        <Input label={t('generators.drawer.zClearance')} value={params.bottomZClearance} onChange={e => handleParamChange('bottomZClearance', e.target.value)} unit={unit} />
                    )}
                </div>
            )}

            <RadioGroup
                label={t('generators.drawer.partToGenerate')}
                options={[
                    { value: 'all', label: t('generators.drawer.all') },
                    { value: 'front', label: t('generators.drawer.front') },
                    { value: 'back', label: t('generators.drawer.back') },
                    { value: 'left', label: t('generators.drawer.left') },
                    { value: 'right', label: t('generators.drawer.right') },
                    { value: 'bottom', label: t('generators.drawer.bottom') }
                ]}
                selected={params.partToGenerate}
                onChange={val => handleParamChange('partToGenerate', val)}
            />

            <hr className='border-secondary' />

            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.drawer.depthPerPass')} value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
                <Input label={t('generators.drawer.plungeFeed')} value={params.plungeFeed} onChange={e => handleParamChange('plungeFeed', e.target.value)} unit={`${unit}/min`} />
            </div>

            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default DrawerGenerator;
