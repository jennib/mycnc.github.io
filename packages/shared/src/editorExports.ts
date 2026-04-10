// Separate entry point for Monaco-dependent exports.
// Imported as "@mycnc/shared/editor" so the main "@mycnc/shared" entry
// never references monaco-editor, keeping it out of the initial bundle.
export { GCodeEditorModal } from './components/GCodeEditorModal';
export { configureMonaco } from './services/monacoConfig';
