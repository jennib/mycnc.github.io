import React from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />
            <RadioGroup options={[{ value: 'rect', label: t('generators.profile.rectangle') }, { value: 'circ', label: t('generators.profile.circle') }]} selected={params.shape} onChange={val => handleParamChange('shape', val)} />
            {params.shape === 'rect' ? <>
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.profile.width')} value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                    <Input label={t('generators.profile.length')} value={params.length} onChange={e => handleParamChange('length', e.target.value)} unit={unit} />
                </div>
                <Input label={t('generators.profile.cornerRadius')} value={params.cornerRadius} onChange={e => handleParamChange('cornerRadius', e.target.value)} unit={unit} />
            </> : <>
                <Input label={t('generators.profile.diameter')} value={params.diameter} onChange={e => handleParamChange('diameter', e.target.value)} unit={unit} />
            </>}
            <hr className='border-secondary' />
            <RadioGroup label={t('generators.profile.cutSide')} options={[{ value: 'outside', label: t('generators.profile.outside') }, { value: 'inside', label: t('generators.profile.inside') }, { value: 'online', label: t('generators.profile.online') }]} selected={params.cutSide} onChange={val => handleParamChange('cutSide', val)} />
            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.profile.totalDepth')} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help={t('generators.profile.shouldBeNegative')} />
                <Input label={t('generators.profile.depthPerPass')} value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
            </div>
            <hr className='border-secondary' />
            <Checkbox label={t('generators.profile.enableTabs')} checked={params.tabsEnabled} onChange={(checked) => handleParamChange('tabsEnabled', checked)} />
            {params.tabsEnabled && (
                <div className='grid grid-cols-3 gap-4 pl-4 mt-2 border-l-2 border-secondary'>
                    <Input label={t('generators.profile.numTabs')} value={params.numTabs} onChange={e => handleParamChange('numTabs', e.target.value)} />
                    <Input label={t('generators.profile.tabWidth')} value={params.tabWidth} onChange={e => handleParamChange('tabWidth', e.target.value)} unit={unit} />
                    <Input label={t('generators.profile.tabHeight')} value={params.tabHeight} onChange={e => handleParamChange('tabHeight', e.target.value)} unit={unit} />
                </div>
            )}
            <hr className='border-secondary' />
            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default ProfileGenerator;