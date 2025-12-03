import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Configure Monaco Editor loader
export function configureMonaco(): Promise<any> {
    // MonacoEnvironment should be configured by the application (e.g. in main.tsx)
    // to handle worker loading correctly in different environments (Electron, Browser).

    // Set Monaco instance
    loader.config({ monaco });

    // Initialize the loader
    return loader.init();
}
