import { create } from 'zustand';

interface KeyboardState {
    isOpen: boolean;
    layout: 'text' | 'numpad';
    value: string;
    cursorPosition: number;
    label?: string;
    unit?: string;
    multiline?: boolean;
    inputRect?: DOMRect | null; // Position of the input triggering the keyboard
    onChange: (value: string, cursorPosition?: number) => void;
    onClose: () => void;

    actions: {
        openKeyboard: (options: {
            layout: 'text' | 'numpad';
            value: string;
            cursorPosition?: number;
            label?: string;
            unit?: string;
            multiline?: boolean;
            inputRect?: DOMRect | null;
            onChange: (value: string, cursorPosition?: number) => void;
            onClose?: () => void;
        }) => void;
        closeKeyboard: () => void;
        setValue: (value: string, cursorPosition?: number) => void;
        setCursorPosition: (position: number) => void;
    };
}

export const useKeyboardStore = create<KeyboardState>((set) => ({
    isOpen: false,
    layout: 'numpad',
    value: '',
    cursorPosition: 0,
    label: undefined,
    unit: undefined,
    multiline: false,
    inputRect: null,
    onChange: () => { },
    onClose: () => { },

    actions: {
        openKeyboard: ({ layout, value, cursorPosition, label, unit, multiline, inputRect, onChange, onClose }) => set({
            isOpen: true,
            layout,
            value: value ? value.toString() : '',
            cursorPosition: cursorPosition ?? (value ? value.toString().length : 0),
            label,
            unit,
            multiline: multiline || false,
            inputRect: inputRect || null,
            onChange,
            onClose: onClose || (() => { }),
        }),
        closeKeyboard: () => set((state) => {
            state.onClose();
            return { isOpen: false, inputRect: null };
        }),
        setValue: (newValue, newCursorPosition) => set((state) => {
            const nextCursor = newCursorPosition ?? newValue.length;
            state.onChange(newValue, nextCursor);
            return { value: newValue, cursorPosition: nextCursor };
        }),
        setCursorPosition: (position) => set({ cursorPosition: position }),
    },
}));
