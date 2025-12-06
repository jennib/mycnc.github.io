import React, { useRef, useEffect, useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './VirtualKeyboard.css';
import { useKeyboardStore } from '../../stores/keyboardStore';
import { X, GripHorizontal } from "@mycnc/shared";

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
    const { isOpen, layout, value, cursorPosition, label, multiline, inputRect, actions } = useKeyboardStore();
    const keyboard = useRef<any>(null);
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
    const dragRef = useRef<{ startX: number, startY: number, startLeft: number, startTop: number } | null>(null);

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

    // Initialize position when opening
    useEffect(() => {
        if (isOpen) {
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const keyboardWidth = layout === 'numpad' ? 332 : 832; // Approx width + padding
            const keyboardHeight = 300; // Approx height

            let newX = (windowWidth / 2) - (keyboardWidth / 2);
            let newY = windowHeight - keyboardHeight - 40; // Default bottom

            if (inputRect) {
                const inputBottom = inputRect.bottom;
                // If input is in the bottom half of the screen, show keyboard at the top
                if (inputBottom > windowHeight / 2) {
                    newY = 40; // Top
                }
            }
            setPosition({ x: newX, y: newY });
        }
    }, [isOpen, inputRect, layout]);


    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!position) return;
        // Only allow drag on header/grip area? No, the whole header is nice.
        e.preventDefault();

        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startLeft: position.x,
            startTop: position.y
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragRef.current) return;

        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        setPosition({
            x: dragRef.current.startLeft + dx,
            y: dragRef.current.startTop + dy
        });
    };

    const handleMouseUp = () => {
        dragRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };


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


    if (!isOpen) return null;

    // Use state position if available, else standard fallback (shouldn't really happen due to useEffect)
    const currentPos = position || { x: window.innerWidth / 2 - 400, y: window.innerHeight - 300 };

    // Map store layout to simple-keyboard layout configurations
    const activeLayout = layout === 'numpad' ? 'numpad' : 'default';

    return (
        <div
            className="fixed z-[100] bg-surface border border-white/10 shadow-2xl rounded-2xl p-4 transition-opacity duration-150 ease-out"
            style={{
                left: currentPos.x,
                top: currentPos.y,
                // Remove transform centering because we are positioning top-left explicitly
                opacity: position ? 1 : 0
            }}
        >
            <div className={`flex flex-col gap-4 ${layout === 'numpad' ? 'w-[300px]' : 'w-[800px]'}`}>
                {/* Header / Toolbar - Draggable */}
                <div
                    className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/10 mb-2 cursor-move active:cursor-grabbing select-none"
                    onMouseDown={handleMouseDown}
                >
                    <div className="flex items-center gap-2 text-text-secondary w-16">
                        <GripHorizontal className="w-5 h-5 opacity-50" />
                    </div>

                    {label && <span className="text-sm font-bold text-text-secondary uppercase tracking-wider pointer-events-none">{label}</span>}

                    <div className="flex justify-end w-16">
                        <button
                            onClick={(e) => { e.stopPropagation(); actions.closeKeyboard(); }}
                            className="p-2 hover:bg-white/10 rounded-lg text-text-secondary cursor-pointer"
                            onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking close
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="w-full">
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
