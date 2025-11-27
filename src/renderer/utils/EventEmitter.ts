/**
 * Simple Event Emitter for controller events
 * 
 * Provides a lightweight event system for controllers to emit state changes,
 * data events, and errors to listeners.
 */

type Listener = (data: any) => void;

export class EventEmitter<T extends string = string> {
    private listeners: Map<T, Set<Listener>> = new Map();

    /**
     * Register an event listener
     * @param event Event name to listen for
     * @param listener Callback function to execute when event is emitted
     */
    on(event: T, listener: Listener): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener);
    }

    /**
     * Remove an event listener
     * @param event Event name
     * @param listener Callback function to remove
     */
    off(event: T, listener: Listener): void {
        this.listeners.get(event)?.delete(listener);
    }

    /**
     * Emit an event to all registered listeners
     * @param event Event name
     * @param data Data to pass to listeners
     */
    emit(event: T, data: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(listener => listener(data));
        }
    }

    /**
     * Remove all listeners for a specific event, or all listeners if no event specified
     * @param event Optional event name to clear listeners for
     */
    removeAllListeners(event?: T): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}
