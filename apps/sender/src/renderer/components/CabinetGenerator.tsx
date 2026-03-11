import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings, CabinetParams } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls, Checkbox } from './SharedControls';

interface CabinetGeneratorProps {
    params: CabinetParams;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const CabinetGenerator: React.FC<CabinetGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const { t } = useTranslation();
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4 text-sm'>
            <ToolSelector 
                selectedId={params.toolId} 
                onChange={(id) => handleParamChange('toolId', id)} 
                unit={unit} 
                toolLibrary={toolLibrary} 
            />
            <hr className='border-secondary' />
            
            <div className='grid grid-cols-2 gap-x-4'>
                <Input label={t('generators.cabinet.width')} value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                <Input label={t('generators.cabinet.height')} value={params.height} onChange={e => handleParamChange('height', e.target.value)} unit={unit} />
                <Input label={t('generators.cabinet.depth')} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} />
                <Input label={t('generators.cabinet.woodThickness')} value={params.woodThickness} onChange={e => handleParamChange('woodThickness', e.target.value)} unit={unit} />
            </div>

            <div className='p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2 mt-2'>
                <Checkbox 
                    label={t('generators.cabinet.hasToeKick')} 
                    checked={params.hasToeKick} 
                    onChange={val => handleParamChange('hasToeKick', val)} 
                />
                
                {params.hasToeKick && (
                    <div className='grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300'>
                        <Input label={t('generators.cabinet.toeKickHeight')} value={params.toeKickHeight} onChange={e => handleParamChange('toeKickHeight', e.target.value)} unit={unit} />
                        <Input label={t('generators.cabinet.toeKickDepth')} value={params.toeKickDepth} onChange={e => handleParamChange('toeKickDepth', e.target.value)} unit={unit} />
                    </div>
                )}
            </div>

            <RadioGroup
                label={t('generators.cabinet.configuration')}
                options={[
                    { value: 'shelves', label: t('generators.cabinet.shelves') },
                    { value: 'drawers', label: t('generators.cabinet.drawers') },
                    { value: 'doors', label: t('generators.cabinet.doors') },
                    { value: 'appliance', label: t('generators.cabinet.appliance') },
                    { value: 'empty', label: t('generators.cabinet.empty') }
                ]}
                selected={params.configuration}
                onChange={val => handleParamChange('configuration', val)}
            />

            {['shelves', 'doors', 'appliance'].includes(params.configuration) && (
                <div className='grid grid-cols-2 gap-4 p-4 bg-secondary/5 rounded-xl border border-secondary/10 animate-in fade-in slide-in-from-top-2'>
                    <Input label={t('generators.cabinet.numShelves')} value={params.numShelves} onChange={e => handleParamChange('numShelves', e.target.value)} />
                    <Input label={t('generators.cabinet.shelfThickness')} value={params.shelfThickness} onChange={e => handleParamChange('shelfThickness', e.target.value)} unit={unit} />
                </div>
            )}

            {params.configuration === 'drawers' && (
                <div className='grid grid-cols-2 gap-4 p-4 bg-secondary/5 rounded-xl border border-secondary/10 animate-in fade-in slide-in-from-top-2'>
                    <Input label={t('generators.cabinet.numDrawers')} value={params.numDrawers} onChange={e => handleParamChange('numDrawers', e.target.value)} />
                </div>
            )}

            <RadioGroup
                label={t('generators.cabinet.joineryType')}
                options={[
                    { value: 'butt', label: t('generators.cabinet.buttJoint') },
                    { value: 'pocket', label: t('generators.cabinet.pocketHole') },
                    { value: 'joinery', label: t('generators.cabinet.woodJoinery') }
                ]}
                selected={params.joineryType}
                onChange={val => handleParamChange('joineryType', val)}
            />

            {params.joineryType === 'joinery' && (
                <div className='grid grid-cols-2 gap-4 pb-2'>
                    <Input 
                        label={t('generators.drawer.fingerWidth')} 
                        value={params.fingerWidth || 50} 
                        onChange={e => handleParamChange('fingerWidth', e.target.value)} 
                        unit={unit} 
                    />
                    <Input 
                        label={t('generators.drawer.tolerance')} 
                        value={params.tolerance || 0} 
                        onChange={e => handleParamChange('tolerance', e.target.value)} 
                        unit={unit} 
                    />
                </div>
            )}

            {params.joineryType !== 'butt' && (
                <RadioGroup
                    label={t('generators.drawer.cornerClearance')}
                    options={[
                        { value: 'none', label: t('generators.drawer.none') },
                        { value: 'dogbone', label: t('generators.drawer.dogbone') },
                        { value: 't_bone', label: t('generators.drawer.tBone') },
                        { value: 'finger_cutout', label: t('generators.drawer.fingerCutout') }
                    ]}
                    selected={params.cornerClearance || 'none'}
                    onChange={val => handleParamChange('cornerClearance', val)}
                />
            )}

            <hr className='border-secondary' />

            <RadioGroup
                label={t('generators.cabinet.partToGenerate')}
                options={[
                    { value: 'all', label: t('generators.cabinet.all') },
                    { value: 'sides', label: t('generators.cabinet.sides') },
                    { value: 'bottom', label: t('generators.cabinet.bottom') },
                    { value: 'top', label: t('generators.cabinet.top') },
                    { value: 'back', label: t('generators.cabinet.back') },
                    { value: 'shelves', label: t('generators.cabinet.shelvesLabel') },
                    { value: 'doors', label: t('generators.cabinet.doorsLabel') },
                    { value: 'drawers', label: t('generators.cabinet.drawerFrontsLabel') }
                ]}
                selected={params.partToGenerate}
                onChange={val => handleParamChange('partToGenerate', val)}
            />

            <hr className='border-secondary' />

            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.cabinet.depthPerPass')} value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
                <Input label={t('generators.cabinet.plungeFeed')} value={params.plungeFeed} onChange={e => handleParamChange('plungeFeed', e.target.value)} unit={`${unit}/min`} />
            </div>

            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default CabinetGenerator;
