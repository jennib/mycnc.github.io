import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool, MachineSettings, BoreParams } from '@/types';
import { ToolSelector, Input, Checkbox, SpindleAndFeedControls } from './SharedControls';

interface BoreGeneratorProps {
    params: BoreParams;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    selectedToolId: number | null;
    onToolSelect: (id: number | null) => void;
}

const BoreGenerator: React.FC<BoreGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
    const { t } = useTranslation();
    const handleParamChange = (field: string, value: any) => {
        onParamsChange(field, value);
    };

    return (
        <div className="space-y-4">
            <ToolSelector selectedId={params.toolId} onChange={(id) => handleParamChange('toolId', id)} unit={unit} toolLibrary={toolLibrary} />
            <hr className="border-secondary" />
            <div className="grid grid-cols-2 gap-4">
                <Input label={t('generators.bore.centerX')} value={params.centerX} onChange={e => handleParamChange('centerX', e.target.value)} unit={unit} />
                <Input label={t('generators.bore.centerY')} value={params.centerY} onChange={e => handleParamChange('centerY', e.target.value)} unit={unit} />
                <Input label={t('generators.bore.holeDiameter')} value={params.holeDiameter} onChange={e => handleParamChange('holeDiameter', e.target.value)} unit={unit} />
                <Input label={t('generators.bore.holeDepth')} value={params.holeDepth} onChange={e => handleParamChange('holeDepth', e.target.value)} unit={unit} help={t('generators.surfacing.shouldBeNegative')} />
            </div>

            <div className="border-t border-secondary pt-4">
                <Checkbox label={t('generators.bore.enableCounterbore')} checked={params.counterboreEnabled} onChange={v => handleParamChange('counterboreEnabled', v)} />
                {params.counterboreEnabled && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary/30">
                        <Input label={t('generators.bore.cbDiameter')} value={params.cbDiameter} onChange={e => handleParamChange('cbDiameter', e.target.value)} unit={unit} />
                        <Input label={t('generators.bore.cbDepth')} value={params.cbDepth} onChange={e => handleParamChange('cbDepth', e.target.value)} unit={unit} />
                    </div>
                )}
            </div>

            <hr className="border-secondary" />
            <div className="grid grid-cols-2 gap-4">
                <Input label={t('generators.bore.depthPerPass')} value={params.depthPerPass} onChange={e => handleParamChange('depthPerPass', e.target.value)} unit={unit} />
                <Input label={t('generators.bore.stepover')} value={params.stepover} onChange={e => handleParamChange('stepover', e.target.value)} unit="%" />
            </div>
            <SpindleAndFeedControls params={params} onParamChange={handleParamChange} unit={unit} plunge />
        </div>
    );
};

export default BoreGenerator;