import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tool } from "@mycnc/shared";

interface RadioGroupProps {
    label?: string;
    options: { value: string; label: string }[];
    selected: string;
    onChange: (value: string) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, selected, onChange }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-bold text-text-secondary mb-2">{label}</label>}
        <div className="flex bg-black/20 rounded-lg p-1 border border-white/5">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-1.5 px-3 rounded-md text-sm font-semibold transition-all duration-200 ${selected === opt.value ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

interface InputProps {
    label: string;
    value?: string | number;
    valueX?: string | number;
    valueY?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeX?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeY?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    unit?: string;
    help?: string;
    isXY?: boolean;
    type?: string;
    step?: string;
    min?: string;
    max?: string;
}

export const Input: React.FC<InputProps> = ({ label, value, valueX, valueY, onChange, onChangeX, onChangeY, unit, help, isXY = false, type = 'text', step, min, max }) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-text-secondary mb-2">{label}</label>
        {isXY ? (
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">X</span>
                    <input
                        type="number" value={valueX} onChange={onChangeX}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-7 pr-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner transition-colors hover:border-white/20"
                    />
                </div>
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">Y</span>
                    <input
                        type="number" value={valueY} onChange={onChangeY}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-7 pr-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner transition-colors hover:border-white/20"
                    />
                </div>
            </div>
        ) : (
            <div className="relative">
                <input
                    type={type} step={step} min={min} max={max} value={value} onChange={onChange}
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner transition-colors hover:border-white/20"
                />
                {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary bg-black/20 px-1.5 py-0.5 rounded">{unit}</span>}
            </div>
        )}
        {help && <p className="text-xs text-text-tertiary mt-1.5 leading-relaxed">{help}</p>}
    </div>
);

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group mb-4">
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'bg-black/20 border-white/20 group-hover:border-white/40'}`}>
            {checked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </div>
        <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
            className="hidden"
        />
        <span className={`text-sm font-medium transition-colors ${checked ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>{label}</span>
    </label>
);

interface ToolSelectorProps {
    selectedId: number | null;
    onChange: (id: number | null) => void;
    colSpan?: string;
    unit: 'mm' | 'in';
    toolLibrary: Tool[];
    label?: string;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ selectedId, onChange, colSpan = 'col-span-full', unit, toolLibrary, label }) => {
    const { t } = useTranslation();
    const displayLabel = label || t('generators.shared.tool');

    return (
        <div className={`${colSpan} mb-4`}>
            <label className="block text-sm font-bold text-text-secondary mb-2">{displayLabel}</label>
            <div className="relative">
                <select
                    value={selectedId || ''}
                    onChange={e => onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary shadow-inner transition-colors hover:border-white/20 disabled:opacity-50"
                    disabled={!toolLibrary || toolLibrary.length === 0}
                >
                    <option value="">{toolLibrary && toolLibrary.length > 0 ? t('generators.shared.selectTool') : t('generators.shared.noTools')}</option>
                    {toolLibrary && toolLibrary.map(tool => <option key={tool.id} value={tool.id}>{`${tool.name} (Ø ${tool.diameter}${unit})`}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
            {(!toolLibrary || toolLibrary.length === 0) && (
                <p className="text-xs text-accent-yellow mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {t('generators.shared.addTools')}
                </p>
            )}
        </div>
    );
};

interface SpindleAndFeedControlsProps {
    params: any;
    onParamChange: (field: string, value: string) => void;
    feedLabel?: string;
    plunge?: boolean;
    plungeLabel?: string;
    unit: 'mm' | 'in';
}

export const SpindleAndFeedControls: React.FC<SpindleAndFeedControlsProps> = ({ params, onParamChange, feedLabel, plunge, plungeLabel, unit }) => {
    const { t } = useTranslation();
    const displayFeedLabel = feedLabel || t('generators.shared.feedRate');
    const displayPlungeLabel = plungeLabel || t('generators.shared.plungeRate');

    return (
        <React.Fragment>
            <div className="my-6 border-t border-white/10" />
            <div className="grid grid-cols-2 gap-4">
                <Input label={displayFeedLabel} value={params.feed} onChange={e => onParamChange('feed', e.target.value)} unit={unit + '/min'} />
                <Input label={t('generators.shared.spindleSpeed')} value={params.spindle} onChange={e => onParamChange('spindle', e.target.value)} unit="RPM" />
            </div>
            {plunge && <Input label={displayPlungeLabel} value={params.plungeFeed} onChange={e => onParamChange('plungeFeed', e.target.value)} unit={unit + '/min'} />}
            <Input label={t('generators.shared.safeZ')} value={params.safeZ} onChange={e => onParamChange('safeZ', e.target.value)} unit={unit} help={t('generators.shared.safeZHelp')} />
        </React.Fragment>
    );
};

interface ArrayControlsProps {
    settings: any;
    onChange: (settings: any) => void;
    unit: 'mm' | 'in';
}

export const ArrayControls: React.FC<ArrayControlsProps> = ({ settings, onChange, unit }) => {
    const { t } = useTranslation();

    const handleToggle = (checked: boolean) => {
        onChange({ ...settings, isEnabled: checked });
    };

    return (
        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <Checkbox
                label={t('generators.array.enable')}
                checked={settings.isEnabled}
                onChange={handleToggle}
            />
            {settings.isEnabled && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <RadioGroup options={[{ value: 'rect', label: t('generators.array.rectGrid') }, { value: 'circ', label: t('generators.array.circArray') }]} selected={settings.pattern} onChange={val => onChange({ ...settings, pattern: val })} />
                    {settings.pattern === 'rect' ? (
                        <React.Fragment>
                            <Input label={t('generators.array.colsRows')} valueX={settings.rectCols} valueY={settings.rectRows} onChangeX={e => onChange({ ...settings, rectCols: e.target.value })} onChangeY={e => onChange({ ...settings, rectRows: e.target.value })} isXY />
                            <Input label={t('generators.array.spacing')} valueX={settings.rectSpacingX} valueY={settings.rectSpacingY} onChangeX={e => onChange({ ...settings, rectSpacingX: e.target.value })} onChangeY={e => onChange({ ...settings, rectSpacingY: e.target.value })} isXY unit={unit} />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Input label={t('generators.array.copies')} value={settings.circCopies} onChange={e => onChange({ ...settings, circCopies: e.target.value })} />
                            <Input label={t('generators.array.center')} valueX={settings.circCenterX} valueY={settings.circCenterY} onChangeX={e => onChange({ ...settings, circCenterX: e.target.value })} onChangeY={e => onChange({ ...settings, circCenterY: e.target.value })} isXY unit={unit} />
                            <Input label={t('generators.array.radius')} value={settings.circRadius} onChange={e => onChange({ ...settings, circRadius: e.target.value })} unit={unit} />
                            <Input label={t('generators.array.startAngle')} value={settings.circStartAngle} onChange={e => onChange({ ...settings, circStartAngle: e.target.value })} unit="°" />
                        </React.Fragment>
                    )}
                </div>
            )}
        </div>
    );
};


