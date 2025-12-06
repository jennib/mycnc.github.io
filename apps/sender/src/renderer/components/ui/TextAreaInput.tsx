import React, { useEffect, useRef } from 'react';
import { useKeyboardStore } from '../../stores/keyboardStore';

interface TextAreaInputProps {
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    rows?: number;
    spellCheck?: boolean;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
    value = '',
    onChange,
    label,
    placeholder,
    className = "",
    disabled = false,
    rows = 4,
    spellCheck = false
}) => {
    const { actions, isOpen, value: storeValue } = useKeyboardStore();
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const pendingCursor = useRef<number | null>(null);
    const isSyncing = useRef(false);

    // Sync external value changes to store (e.g. physical typing)
    useEffect(() => {
        // Only update if THIS input is focused
        if (isOpen && inputRef.current && document.activeElement === inputRef.current && value !== storeValue) {
            isSyncing.current = true;
            const currentPos = inputRef.current?.selectionStart || 0;
            actions.setValue(value, currentPos);
            isSyncing.current = false;
        }
    }, [value, isOpen, storeValue, actions]);

    // Sync cursor position after render if needed
    React.useLayoutEffect(() => {
        if (pendingCursor.current !== null && inputRef.current) {
            inputRef.current.setSelectionRange(pendingCursor.current, pendingCursor.current);
            pendingCursor.current = null;
        }
    }, [value]);

    const handleFocus = () => {
        if (disabled) return;

        syncCursor();

        actions.openKeyboard({
            layout: 'text', // Always text layout for scripts
            value: value,
            cursorPosition: inputRef.current?.selectionStart || 0,
            label: label || placeholder,
            multiline: true, // Enable multiline support
            onChange: (newValue, newCursor) => {
                if (isSyncing.current) return;

                if (onChange) {
                    pendingCursor.current = newCursor ?? null;
                    onChange(newValue);
                }
            },
            onClose: () => {
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
        // Re-trigger keyboard opening logic incase it was closed but we are still mistakenly focused
        if (inputRef.current) {
            const currentPos = inputRef.current?.selectionStart || 0;
            actions.openKeyboard({
                layout: 'text',
                value: value,
                cursorPosition: currentPos,
                label: label || placeholder,
                multiline: true,
                onChange: (newValue, newCursor) => {
                    if (isSyncing.current) return;

                    if (onChange) {
                        pendingCursor.current = newCursor ?? null;
                        onChange(newValue);
                    }
                },
                onClose: () => {
                    inputRef.current?.blur();
                }
            });
        }
    };

    const handleBlur = (e: React.FocusEvent) => {
        // e.relatedTarget is what we are clicking on.
        // If we are clicking on the keyboard, we shouldn't fully blur (or the keyboard logic handles closing).
        // Actually, store handles closing via the "Close" button. 
        // We just want to ensure we don't accidentally close the keyboard if the user clicks ANYWHERE else?
        // Current logic in NumberInput/TextInput relies on explicit close action or focus change.
    };

    const syncCursor = () => {
        if (inputRef.current) {
            const pos = inputRef.current.selectionStart;
            actions.setCursorPosition(pos);
        }
    };

    // Listen for selection changes to update global cursor position while focused
    const handleSelect = () => {
        syncCursor();
    };

    return (
        <textarea
            ref={inputRef}
            rows={rows}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => {
                // Direct typing (physical keyboard)
                if (onChange) onChange(e.target.value);
            }}
            onFocus={handleFocus}
            onClick={handleClick}
            onSelect={handleSelect}
            // onBlur={handleBlur} -> Let store handle closing via 'X' button or other focus events
            className={`
                w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 
                font-mono text-sm text-text-primary placeholder-white/20
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
                shadow-inner transition-colors hover:border-white/20
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
            spellCheck={spellCheck}
            autoComplete="off"
        />
    );
};

export default TextAreaInput;
