import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

// Define MonacoEnvironment on window
declare global {
    interface Window {
        MonacoEnvironment: {
            getWorker(workerId: string, label: string): Worker;
        };
    }
}

// Configure Monaco Editor loader
export function configureMonaco() {
    // Define the MonacoEnvironment global
    self.MonacoEnvironment = {
        getWorker(_: any, label: string) {
            return new editorWorker();
        },
    };

    // Set Monaco instance
    loader.config({ monaco });

    // Initialize the loader
    return loader.init();
}
