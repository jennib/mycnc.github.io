import React from 'react';

interface SliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    help?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, min, max, step, help }) => (
    <div>
        <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-text-secondary">{label}</label>
            <span className="text-sm font-semibold text-text-primary">{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
        {help && <p className="text-xs text-text-secondary mt-1">{help}</p>}
    </div>
);
