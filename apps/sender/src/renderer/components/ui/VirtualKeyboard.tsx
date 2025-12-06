import React, { useRef, useEffect, useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './VirtualKeyboard.css';
import { useKeyboardStore } from '../../stores/keyboardStore';
import { X } from "@mycnc/shared";

// Define custom layouts
const customLayouts = {
    default: [
        "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
        "{tab} q w e r t y u i o p [ ] \\",
        "{lock} a s d f g h j k l ; ' {enter}",
        "{shift} z x c v b n m , . / {shift}",
        ".com @ {space}"
    ],
    numpad: [
        "7 8 9 {bksp}",
        "4 5 6 .",
        "1 2 3 -",
        "0 {enter}"
    ]
};

const VirtualKeyboard: React.FC = () => {
    const { isOpen, layout, value, cursorPosition, label, multiline, actions } = useKeyboardStore();
    const keyboard = useRef<any>(null);

    // Sync external value changes to valid properties
    useEffect(() => {
        if (keyboard.current) {
            keyboard.current.setInput(value);

            // Sync cursor if provided
            if (cursorPosition !== undefined) {
                try {
                    keyboard.current.setCaretPosition(cursorPosition);
                } catch (e) {
                    // ignore caret errors if keyboard not fully ready
                }
            }
        }
    }, [value, cursorPosition]);

    // Handle body class for layout adjustments
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('virtual-keyboard-open');
        } else {
            document.body.classList.remove('virtual-keyboard-open');
        }
        return () => {
            document.body.classList.remove('virtual-keyboard-open');
        };
    }, [isOpen]);

    const onChange = (input: string) => {
        // When keyboard changes, we update the store.
        // We also need to get the new cursor position.
        let newCursor = cursorPosition;
        if (keyboard.current) {
            newCursor = keyboard.current.caretPosition;
        } else {
            newCursor = input.length;
        }

        actions.setValue(input, newCursor);
    };

    const onKeyPress = (button: string) => {
        if (button === "{enter}") {
            if (multiline) {
                // Insert newline
                let newValue = value;
                let newCursor = cursorPosition;

                // Simple insertion if cursor is valid, otherwise append
                if (typeof cursorPosition === 'number') {
                    newValue = value.slice(0, cursorPosition) + "\n" + value.slice(cursorPosition);
                    newCursor = cursorPosition + 1;
                } else {
                    newValue = value + "\n";
                    newCursor = newValue.length;
                }
                actions.setValue(newValue, newCursor);
            } else {
                actions.closeKeyboard();
            }
        } else if (button === "{check}") {
            actions.closeKeyboard();
        } else if (button === "{shift}" || button === "{lock}") {
            const currentLayout = keyboard.current.options.layoutName;
            const shiftToggle = currentLayout === "default" ? "shift" : "default";
            keyboard.current.setOptions({
                layoutName: shiftToggle
            });
        }
    };

    // prevent propagation to avoid closing if outside click logic exists elsewhere
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    if (!isOpen) return null;

    // Map store layout to simple-keyboard layout configurations
    const activeLayout = layout === 'numpad' ? 'numpad' : 'default';

    return (
        <div
            className="fixed inset-x-0 bottom-0 z-[100] bg-surface border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] p-4 pb-8 slide-up-animation"
            onMouseDown={handleMouseDown}
        >
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
                {/* Header / Toolbar - Minimal */}
                <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-white/10 mb-2">
                    <button onClick={actions.closeKeyboard} className="p-2 hover:bg-white/10 rounded-lg text-text-secondary">
                        <X className="w-5 h-5" />
                    </button>
                    {label && <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">{label}</span>}
                    <div className="w-9" /> {/* Spacer for centering */}
                </div>

                <div className={layout === 'numpad' ? 'max-w-md mx-auto w-full' : 'w-full'}>
                    <Keyboard
                        keyboardRef={r => (keyboard.current = r)}
                        layout={customLayouts}
                        layoutName={activeLayout}
                        onChange={onChange}
                        onKeyPress={onKeyPress}
                        theme={`hg-theme-default ${layout === 'numpad' ? 'hg-layout-numpad' : ''} glass-keyboard`}
                        display={{
                            "{bksp}": "⌫",
                            "{enter}": multiline ? "↵" : "Done",
                            "{shift}": "⇧",
                            "{tab}": "Tab",
                            "{lock}": "Caps",
                            "{space}": " ",
                            "{check}": "✓"
                        }}
                        preventMouseDownDefault={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default VirtualKeyboard;
