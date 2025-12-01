import { useState, useCallback, useRef, useEffect } from 'react';

interface UndoRedoState {
    past: string[];
    present: string;
    future: string[];
}

interface UseUndoRedoOptions {
    maxHistorySize?: number;
    debounceMs?: number;
}

interface UseUndoRedoReturn {
    state: string;
    setState: (newState: string) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    reset: (initialState: string) => void;
    clear: () => void;
}

/**
 * Custom hook for managing undo/redo state with debouncing
 * 
 * @param initialState - The initial state value
 * @param options - Configuration options
 * @param options.maxHistorySize - Maximum number of history states to keep (default: 50)
 * @param options.debounceMs - Debounce delay in milliseconds (default: 500)
 * @returns Object with state, setState, undo, redo, and status flags
 */
export function useUndoRedo(
    initialState: string,
    options: UseUndoRedoOptions = {}
): UseUndoRedoReturn {
    const { maxHistorySize = 50, debounceMs = 500 } = options;

    const [history, setHistory] = useState<UndoRedoState>({
        past: [],
        present: initialState,
        future: [],
    });

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingStateRef = useRef<string | null>(null);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    /**
     * Record a new state in history (internal, non-debounced)
     */
    const recordState = useCallback((newState: string) => {
        setHistory((current) => {
            // Don't record if state hasn't changed
            if (current.present === newState) {
                return current;
            }

            const newPast = [...current.past, current.present];

            // Enforce max history size by removing oldest entries
            if (newPast.length > maxHistorySize) {
                newPast.shift();
            }

            return {
                past: newPast,
                present: newState,
                future: [], // Clear future when new state is recorded
            };
        });
    }, [maxHistorySize]);

    /**
     * Set state with debouncing to group rapid changes
     */
    const setState = useCallback((newState: string) => {
        // Update the present state immediately for UI responsiveness
        setHistory((current) => ({
            ...current,
            present: newState,
        }));

        // Store the pending state
        pendingStateRef.current = newState;

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer to record state after debounce period
        debounceTimerRef.current = setTimeout(() => {
            if (pendingStateRef.current !== null) {
                recordState(pendingStateRef.current);
                pendingStateRef.current = null;
            }
        }, debounceMs);
    }, [debounceMs, recordState]);

    /**
     * Undo the last change
     */
    const undo = useCallback(() => {
        // Flush any pending debounced state first
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        if (pendingStateRef.current !== null) {
            recordState(pendingStateRef.current);
            pendingStateRef.current = null;
        }

        setHistory((current) => {
            if (current.past.length === 0) {
                return current;
            }

            const previous = current.past[current.past.length - 1];
            const newPast = current.past.slice(0, current.past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [current.present, ...current.future],
            };
        });
    }, [recordState]);

    /**
     * Redo the last undone change
     */
    const redo = useCallback(() => {
        // Flush any pending debounced state first
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        if (pendingStateRef.current !== null) {
            recordState(pendingStateRef.current);
            pendingStateRef.current = null;
        }

        setHistory((current) => {
            if (current.future.length === 0) {
                return current;
            }

            const next = current.future[0];
            const newFuture = current.future.slice(1);

            return {
                past: [...current.past, current.present],
                present: next,
                future: newFuture,
            };
        });
    }, [recordState]);

    /**
     * Reset to a new initial state and clear history
     */
    const reset = useCallback((newInitialState: string) => {
        // Clear any pending debounced state
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        pendingStateRef.current = null;

        setHistory({
            past: [],
            present: newInitialState,
            future: [],
        });
    }, []);

    /**
     * Clear all history but keep current state
     */
    const clear = useCallback(() => {
        // Clear any pending debounced state
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        pendingStateRef.current = null;

        setHistory((current) => ({
            past: [],
            present: current.present,
            future: [],
        }));
    }, []);

    return {
        state: history.present,
        setState,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        reset,
        clear,
    };
}
