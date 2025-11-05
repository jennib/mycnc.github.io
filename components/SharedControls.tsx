import React from 'react';
import { Tool } from '../../types';

interface RadioGroupProps {
    label?: string;
    options: { value: string; label: string }[];
    selected: string;
    onChange: (value: string) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, selected, onChange }) => (
    <div className="mb-2">
        {label && <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>}
        <div className="flex bg-secondary rounded-md p-1">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`w-full p-1 rounded-md text-sm font-semibold transition-colors ${selected === opt.value ? 'bg-primary text-white' : 'hover:bg-secondary-focus'}`}
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
}

export const Input: React.FC<InputProps> = ({ label, value, valueX, valueY, onChange, onChangeX, onChangeY, unit, help, isXY = false }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        {isXY ? (
            <div className="flex gap-2">
                <input type="number" value={valueX} onChange={onChangeX} className="w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary" />
                <input type="number" value={valueY} onChange={onChangeY} className="w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
        ) : (
            <div className="relative">
                <input type="number" value={value} onChange={onChange} className="w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary" />
                {unit && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary">{unit}</span>}
            </div>
        )}
        {help && <p className="text-xs text-text-secondary mt-1">{help}</p>}
    </div>
);

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2 cursor-pointer font-semibold text-text-primary">
        <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary"
        />
        {label}
    </label>
);

interface ToolSelectorProps {
    selectedId: number | null;
    onChange: (id: number | null) => void;
    colSpan?: string;
    unit: 'mm' | 'in';
    toolLibrary: Tool[];
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ selectedId, onChange, colSpan = 'col-span-full', unit, toolLibrary }) => (
    <div className={colSpan}>
        <label className="block text-sm font-medium text-text-secondary mb-1">Tool</label>
        <select
            value={selectedId || ''}
            onChange={e => onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            disabled={!toolLibrary || toolLibrary.length === 0}
        >
            <option value="">{toolLibrary && toolLibrary.length > 0 ? 'Select a tool...' : 'No tools in library'}</option>
            {toolLibrary && toolLibrary.map(tool => <option key={tool.id} value={tool.id}>{`${tool.name} (Ø ${tool.diameter}${unit})`}</option>)}
        </select>
        {(!toolLibrary || toolLibrary.length === 0) && (
            <p className="text-xs text-text-secondary mt-1">
                Add tools in the Tool Library to enable generation.
            </p>
        )}
    </div>
);

interface SpindleAndFeedControlsProps {
    params: any;
    onParamChange: (field: string, value: string) => void;
    feedLabel?: string;
    plunge?: boolean;
    plungeLabel?: string;
    unit: 'mm' | 'in';
}

export const SpindleAndFeedControls: React.FC<SpindleAndFeedControlsProps> = ({ params, onParamChange, feedLabel = 'Feed Rate', plunge, plungeLabel = 'Plunge Rate', unit }) => (
    <React.Fragment>
        <hr className="border-secondary" />
        <div className="grid grid-cols-2 gap-4">
            <Input label={feedLabel} value={params.feed} onChange={e => onParamChange('feed', e.target.value)} unit={unit + '/min'} />
            <Input label="Spindle Speed" value={params.spindle} onChange={e => onParamChange('spindle', e.target.value)} unit="RPM" />
        </div>
        {plunge && <Input label={plungeLabel} value={params.plungeFeed} onChange={e => onParamChange('plungeFeed', e.target.value)} unit={unit + '/min'} />}
        <Input label="Safe Z" value={params.safeZ} onChange={e => onParamChange('safeZ', e.target.value)} unit={unit} help="Rapid height above stock" />
    </React.Fragment>
);

interface ArrayControlsProps {
    settings: any;
    onChange: (settings: any) => void;
    unit: 'mm' | 'in';
}

export const ArrayControls: React.FC<ArrayControlsProps> = ({ settings, onChange, unit }) => {
    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...settings, isEnabled: e.target.checked });
    };

    return (
        <div className="bg-background/50 p-4 rounded-md">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-text-primary">
                <input
                    type="checkbox"
                    checked={settings.isEnabled}
                    onChange={handleToggle}
                    className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary"
                />
                Enable Array Pattern
            </label>
            {settings.isEnabled && (
                <div className="mt-4 pt-4 border-t border-secondary space-y-4">
                    <RadioGroup options={[{ value: 'rect', label: 'Rectangular Grid' }, { value: 'circ', label: 'Circular Array' }]} selected={settings.pattern} onChange={val => onChange({ ...settings, pattern: val })} />
                    {settings.pattern === 'rect' ? (
                        <React.Fragment>
                            <Input label="Columns, Rows" valueX={settings.rectCols} valueY={settings.rectRows} onChangeX={e => onChange({ ...settings, rectCols: e.target.value })} onChangeY={e => onChange({ ...settings, rectRows: e.target.value })} isXY />
                            <Input label="Spacing (X, Y)" valueX={settings.rectSpacingX} valueY={settings.rectSpacingY} onChangeX={e => onChange({ ...settings, rectSpacingX: e.target.value })} onChangeY={e => onChange({ ...settings, rectSpacingY: e.target.value })} isXY unit={unit} />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Input label="Number of Copies" value={settings.circCopies} onChange={e => onChange({ ...settings, circCopies: e.target.value })} />
                            <Input label="Center (X, Y)" valueX={settings.circCenterX} valueY={settings.circCenterY} onChangeX={e => onChange({ ...settings, circCenterX: e.target.value })} onChangeY={e => onChange({ ...settings, circCenterY: e.target.value })} isXY unit={unit} />
                            <Input label="Radius" value={settings.circRadius} onChange={e => onChange({ ...settings, circRadius: e.target.value })} unit={unit} />
                            <Input label="Start Angle" value={settings.circStartAngle} onChange={e => onChange({ ...settings, circStartAngle: e.target.value })} unit="°" />
                        </React.Fragment>
                    )}
                </div>
            )}
        </div>
    );
};