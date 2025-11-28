import { useState, useEffect, useRef, useCallback } from 'react';

export interface GamepadState {
    axes: number[];
    buttons: GamepadButton[];
    connected: boolean;
    id: string;
    timestamp: number;
}

interface GamepadConfig {
    deadzone: number;
    pollRate: number; // in ms, though we usually use RAF
}

export const useGamepad = (config: GamepadConfig = { deadzone: 0.1, pollRate: 16 }) => {
    const [gamepadState, setGamepadState] = useState<GamepadState | null>(null);
    const requestRef = useRef<number>();

    const scanGamepads = useCallback(() => {
        const gamepads = navigator.getGamepads();
        // We'll just take the first connected gamepad for now
        const gp = Array.from(gamepads).find(g => g !== null);

        if (gp) {
            setGamepadState({
                axes: [...gp.axes],
                buttons: [...gp.buttons],
                connected: gp.connected,
                id: gp.id,
                timestamp: gp.timestamp
            });
        } else {
            setGamepadState(null);
        }

        requestRef.current = requestAnimationFrame(scanGamepads);
    }, []);

    useEffect(() => {
        window.addEventListener("gamepadconnected", (e) => {
            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                e.gamepad.index, e.gamepad.id,
                e.gamepad.buttons.length, e.gamepad.axes.length);
        });

        window.addEventListener("gamepaddisconnected", (e) => {
            console.log("Gamepad disconnected from index %d: %s",
                e.gamepad.index, e.gamepad.id);
        });

        requestRef.current = requestAnimationFrame(scanGamepads);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [scanGamepads]);

    // Helper to apply deadzone
    const applyDeadzone = (value: number) => {
        return Math.abs(value) < config.deadzone ? 0 : value;
    };

    return {
        gamepadState,
        applyDeadzone
    };
};
