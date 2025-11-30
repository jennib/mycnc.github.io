import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings, DrillingParams } from '@/types';
import { ToolSelector, Input, RadioGroup, SpindleAndFeedControls } from './SharedControls';

interface DrillingGeneratorProps {
    params: DrillingParams;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const DrillingGenerator: React.FC<DrillingGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings, selectedToolId, onToolSelect }) => {
    const { t } = useTranslation();
    useEffect(() => {
        console.log('DrillingGenerator params.drillType changed:', params.drillType);
    }, [params.drillType]);

    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    const handleTypeChange = (newType: string) => {
        onParamsChange('drillType', newType);
    };

    return (
        <div className='space-y-4'>
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className='border-secondary' />

            <RadioGroup
                selected={params.drillType}
                onChange={handleTypeChange}
                options={[
                    { value: 'single', label: t('generators.drilling.singleHole') },
                    { value: 'rect', label: t('generators.drilling.rectPattern') },
                    { value: 'circ', label: t('generators.drilling.circPattern') },
                ]}
            />

            <hr className='border-secondary' />

            {params.drillType === 'single' && (
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.drilling.xCoord')} value={params.singleX} onChange={e => handleParamChange('singleX', e.target.value)} unit={unit} />
                    <Input label={t('generators.drilling.yCoord')} value={params.singleY} onChange={e => handleParamChange('singleY', e.target.value)} unit={unit} />
                </div>
            )}

            {params.drillType === 'rect' && (
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.drilling.startX')} value={params.rectStartX} onChange={e => handleParamChange('rectStartX', e.target.value)} unit={unit} />
                    <Input label={t('generators.drilling.startY')} value={params.rectStartY} onChange={e => handleParamChange('rectStartY', e.target.value)} unit={unit} />
                    <Input label={t('generators.drilling.columns')} value={params.rectCols} onChange={e => handleParamChange('rectCols', e.target.value)} />
                    <Input label={t('generators.drilling.rows')} value={params.rectRows} onChange={e => handleParamChange('rectRows', e.target.value)} />
                    <Input label={t('generators.drilling.spacingX')} value={params.rectSpacingX} onChange={e => handleParamChange('rectSpacingX', e.target.value)} unit={unit} />
                    <Input label={t('generators.drilling.spacingY')} value={params.rectSpacingY} onChange={e => handleParamChange('rectSpacingY', e.target.value)} unit={unit} />
                </div>
            )}

            {params.drillType === 'circ' && (
                <div className='grid grid-cols-2 gap-4'>
                    <Input label={t('generators.drilling.centerX')} value={params.circCenterX} onChange={e => handleParamChange('circCenterX', e.target.value)} unit={unit} />
                    <Input label={t('generators.drilling.centerY')} value={params.circCenterY} onChange={e => handleParamChange('circCenterY', e.target.value)} unit={unit} />
                    <Input label={t('generators.drilling.radius')} value={params.circRadius} onChange={e => handleParamChange('circRadius', e.target.value)} unit={unit} />
                    <Input label={t('generators.drilling.numHoles')} value={params.circHoles} onChange={e => handleParamChange('circHoles', e.target.value)} />
                    <Input label={t('generators.drilling.startAngle')} value={params.circStartAngle} onChange={e => handleParamChange('circStartAngle', e.target.value)} unit='°' />
                </div>
            )}

            <hr className='border-secondary' />

            <div className='grid grid-cols-2 gap-4'>
                <Input label={t('generators.drilling.finalDepth')} value={params.depth} onChange={e => handleParamChange('depth', e.target.value)} unit={unit} help={t('generators.drilling.shouldBeNegative')} />
                <Input label={t('generators.drilling.peckDepth')} value={params.peck} onChange={e => handleParamChange('peck', e.target.value)} unit={unit} help={t('generators.drilling.peckHelp')} />
                <Input label={t('generators.drilling.retractHeight')} value={params.retract} onChange={e => handleParamChange('retract', e.target.value)} unit={unit} help={t('generators.drilling.retractHelp')} />
            </div>

            <SpindleAndFeedControls params={params} onParamChange={(field, value) => handleParamChange(field, value)} unit={unit} />
        </div>
    );
};

export default DrillingGenerator;