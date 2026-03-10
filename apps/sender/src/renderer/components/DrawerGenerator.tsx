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
                <Input label={'Drawer Width (W)'} value={params.width} onChange={e => handleParamChange('width', e.target.value)} unit={unit} />
                <Input label={'Drawer Height (H)'} value={params.height} onChange={e => handleParamChange('height', e.target.value)} unit={unit} />
                <Input label={'Drawer Depth (D)'} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} />
                <Input label={'Wood Thickness'} value={params.woodThickness} onChange={e => handleParamChange('woodThickness', e.target.value)} unit={unit} />
            </div>

            <RadioGroup
                label={'Joinery Type'}
                options={[
                    { value: 'finger', label: 'Finger Joint' },
                    { value: 'butt', label: 'Butt Joint' }
                ]}
                selected={params.joineryType}
                onChange={val => handleParamChange('joineryType', val)}
            />

            {params.joineryType === 'finger' && (
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={'Finger Width'} value={params.fingerWidth} onChange={e => handleParamChange('fingerWidth', e.target.value)} unit={unit} />
                    <Input label={'Joint Tolerance'} value={params.tolerance} onChange={e => handleParamChange('tolerance', e.target.value)} unit={unit} />
                </div>
            )}

            {params.joineryType === 'finger' && (
                <RadioGroup
                    label={'Corner Clearance'}
                    options={[
                        { value: 'none', label: 'None (Leaves Round Fillets)' },
                        { value: 'dogbone', label: 'Dogbone (Clears Corners)' },
                        { value: 'finger_cutout', label: 'Finger Cutout (Stepped Tip)' },
                        { value: 't_bone', label: 'T-Bone (Clears Corners Sideways)' }
                    ]}
                    selected={params.cornerClearance || 'dogbone'}
                    onChange={val => handleParamChange('cornerClearance', val)}
                />
            )}

            <hr className='border-secondary' />

            <RadioGroup
                label={'Bottom Joint Type'}
                options={[
                    { value: 'flat', label: 'Flat (No Groove)' },
                    { value: 'groove', label: 'Groove' },
                    { value: 'rabbet', label: 'Rabbet' }
                ]}
                selected={params.bottomType || 'flat'}
                onChange={val => handleParamChange('bottomType', val)}
            />

            {params.bottomType && params.bottomType !== 'flat' && (
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={'Bottom Wood Thickness (Y)'} value={params.bottomWoodThickness} onChange={e => handleParamChange('bottomWoodThickness', e.target.value)} unit={unit} />
                    <Input label={'Channel Depth (Z)'} value={params.bottomChannelDepth} onChange={e => handleParamChange('bottomChannelDepth', e.target.value)} unit={unit} />
                    {params.bottomType === 'groove' && (
                        <Input label={'Z Clearance (Offset from bottom)'} value={params.bottomZClearance} onChange={e => handleParamChange('bottomZClearance', e.target.value)} unit={unit} />
                    )}
                </div>
            )}

            <RadioGroup
                label={'Part to Generate'}
                options={[
                    { value: 'all', label: 'All Parts' },
                    { value: 'front', label: 'Front' },
                    { value: 'back', label: 'Back' },
                    { value: 'left', label: 'Left Side' },
                    { value: 'right', label: 'Right Side' },
                    { value: 'bottom', label: 'Bottom' }
                ]}
                selected={params.partToGenerate}
                onChange={val => handleParamChange('partToGenerate', val)}
            />

            <hr className='border-secondary' />

            <div className='grid grid-cols-2 gap-4'>
                <Input label={'Depth Per Pass'} value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
                <Input label={'Plunge Feed'} value={params.plungeFeed} onChange={e => handleParamChange('plungeFeed', e.target.value)} unit={`${unit}/min`} />
            </div>

            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default DrawerGenerator;
