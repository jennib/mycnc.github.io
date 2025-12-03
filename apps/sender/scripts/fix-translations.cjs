const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'renderer', 'locales');
const REFERENCE_LANG = 'en';
const LANGUAGES = ['bn', 'de', 'es', 'fr', 'hi', 'ja', 'pa', 'uk', 'zh'];

function loadTranslation(lang) {
    const filePath = path.join(LOCALES_DIR, lang, 'translation.json');
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error loading ${lang}: ${error.message}`);
        return {};
    }
}

function saveTranslation(lang, content) {
    const filePath = path.join(LOCALES_DIR, lang, 'translation.json');
    fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
    console.log(`Saved ${lang}`);
}

function mergeDeep(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            } else {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                }
            }
        });
    }
    return output;
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function syncKeys(target, source) {
    const output = {};
    Object.keys(source).forEach(key => {
        if (key in target) {
            if (isObject(source[key]) && isObject(target[key])) {
                output[key] = syncKeys(target[key], source[key]);
            } else if (isObject(source[key])) {
                // Target has value but source is object - overwrite with source structure (shouldn't happen often if valid)
                // Or target is missing - use source
                output[key] = source[key];
            } else {
                // Both are values, keep target
                output[key] = target[key];
            }
        } else {
            // Missing in target, use source
            output[key] = source[key];
        }
    });
    return output;
}

const en = loadTranslation(REFERENCE_LANG);

LANGUAGES.forEach(lang => {
    console.log(`Processing ${lang}...`);
    const current = loadTranslation(lang);
    // We want to keep existing translations, but ensure structure matches EN.
    // Any missing keys get EN value.
    // Any extra keys are removed (by virtue of iterating over EN keys).
    const fixed = syncKeys(current, en);
    saveTranslation(lang, fixed);
});

console.log('Done.');
