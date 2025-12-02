
try {
    const plugin = require('vite-plugin-monaco-editor');
    console.log('Type:', typeof plugin);
    console.log('Value:', plugin);
    console.log('Default:', plugin.default);
} catch (e) {
    console.error(e);
}
