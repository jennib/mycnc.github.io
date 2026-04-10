// This file is the lazy-load entry point for the G-code editor.
// It is only ever imported dynamically, so Vite splits it (and all of
// monaco-editor) into a separate async chunk that is NOT downloaded
// until the user first opens the editor.
//
// configureMonaco() (from shared/editor) already calls loader.config({ monaco })
// internally, so we don't import monaco-editor directly here — that would
// create a second independent import chain and double the chunk size.
import { setupMonacoWorkers } from '../monacoWorker';
import { GCodeEditorModal, configureMonaco } from '@mycnc/shared/editor';

setupMonacoWorkers();
configureMonaco();

export default GCodeEditorModal;
