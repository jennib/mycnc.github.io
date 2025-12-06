import React, { useRef } from 'react';
import { useKeyboardStore } from '../../stores/keyboardStore';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    onValueChange?: (value: string) => void;
    layout?: 'text' | 'numpad';
}

const TextInput: React.FC<TextInputProps> = ({
    className = "",
    onValueChange,
    onChange,
    onFocus,
    value,
    disabled,
    label,
    placeholder,
    layout = 'text',
    ...props
}) => {
    const { actions, value: storeValue, isOpen } = useKeyboardStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const pendingCursor = useRef<number | null>(null);
    const isSyncing = useRef(false);

    const syncCursor = () => {
        if (!inputRef.current) return;
        const pos = inputRef.current.selectionStart || 0;
        actions.setCursorPosition(pos);
    };

    // Sync external value changes to store (e.g. physical typing)
    React.useEffect(() => {
        // Only update if THIS input is focused
        if (isOpen && inputRef.current && document.activeElement === inputRef.current && String(value || '') !== storeValue) {
            isSyncing.current = true;
            const currentPos = inputRef.current?.selectionStart || 0;
            actions.setValue(String(value || ''), currentPos);
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

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (disabled) return;

        // Call original onFocus if exists
        onFocus?.(e);
        const currentPos = inputRef.current?.selectionStart || 0;

        // Open OSK
        actions.openKeyboard({
            layout: layout,
            value: String(value || ''),
            cursorPosition: currentPos,
            label: label || placeholder,
            onChange: (newValue, newCursor) => {
                if (isSyncing.current) return;

                if (newCursor !== undefined) {
                    pendingCursor.current = newCursor;
                }
                onValueChange?.(newValue);
                // Also trigger synthetic event for standard onChange handlers
                if (onChange && inputRef.current) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                    nativeInputValueSetter?.call(inputRef.current, newValue);
                    const event = new Event('input', { bubbles: true });
                    inputRef.current.dispatchEvent(event);
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
        // Since we can't easily access the event object to pass to handleFocus fully constructed 
        // (and we don't strictly need to for the logic we care about), we just trigger the store action logic logic manually
        // or just mock the event.
        // Actually, easiest way is just to manually trigger the open logic again.
        if (inputRef.current) {
            // handleFocus({ target: inputRef.current } as any); 
            // Correct approach:
            const currentPos = inputRef.current?.selectionStart || 0;
            actions.openKeyboard({
                layout: layout,
                value: String(value || ''),
                cursorPosition: currentPos,
                label: label || placeholder,
                onChange: (newValue, newCursor) => {
                    if (isSyncing.current) return;

                    if (newCursor !== undefined) {
                        pendingCursor.current = newCursor;
                    }
                    onValueChange?.(newValue);
                    if (onChange && inputRef.current) {
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                        nativeInputValueSetter?.call(inputRef.current, newValue);
                        const event = new Event('input', { bubbles: true });
                        inputRef.current.dispatchEvent(event);
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
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        props.onBlur?.(e);
        // We do NOT want to close the keyboard here immediately because we might be clicking a keyboard button (which would cause blur first).
        // The VirtualKeyboard prevents mouseDown default, so blur shouldn't happen on keyboard clicks.
        // So this blur means clicking OUTSIDE.
        actions.closeKeyboard();
    };

    return (
        <input
            ref={inputRef}
            type="text"
            className={`
                bg-black/20 border border-white/10 rounded-lg py-2 px-3 
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
                text-text-primary shadow-inner transition-colors hover:border-white/20
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleClick}
            onKeyUp={syncCursor}
            disabled={disabled}
            placeholder={placeholder}
            readOnly={false} // Maybe set to true on touch devices to prevent native KB? For now keep standard.
            autoComplete="off"
            {...props}
        />
    );
};

export default TextInput;
