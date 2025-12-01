#!/usr/bin/env node

/**
 * Translation Completeness Checker
 * 
 * This script validates that all translation files have the same keys as the English (reference) file.
 * It will report any missing keys in each language file.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');
const REFERENCE_LANG = 'en';
const LANGUAGES = ['es', 'fr', 'de', 'zh'];

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

/**
 * Recursively get all keys from a nested object
 * @param {Object} obj - The object to extract keys from
 * @param {string} prefix - The current key prefix
 * @returns {string[]} - Array of dot-notation keys
 */
function getAllKeys(obj, prefix = '') {
    const keys = [];

    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys.push(...getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys;
}

/**
 * Load and parse a translation file
 * @param {string} lang - Language code
 * @returns {Object|null} - Parsed JSON or null if error
 */
function loadTranslation(lang) {
    const filePath = path.join(LOCALES_DIR, lang, 'translation.json');

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`${colors.red}Error loading ${lang}/translation.json: ${error.message}${colors.reset}`);
        return null;
    }
}

/**
 * Main validation function
 */
function validateTranslations() {
    console.log(`${colors.cyan}=== Translation Completeness Check ===${colors.reset}\n`);

    // Load reference translation
    const referenceTranslation = loadTranslation(REFERENCE_LANG);
    if (!referenceTranslation) {
        console.error(`${colors.red}Failed to load reference translation (${REFERENCE_LANG}). Aborting.${colors.reset}`);
        process.exit(1);
    }

    const referenceKeys = getAllKeys(referenceTranslation).sort();
    console.log(`${colors.blue}Reference (${REFERENCE_LANG}): ${referenceKeys.length} keys found${colors.reset}\n`);

    let hasErrors = false;
    const results = [];

    // Check each language
    for (const lang of LANGUAGES) {
        console.log(`${colors.cyan}Checking ${lang}...${colors.reset}`);

        const translation = loadTranslation(lang);
        if (!translation) {
            hasErrors = true;
            results.push({ lang, status: 'error', missing: [], extra: [] });
            continue;
        }

        const langKeys = getAllKeys(translation).sort();

        // Find missing keys (in reference but not in this language)
        const missingKeys = referenceKeys.filter(key => !langKeys.includes(key));

        // Find extra keys (in this language but not in reference)
        const extraKeys = langKeys.filter(key => !referenceKeys.includes(key));

        if (missingKeys.length === 0 && extraKeys.length === 0) {
            console.log(`  ${colors.green}✓ Complete (${langKeys.length} keys)${colors.reset}`);
            results.push({ lang, status: 'complete', missing: [], extra: [] });
        } else {
            hasErrors = true;

            if (missingKeys.length > 0) {
                console.log(`  ${colors.red}✗ Missing ${missingKeys.length} key(s):${colors.reset}`);
                missingKeys.forEach(key => console.log(`    - ${key}`));
            }

            if (extraKeys.length > 0) {
                console.log(`  ${colors.yellow}⚠ Extra ${extraKeys.length} key(s) (not in reference):${colors.reset}`);
                extraKeys.forEach(key => console.log(`    - ${key}`));
            }

            results.push({ lang, status: 'incomplete', missing: missingKeys, extra: extraKeys });
        }

        console.log('');
    }

    // Summary
    console.log(`${colors.cyan}=== Summary ===${colors.reset}`);
    const complete = results.filter(r => r.status === 'complete').length;
    const total = LANGUAGES.length;

    if (hasErrors) {
        console.log(`${colors.red}${complete}/${total} languages complete${colors.reset}`);
        console.log(`${colors.yellow}\nPlease update the translation files to include all missing keys.${colors.reset}`);
        process.exit(1);
    } else {
        console.log(`${colors.green}All ${total} languages are complete! ✓${colors.reset}`);
        process.exit(0);
    }
}

// Run the validation
validateTranslations();
