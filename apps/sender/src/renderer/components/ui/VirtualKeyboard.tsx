import React, { useRef, useEffect, useState, useMemo } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './VirtualKeyboard.css';
import { useKeyboardStore } from '../../stores/keyboardStore';
import { X, GripHorizontal } from "@mycnc/shared";
import KeyboardLayouts from "simple-keyboard-layouts";
import { useTranslation } from 'react-i18next';

// Define custom key display/labels
const display = {
    "{bksp}": "⌫",
    "{enter}": "Done", // Default to Done, changes for multiline
    "{shift}": "⇧",
    "{tab}": "Tab",
    "{lock}": "Caps",
    "{space}": " ",
    "{check}": "✓",
    "{default}": "ABC", // Button to switch back to letters
    "{numpad}": "123"  // Button to switch to numbers (if we add it)
};

// Custom Numpad Layout
const numpadLayout = {
    default: [
        "7 8 9 {bksp}",
        "4 5 6 .",
        "1 2 3 -",
        "0 {enter}"
    ]
};

const VirtualKeyboard: React.FC = () => {
    const { isOpen, layout, value, cursorPosition, label, multiline, inputRect, actions } = useKeyboardStore();
    const { i18n } = useTranslation();
    const keyboard = useRef<any>(null);
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
    const dragRef = useRef<{ startX: number, startY: number, startLeft: number, startTop: number } | null>(null);

    // Instantiate layouts wrapper once
    const keyboardLayouts = useMemo(() => new KeyboardLayouts(), []);

    // Determine the keyboard layout based on language and type
    const currentLayoutObject = useMemo(() => {
        if (layout === 'numpad') return numpadLayout;

        // Map i18n language to simple-keyboard-layouts names
        const langMap: Record<string, string> = {
            en: "english",
            es: "spanish",
            fr: "french",
            de: "german",
            zh: "chinese",
            hi: "hindi",
            bn: "bengali",
            ja: "japanese",
            uk: "ukrainian",
            pa: "punjabi"
        };

        const langName = langMap[i18n.language] || "english";
        const matchedLayout = keyboardLayouts.get(langName);

        // Ensure we always return a valid layout object, falling back to english
        return (matchedLayout as any)?.layout || keyboardLayouts.get("english")?.layout || { default: ["q w e r t y u i o p", "a s d f g h j k l", "z x c v b n m"] };
    }, [layout, i18n.language, keyboardLayouts]);


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
            setPosition(null); // Reset position on close
        };
    }, [isOpen]);

    // Initialize position when opening
    useEffect(() => {
        if (isOpen) {
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const keyboardWidth = layout === 'numpad' ? 350 : 850; // Approx width + padding
            const keyboardHeight = 320; // Approx height with header

            let newX = (windowWidth / 2) - (keyboardWidth / 2);
            let newY = windowHeight - keyboardHeight - 20; // Default bottom padding

            if (inputRect) {
                const inputMidY = inputRect.top + (inputRect.height / 2);

                // Smart positioning:
                // If input is in bottom 40% of screen, move keyboard to top
                if (inputMidY > windowHeight * 0.6) {
                    newY = 20; // Top padding
                }

                // Autoscroll logic - if input is covered
                // We don't want to be aggressive, but ensure basic visibility
                setTimeout(() => {
                    const el = document.elementFromPoint(inputRect.left + 5, inputRect.top + 5);
                    // Or find by active element
                    if (document.activeElement && document.activeElement.getBoundingClientRect) {
                        document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
            setPosition({ x: newX, y: newY });
        }
    }, [isOpen, inputRect, layout]);


    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!position) return;
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
                let newValue = value;
                let newCursor = cursorPosition;

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

    const currentPos = position || { x: window.innerWidth / 2 - 400, y: window.innerHeight - 300 };

    return (
        <>
            {/* Backdrop Scrim - Adds 'Modal' feel but keeps context visible */}
            <div
                className="fixed inset-0 bg-black/20 z-[19999] transition-opacity duration-300"
                onClick={() => actions.closeKeyboard()}
            />

            <div
                className="fixed z-[20000] bg-background border border-white/20 shadow-2xl rounded-2xl p-4 transition-all duration-200 ease-out"
                style={{
                    left: currentPos.x,
                    top: currentPos.y,
                    opacity: position ? 1 : 0,
                    transform: position ? 'scale(1)' : 'scale(0.95)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
            >
                <div className={`flex flex-col gap-3 ${layout === 'numpad' ? 'w-[320px]' : 'w-[850px]'}`}>
                    {/* Header / Toolbar - Draggable */}
                    <div
                        className="flex items-center justify-between bg-surface p-2 rounded-xl border border-white/10 mb-2 cursor-move active:cursor-grabbing select-none hover:bg-surface/80 transition-colors"
                        onMouseDown={handleMouseDown}
                    >
                        <div className="flex items-center gap-2 text-text-secondary w-16 pl-2">
                            <GripHorizontal className="w-5 h-5 opacity-70" />
                        </div>

                        <div className="flex-1 text-center truncate px-4 flex flex-col justify-center h-full">
                            {label ? (
                                <div className="text-xl font-bold text-text-primary text-shadow truncate font-sans py-1">{label}</div>
                            ) : (
                                <div className="text-lg font-bold text-text-primary text-shadow truncate font-mono">{value}</div>
                            )}
                        </div>

                        <div className="flex justify-end w-16">
                            <button
                                onClick={(e) => { e.stopPropagation(); actions.closeKeyboard(); }}
                                className="p-1.5 hover:bg-white/10 hover:text-white rounded-lg text-text-secondary cursor-pointer transition-colors"
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="w-full keyboard-container">
                        <Keyboard
                            keyboardRef={r => (keyboard.current = r)}
                            layout={currentLayoutObject}
                            layoutName="default"
                            onChange={onChange}
                            onKeyPress={onKeyPress}
                            theme={`hg-theme-default ${layout === 'numpad' ? 'hg-layout-numpad' : ''} glass-keyboard`}
                            display={{
                                ...display,
                                "{enter}": multiline ? "↵" : "Done"
                            }}
                            preventMouseDownDefault={true}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default VirtualKeyboard;
