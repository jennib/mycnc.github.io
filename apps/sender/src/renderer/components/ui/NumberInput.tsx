import React, { useRef } from 'react';
import { useKeyboardStore } from '../../stores/keyboardStore';

interface NumberInputProps {
    value: number | string;
    onChange: (value: string) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    className?: string;
    disabled?: boolean;
    label?: string; // For keyboard header
    id?: string;
    placeholder?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    min,
    max,
    step = 1,
    unit,
    className = "",
    disabled,
    label,
    id,
    placeholder
}) => {
    const { actions, value: storeValue, isOpen } = useKeyboardStore();
    const inputRef = useRef<HTMLInputElement>(null);

    const pendingCursor = useRef<number | null>(null);
    const isSyncing = useRef(false);

    const updateValue = (newValue: number) => {
        let val = newValue;
        if (min !== undefined && val < min) val = min;
        if (max !== undefined && val > max) val = max;

        // Handle float precision if step is float
        const precision = step.toString().split('.')[1]?.length || 0;
        const stringVal = precision > 0 ? val.toFixed(precision) : val.toString();

        onChange(stringVal);
    };

    const syncCursor = () => {
        if (!inputRef.current) return;
        const pos = inputRef.current.selectionStart || 0;
        actions.setCursorPosition(pos);
    };

    // Sync external value changes to store (e.g. physical typing)
    React.useEffect(() => {
        // Only update if THIS input is focused, preventing other background inputs from fighting for the store
        if (isOpen && inputRef.current && document.activeElement === inputRef.current && String(value) !== storeValue) {
            isSyncing.current = true;
            const currentPos = inputRef.current?.selectionStart || 0;
            actions.setValue(String(value), currentPos);
            isSyncing.current = false;
        }
    }, [value, isOpen, storeValue, actions]);

    // Restore cursor position after render if driven by OSK
    React.useLayoutEffect(() => {
        if (pendingCursor.current !== null && inputRef.current) {
            inputRef.current.setSelectionRange(pendingCursor.current, pendingCursor.current);
            pendingCursor.current = null;
        }
    }, [value]);

    const handleFocus = () => {
        if (disabled) return;
        const currentPos = inputRef.current?.selectionStart || 0;

        actions.openKeyboard({
            layout: 'numpad',
            value: String(value),
            cursorPosition: currentPos,
            label: label || (unit ? `Value (${unit})` : 'Value'),
            unit,
            onChange: (newValue, newCursor) => {
                if (isSyncing.current) return;

                if (newCursor !== undefined) {
                    pendingCursor.current = newCursor;
                }
                onChange(newValue);
            },
            onClose: () => {
                // Ensure we blur to remove the "orange frame"
                inputRef.current?.blur();
            }
        });

        // Scroll into view when keyboard opens
        setTimeout(() => {
            inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
    };

    const handleClick = () => {
        syncCursor();
        // If the keyboard is closed but we are clicking (and thus focusing), reopen it
        // We can't easily check store state here without subscribing, but calling openKeyboard is safe/idempotent-ish
        // effectively re-triggering focus logic
        handleFocus();
    };

    const handleBlur = (e: React.FocusEvent) => {
        // Only close if we aren't clicking ON the keyboard.
        // The VirtualKeyboard interaction prevents blur for its own buttons, 
        // so this generally means clicking outside.
        // However, we rely on the keyboard's "X" button calling onClose, which calls this input's blur.
    };

    return (
        <div className={`flex items-stretch rounded-lg bg-black/20 border border-white/10 overflow-hidden shadow-inner ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="relative flex-grow min-w-[60px]">
                <input
                    ref={inputRef}
                    id={id}
                    type="text" // Treat as text to avoid browser validation preventing empty/partial states
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={handleFocus}
                    // onBlur handled by OSK logic mostly, but we can keep standard behavior
                    // onBlur={handleBlur} 
                    onClick={handleClick}
                    onKeyUp={syncCursor}
                    disabled={disabled}
                    className="w-full h-full bg-transparent border-none text-center focus:ring-0 px-2 py-2 text-text-primary font-mono"
                    autoComplete="off"
                    placeholder={placeholder}
                />
                {unit && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary pointer-events-none">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
};

export default NumberInput;
