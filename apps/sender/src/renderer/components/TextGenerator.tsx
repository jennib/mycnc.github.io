import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings, TextParams } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface TextGeneratorProps {
    params: any;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    fontOptions: string[];
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const TextGenerator: React.FC<TextGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings, fontOptions }) => {
    const { t } = useTranslation();
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{t('generators.text.text')}</label>
                <textarea
                    value={params.text}
                    onChange={e => handleParamChange('text', e.target.value)}
                    className="w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{t('generators.text.font')}</label>
                <select value={params.font} onChange={e => handleParamChange('font', e.target.value)} className="w-full bg-background border-secondary rounded-md py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.text.height')} value={params.height} onChange={e => handleParamChange('height', e.target.value)} unit={unit} />
                <Input label={t('generators.text.spacing')} value={params.spacing} onChange={e => handleParamChange('spacing', e.target.value)} unit={unit} />
                <Input label={t('generators.text.startX')} value={params.startX} onChange={e => handleParamChange('startX', e.target.value)} unit={unit} />
                <Input label={t('generators.text.startY')} value={params.startY} onChange={e => handleParamChange('startY', e.target.value)} unit={unit} />
            </div>
            <RadioGroup label={t('generators.text.alignment')} options={[{ value: 'left', label: t('generators.text.left') }, { value: 'center', label: t('generators.text.center') }, { value: 'right', label: t('generators.text.right') }]} selected={params.alignment} onChange={val => handleParamChange('alignment', val)} />
            <Input label={t('generators.text.engravingDepth')} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help={t('generators.text.shouldBeNegative')} />
            <hr className='border-secondary' />
            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} />
        </div>
    );
};

export default TextGenerator;