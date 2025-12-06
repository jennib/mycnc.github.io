import { create } from 'zustand';

interface KeyboardState {
    isOpen: boolean;
    layout: 'text' | 'numpad';
    value: string;
    cursorPosition: number;
    label?: string;
    unit?: string;
    multiline?: boolean;
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
    onChange: () => { },
    onClose: () => { },

    actions: {
        openKeyboard: ({ layout, value, cursorPosition, label, unit, multiline, onChange, onClose }) => set({
            isOpen: true,
            layout,
            value: value ? value.toString() : '',
            cursorPosition: cursorPosition ?? (value ? value.toString().length : 0),
            label,
            unit,
            multiline: multiline || false,
            onChange,
            onClose: onClose || (() => { }),
        }),
        closeKeyboard: () => set((state) => {
            state.onClose();
            return { isOpen: false };
        }),
        setValue: (newValue, newCursorPosition) => set((state) => {
            const nextCursor = newCursorPosition ?? newValue.length;
            state.onChange(newValue, nextCursor);
            return { value: newValue, cursorPosition: nextCursor };
        }),
        setCursorPosition: (position) => set({ cursorPosition: position }),
    },
}));
