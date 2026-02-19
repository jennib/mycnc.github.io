
import { useUIStore } from '../stores/uiStore';
import { useJobStore } from '../stores/jobStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useConnectionStore } from '../stores/connectionStore';
import { useMachineStore } from '../stores/machineStore';
import { useLogStore } from '../stores/logStore';

// Define types for state updates
type StateUpdate = {
    storeName: string;
    state: any;
};

class RemoteSyncService {
    private isElectron: boolean;
    private initialized = false;
    private isApplyingRemoteUpdate = false;

    constructor() {
        this.isElectron = !!window.electronAPI?.isElectron;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        if (this.isElectron) {
            this.initHost();
        } else {
            this.initClient();
        }
    }

    private initHost() {
        console.log("Initializing RemoteSync Host (Electron)");

        // 1. Subscribe to stores and broadcast changes
        useUIStore.subscribe((state) => {
            if (this.isApplyingRemoteUpdate) return;
            // Exclude modal states from host-to-client sync to prevent overwriting client's local interaction
            const {
                actions,
                isPreflightModalOpen,
                preflightWarnings,
                spindleModalArgs,
                isSpindleModalOpen,
                ...rest
            } = state;
            this.sendUpdate('uiStore', rest);
        });

        useJobStore.subscribe((state) => {
            if (this.isApplyingRemoteUpdate) return;
            const { actions, ...rest } = state;
            this.sendUpdate('jobStore', rest);
        });

        useSettingsStore.subscribe((state) => {
            if (this.isApplyingRemoteUpdate) return;
            const { actions, ...rest } = state;
            this.sendUpdate('settingsStore', rest);
        });

        useMachineStore.subscribe((state) => {
            if (this.isApplyingRemoteUpdate) return;
            const { actions, ...rest } = state;
            this.sendUpdate('machineStore', rest);
        });

        useConnectionStore.subscribe((state) => {
            if (this.isApplyingRemoteUpdate) return;
            const { isConnected, portInfo } = state;
            this.sendUpdate('connectionStore', { isConnected, portInfo });
        });


        // 2. Listen for remote updates (from remote clients)
        if (window.electronAPI && window.electronAPI.onStateUpdate) {
            window.electronAPI.onStateUpdate((update: StateUpdate) => {
                // console.log("Received remote update in Host:", update);
                // Apply to local stores, flagging as remote to prevent echo
                this.updateLocalStore(update.storeName, update.state);
            });
        }
    }

    private sanitizeState(state: any): any {
        if (state === null || typeof state !== 'object') {
            return state;
        }

        if (Array.isArray(state)) {
            return state.map(item => this.sanitizeState(item));
        }

        const sanitized: any = {};
        for (const key in state) {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                const value = state[key];
                if (typeof value !== 'function') {
                    sanitized[key] = this.sanitizeState(value);
                }
            }
        }
        return sanitized;
    }

    private lastStates: Record<string, any> = {};

    private sendUpdate(storeName: string, state: any) {
        if (!window.electronAPI || !window.electronAPI.sendStateUpdate) return;

        // Sanitize state to remove functions (e.g. onConfirm callbacks in uiStore)
        const sanitizedState = this.sanitizeState(state);

        // Simple optimization: JSON stringify compare
        // For jobStore, gcodeLines can be big.
        const serialized = JSON.stringify(sanitizedState);
        if (this.lastStates[storeName] === serialized) {
            return;
        }
        this.lastStates[storeName] = serialized;

        window.electronAPI.sendStateUpdate(storeName, sanitizedState);
    }

    private initClient() {
        console.log("Initializing RemoteSync Client (Browser)");

        if (!window.electronAPI) return;

        // 1. Subscribe to local stores to send updates TO host
        // (Allows controlling the app from the browser)
        useUIStore.subscribe((state) => {
            if (this.isApplyingRemoteUpdate) return;
            const { actions, ...rest } = state;
            this.sendUpdate('uiStore', rest);
        });

        useJobStore.subscribe((state) => {
            if (this.isApplyingRemoteUpdate) return;
            const { actions, ...rest } = state;
            this.sendUpdate('jobStore', rest);
        });

        // Settings - typically controlled by host, but maybe allowed from client?
        useSettingsStore.subscribe((state) => {
            if (this.isApplyingRemoteUpdate) return;
            const { actions, ...rest } = state;
            this.sendUpdate('settingsStore', rest);
        });

        // Connection: Client usually doesn't control connection state directly except via "connect" action which is local?
        // Actually, if client calls "connect", it updates local store, we send update to host... host shouldn't "connect" based on store update.
        // Host connects based on actions.
        // Syncing connectionStore *back* to host might not be needed if host is master.
        // But let's leave it for now.

        // 2. Listen for initial state
        if (window.electronAPI.getInitialState) {
            window.electronAPI.getInitialState().then((appState: any) => {
                console.log("Received initial state:", appState);
                this.hydrateStores(appState);

                // Auto-connect if host is connected
                if (appState.connectionStore?.isConnected) {
                    console.log("Host is connected. Auto-connecting remote client...");
                    setTimeout(() => {
                        const { actions } = useConnectionStore.getState();
                        actions.connect({ type: 'tcp', ip: 'remote', port: 0 });
                    }, 500);
                }
            });
        }

        // 3. Listen for updates (from Host or other Clients)
        if (window.electronAPI.onStateUpdate) {
            window.electronAPI.onStateUpdate((update: StateUpdate) => {
                // If the update includes gcodeLines and we already have them, verify if we need to update
                // But generally we should just trust the update for now. 
                // Optimization: Maybe only update if needed?
                this.updateLocalStore(update.storeName, update.state);
            });
        }
    }

    private hydrateStores(appState: any) {
        this.isApplyingRemoteUpdate = true;
        try {
            if (appState.uiStore) useUIStore.setState(appState.uiStore);
            if (appState.jobStore) useJobStore.setState(appState.jobStore);
            if (appState.settingsStore) useSettingsStore.setState(appState.settingsStore);
            if (appState.machineStore) useMachineStore.setState(appState.machineStore);
            // Connection store handled separately
        } finally {
            this.isApplyingRemoteUpdate = false;
        }
    }

    private updateLocalStore(storeName: string, state: any) {
        this.isApplyingRemoteUpdate = true;
        try {
            switch (storeName) {
                case 'uiStore': useUIStore.setState(state); break;
                case 'jobStore': useJobStore.setState(state); break;
                // For jobStore, if we receive gcodeLines, we might need to recalculate timeEstimate locally?
                // Or assume state includes it? State includes it.
                case 'settingsStore': useSettingsStore.setState(state); break;
                case 'machineStore': useMachineStore.setState(state); break;
                case 'connectionStore':
                    // Special handling for Host receiving connection updates? 
                    // Or client receiving host status?
                    // We definitely want to receive `isConnected`.
                    // But we don't want to overwrite our local controller instance.
                    // setState in useConnectionStore only updates properties, not the controller.
                    useConnectionStore.setState(state);
                    break;
            }
        } finally {
            this.isApplyingRemoteUpdate = false;
        }
    }
}

export const remoteSync = new RemoteSyncService();
