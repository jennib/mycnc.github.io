/**
 * JogManager Service
 * 
 * Manages all jogging operations including:
 * - Continuous jogging (hold to jog)
 * - Discrete jogging (tap to jog with buffering)
 * - Alarm state monitoring and safety
 * - Jog cancellation
 */

import { MachineState, MachineSettings } from "@mycnc/shared";

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
    private machineSettings: MachineSettings | null = null;
    private isHomed: boolean = false;
    private bufferedCommands: number = 0;

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

    public setMachineSettings(settings: MachineSettings): void {
        this.machineSettings = settings;
    }

    public setIsHomed(isHomed: boolean): void {
        this.isHomed = isHomed;
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
     * Start analog jogging (variable feed rate, immediate continuous)
     * Used for gamepad control
     */
    public startAnalogJog(axis: JogAxis, direction: JogDirection, feedRate: number): void {
        // Safety check
        if (this.isAlarmState()) {
            return;
        }

        // For analog jog, we skip the tap detection and go straight to continuous
        // but we update the feed rate if already jogging
        this.startContinuousJog(axis, direction, feedRate);
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
        // If already jogging this direction, just update the feed rate
        if (this.continuousJogState?.axis === axis && this.continuousJogState?.direction === direction) {
            this.continuousJogState.feedRate = feedRate;
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
            this.bufferedCommands = 0;
            return;
        }

        if (this.bufferedCommands >= 3) {
            return;
        }

        if (!this.checkSoftLimits(axis, direction, distance)) {
            console.warn('JogManager: Soft limit reached');
            return;
        }

        this.bufferedCommands++;
        this.callbacks.onSendJogCommand(axis, direction, distance, feedRate);

        // Estimate duration. Min 100ms.
        const duration = Math.max((distance / feedRate) * 60 * 1000, 100);
        window.setTimeout(() => {
            if (this.bufferedCommands > 0) this.bufferedCommands--;
        }, duration);
    }

    private checkSoftLimits(axis: JogAxis, direction: JogDirection, distance: number): boolean {
        if (!this.isHomed || !this.machineSettings || !this.machineState) return true;

        const axisKey = axis.toLowerCase() as 'x' | 'y' | 'z';
        const currentPos = this.machineState.mpos[axisKey];
        const targetPos = currentPos + (direction * distance);
        const limits = this.machineSettings.workArea;

        if (axis === 'X') {
            if (targetPos < 0 || targetPos > limits.x) return false;
        } else if (axis === 'Y') {
            if (targetPos < 0 || targetPos > limits.y) return false;
        } else if (axis === 'Z') {
            // Assuming Z is negative travel (0 is top)
            if (targetPos < -limits.z || targetPos > 0) return false;
        }
        return true;
    }

    /**
     * Cancel all active jogs (emergency stop)
     */
    public cancelAllJogs(): void {
        this.stopContinuousJog();
        this.bufferedCommands = 0;

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

