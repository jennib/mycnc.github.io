import { resolve } from 'path'

export default {
    main: {
        // electron-vite will look for `src/main/index.js` by default
    },
    preload: {
        // Tell electron-vite where to find the preload script
        input: resolve(__dirname, 'electron/preload.js')
    },
    renderer: {}
}