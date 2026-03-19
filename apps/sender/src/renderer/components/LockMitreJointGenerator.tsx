import React from 'react';
import { useTranslation } from 'react-i18next';
import { LockMitreParams, Tool } from '@mycnc/shared';
import { Input, RadioGroup, ToolSelector } from './SharedControls';

interface LockMitreJointGeneratorProps {
    params: LockMitreParams;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: string;
    selectedToolId: number | null;
    onToolSelect: (toolId: number | null) => void;
}

const LockMitreJointGenerator: React.FC<LockMitreJointGeneratorProps> = ({
    params,
    onParamsChange,
    toolLibrary,
    unit,
    selectedToolId,
    onToolSelect
}) => {
    const { t } = useTranslation();

    const handleChange = (field: keyof LockMitreParams, value: any) => {
        onParamsChange(field as string, value);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label={t('generators.lockMitre.stockThickness')}
                    value={params.stockThickness}
                    onChange={(e) => handleChange('stockThickness', e.target.value)}
                    unit="mm"
                />
                <Input
                    label={t('generators.lockMitre.length')}
                    value={params.length}
                    onChange={(e) => handleChange('length', e.target.value)}
                    unit="mm"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <ToolSelector
                    label={t('generators.shared.tool')}
                    toolLibrary={toolLibrary}
                    selectedId={params.toolId}
                    onChange={(id) => handleChange('toolId', id)}
                    unit={unit as 'mm' | 'in'}
                />
                <Input
                    label={t('generators.shared.feedRate')}
                    value={params.feedRate}
                    onChange={(e) => handleChange('feedRate', e.target.value)}
                    unit="mm/min"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label={t('generators.lockMitre.stepover')}
                    value={params.stepover}
                    onChange={(e) => handleChange('stepover', e.target.value)}
                    unit="%"
                />
                <Input
                    label={t('generators.lockMitre.stepdown')}
                    value={params.stepdown}
                    onChange={(e) => handleChange('stepdown', e.target.value)}
                    unit="mm"
                />
            </div>

            <RadioGroup
                label={t('generators.lockMitre.partToGenerate')}
                options={[
                    { label: t('generators.boxjoint.boardA'), value: 'A' },
                    { label: t('generators.boxjoint.boardB'), value: 'B' },
                    { label: t('generators.boxjoint.both'), value: 'both' }
                ]}
                selected={params.partToGenerate}
                onChange={(v) => handleChange('partToGenerate', v)}
            />

            <div className="bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg text-sm">
                <p><strong>{t('common.note', 'Note')}:</strong> {t('generators.lockMitre.flatMillingNote', 'This generator mills both pieces flat on the bed using a stepped profile. Use a small stepdown for a smoother finish.')}</p>
            </div>
        </div>
    );
};

export default LockMitreJointGenerator;
