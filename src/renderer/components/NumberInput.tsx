import React, { useState, useEffect } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number;
    onChange: (value: number) => void;
    unit?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, unit, ...props }) => {
    const [displayValue, setDisplayValue] = useState(String(value));
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        setDisplayValue(String(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setDisplayValue(inputValue);

        // Allow empty input or partial numbers (e.g., "1.", "-") without validating yet
        if (inputValue === '' || inputValue === '-' || inputValue.endsWith('.')) {
            setIsValid(true);
            return;
        }

        const numericValue = parseFloat(inputValue);
        if (isNaN(numericValue)) {
            setIsValid(false);
        } else {
            setIsValid(true);
            onChange(numericValue);
        }
    };

    const handleBlur = () => {
        const numericValue = parseFloat(displayValue);
        if (isNaN(numericValue)) {
            // If invalid, revert to last known good value
            setDisplayValue(String(value));
            setIsValid(true);
        } else {
            // On blur, commit the potentially partial value
            if (displayValue !== String(value)) {
                onChange(numericValue);
            }
        }
    };

    const ringClass = isValid ? 'focus:ring-primary' : 'ring-2 ring-accent-red';

    return (
        <div className="relative flex-grow">
            <input
                {...props}
                type="number"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent ${ringClass}`}
            />
            {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">{unit}</span>}
        </div>
    );
};

export default NumberInput;
