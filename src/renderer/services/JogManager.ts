/**
 * JogManager Service
 * 
 * Manages all jogging operations including:
 * - Continuous jogging (hold to jog)
 * - Discrete jogging (tap to jog with buffering)
 * - Alarm state monitoring and safety
 * - Jog cancellation
 */

import { MachineState } from '../types';

export type JogAxis = 'X' | 'Y' | 'Z';
export type JogDirection = 1 | -1;

interface JogState {
    axis: JogAxis;
    direction: JogDirection;
    feedRate: number;
}

interface JogManagerCallbacks {
    onSendJogCommand: (axis: JogAxis, direction: JogDirection, distance: number, feedRate: number) => void;
    onJogCancel: () => void;
    onAlarmDetected?: () => void;
}

export class JogManager {
    // State
    private continuousJogState: JogState | null = null;
    private continuousJogInterval: number | null = null;
    private machineState: MachineState | null = null;
    private callbacks: JogManagerCallbacks;

    // Configuration
    private readonly CONTINUOUS_JOG_INTERVAL = 100; // ms between continuous jog commands
    private readonly CONTINUOUS_JOG_DISTANCE = 1; // mm per continuous jog step
    private readonly HOLD_THRESHOLD = 150; // ms to distinguish tap from hold

    // Tap detection
    private tapStartTime: number = 0;
    private tapTimer: number | null = null;

    constructor(callbacks: JogManagerCallbacks) {
        this.callbacks = callbacks;
    }

    /**
     * Update machine state for alarm monitoring
     */
    public updateMachineState(state: MachineState | null): void {
        const wasAlarm = this.machineState?.status === 'Alarm';
        const isAlarm = state?.status === 'Alarm';

        this.machineState = state;

        // If machine enters alarm state, cancel all jogs immediately
        if (!wasAlarm && isAlarm) {
            this.cancelAllJogs();
            this.callbacks.onAlarmDetected?.();
        }
    }

    /**
     * Start a jog operation (called on key/button press)
     * Will automatically determine if it's continuous (hold) or discrete (tap)
     */
    public startJog(axis: JogAxis, direction: JogDirection, step: number, feedRate: number): void {
        // Safety check
        if (this.isAlarmState()) {
            return;
        }

        // Record tap start time
        this.tapStartTime = Date.now();

        // Start timer to detect if this becomes a hold
        if (this.tapTimer) {
            clearTimeout(this.tapTimer);
        }

        this.tapTimer = window.setTimeout(() => {
            // Held long enough - start continuous jogging
            this.startContinuousJog(axis, direction, feedRate);
        }, this.HOLD_THRESHOLD);
    }

    /**
     * Stop a jog operation (called on key/button release)
     */
    public stopJog(axis: JogAxis, direction: JogDirection, step: number, feedRate: number): void {
        const holdDuration = Date.now() - this.tapStartTime;

        // Clear the hold detection timer
        if (this.tapTimer) {
            clearTimeout(this.tapTimer);
            this.tapTimer = null;
        }

        // If continuous jog is active, stop it
        if (this.continuousJogState) {
            this.stopContinuousJog();
            return;
        }

        // If it was a quick tap (< threshold), send a discrete jog command
        if (holdDuration < this.HOLD_THRESHOLD) {
            this.sendDiscreteJog(axis, direction, step, feedRate);
        }
    }

    /**
     * Start continuous jogging (sends small incremental jogs repeatedly)
     */
    private startContinuousJog(axis: JogAxis, direction: JogDirection, feedRate: number): void {
        // Don't start if already jogging this direction
        if (this.continuousJogState?.axis === axis && this.continuousJogState?.direction === direction) {
            return;
        }

        // Stop any existing continuous jog
        this.stopContinuousJog();

        // Set new continuous jog state
        this.continuousJogState = { axis, direction, feedRate };

        // Send first jog command immediately
        this.sendContinuousJogStep();

        // Start interval to send continuous jog commands
        this.continuousJogInterval = window.setInterval(() => {
            if (this.isAlarmState()) {
                this.stopContinuousJog();
                return;
            }
            this.sendContinuousJogStep();
        }, this.CONTINUOUS_JOG_INTERVAL);
    }

    /**
     * Stop continuous jogging
     */
    private stopContinuousJog(): void {
        if (this.continuousJogInterval) {
            clearInterval(this.continuousJogInterval);
            this.continuousJogInterval = null;
        }

        if (this.continuousJogState) {
            this.continuousJogState = null;
            // Send jog cancel command to GRBL
            this.callbacks.onJogCancel();
        }
    }

    /**
     * Send a single continuous jog step
     */
    private sendContinuousJogStep(): void {
        if (!this.continuousJogState) return;

        const { axis, direction, feedRate } = this.continuousJogState;
        this.callbacks.onSendJogCommand(
            axis,
            direction,
            this.CONTINUOUS_JOG_DISTANCE,
            feedRate
        );
    }

    /**
     * Send a discrete (tap) jog command
     * These commands are allowed to buffer in GRBL
     */
    private sendDiscreteJog(axis: JogAxis, direction: JogDirection, distance: number, feedRate: number): void {
        if (this.isAlarmState()) {
            return;
        }

        this.callbacks.onSendJogCommand(axis, direction, distance, feedRate);
    }

    /**
     * Cancel all active jogs (emergency stop)
     */
    public cancelAllJogs(): void {
        this.stopContinuousJog();

        // Clear any pending tap timers
        if (this.tapTimer) {
            clearTimeout(this.tapTimer);
            this.tapTimer = null;
        }

        // Send cancel command
        this.callbacks.onJogCancel();
    }

    /**
     * Check if machine is in alarm state
     */
    private isAlarmState(): boolean {
        return this.machineState?.status === 'Alarm';
    }

    /**
     * Check if currently jogging continuously
     */
    public isContinuousJogging(): boolean {
        return this.continuousJogState !== null;
    }

    /**
     * Get current continuous jog state (for UI feedback)
     */
    public getContinuousJogState(): JogState | null {
        return this.continuousJogState;
    }

    /**
     * Cleanup resources
     */
    public destroy(): void {
        this.cancelAllJogs();
    }

    /**
     * Update configuration
     */
    public setConfig(config: {
        continuousJogInterval?: number;
        continuousJogDistance?: number;
        holdThreshold?: number;
    }): void {
        // Note: Changing these requires stopping/restarting for interval change
        // For now, just document that config should be set before use
        console.warn('JogManager: Config changes require restart to take effect');
    }
}

