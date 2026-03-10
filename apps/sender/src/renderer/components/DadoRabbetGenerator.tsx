import React from 'react';
import { useTranslation } from 'react-i18next';
import { DadoRabbetParams, Tool, MachineSettings } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface DadoRabbetGeneratorProps {
    params: DadoRabbetParams;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const DadoRabbetGenerator: React.FC<DadoRabbetGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
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

            <div className='grid grid-cols-2 gap-4'>
                <RadioGroup
                    label={t('generators.dadoRabbet.orientation')}
                    options={[
                        { value: 'horizontal', label: t('generators.dadoRabbet.horizontal') },
                        { value: 'vertical', label: t('generators.dadoRabbet.vertical') }
                    ]}
                    selected={params.orientation}
                    onChange={val => handleParamChange('orientation', val)}
                />
                <RadioGroup
                    label={t('generators.dadoRabbet.type')}
                    options={[
                        { value: 'dado', label: t('generators.dadoRabbet.dado') },
                        { value: 'rabbet', label: t('generators.dadoRabbet.rabbet') }
                    ]}
                    selected={params.type}
                    onChange={val => handleParamChange('type', val)}
                />
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <Input 
                    label={t('generators.dadoRabbet.width')} 
                    value={params.width} 
                    onChange={e => handleParamChange('width', e.target.value)} 
                    unit={unit} 
                />
                <Input 
                    label={t('generators.dadoRabbet.length')} 
                    value={params.length} 
                    onChange={e => handleParamChange('length', e.target.value)} 
                    unit={unit} 
                />
                <Input 
                    label={t('generators.dadoRabbet.depth')} 
                    value={params.depth} 
                    onChange={e => handleParamChange('depth', e.target.value)} 
                    unit={unit} 
                />
                <div className="grid grid-cols-2 gap-2">
                    <Input 
                        label={t('generators.dadoRabbet.offsetX')} 
                        value={params.offsetX} 
                        onChange={e => handleParamChange('offsetX', e.target.value)} 
                        unit={unit} 
                    />
                    <Input 
                        label={t('generators.dadoRabbet.offsetY')} 
                        value={params.offsetY} 
                        onChange={e => handleParamChange('offsetY', e.target.value)} 
                        unit={unit} 
                    />
                </div>
            </div>

            <hr className='border-secondary' />

            <div className='grid grid-cols-2 gap-4'>
                <Input 
                    label={t('generators.mortiseTenon.depthPerPass')} 
                    value={params.depthPerPass} 
                    onChange={e => handleParamChange('depthPerPass', e.target.value)} 
                    unit={unit} 
                />
                <Input 
                    label={t('generators.drawer.plungeFeed')} 
                    value={params.plungeFeed} 
                    onChange={e => handleParamChange('plungeFeed', e.target.value)} 
                    unit={`${unit}/min`} 
                />
            </div>

            <SpindleAndFeedControls 
                params={params} 
                onParamChange={handleParamChange} 
                unit={unit} 
            />
        </div>
    );
};

export default DadoRabbetGenerator;
