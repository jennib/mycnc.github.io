#!/usr/bin/env node

/**
 * Translation Completeness Checker for Editor App
 */

const fs = require('fs');
const path = require('path');

// Point to apps/editor locales
const LOCALES_DIR = path.join(__dirname, '..', '..', 'editor', 'src', 'renderer', 'locales');
const REFERENCE_LANG = 'en';
const LANGUAGES = ['bn', 'de', 'es', 'fr', 'hi', 'ja', 'pa', 'uk', 'zh'];

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

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

function validateTranslations() {
    console.log(`${colors.cyan}=== Editor Translation Completeness Check ===${colors.reset}\n`);

    const referenceTranslation = loadTranslation(REFERENCE_LANG);
    if (!referenceTranslation) {
        console.error(`${colors.red}Failed to load reference translation (${REFERENCE_LANG}). Aborting.${colors.reset}`);
        process.exit(1);
    }

    const referenceKeys = getAllKeys(referenceTranslation).sort();
    console.log(`${colors.blue}Reference (${REFERENCE_LANG}): ${referenceKeys.length} keys found${colors.reset}\n`);

    let hasErrors = false;
    const results = [];

    for (const lang of LANGUAGES) {
        console.log(`${colors.cyan}Checking ${lang}...${colors.reset}`);

        const translation = loadTranslation(lang);
        if (!translation) {
            hasErrors = true;
            results.push({ lang, status: 'error', missing: [], extra: [] });
            continue;
        }

        const langKeys = getAllKeys(translation).sort();
        const missingKeys = referenceKeys.filter(key => !langKeys.includes(key));
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
                console.log(`  ${colors.yellow}⚠ Extra ${extraKeys.length} key(s)${colors.reset}`);
                extraKeys.forEach(key => console.log(`    - ${key}`));
            }
            results.push({ lang, status: 'incomplete', missing: missingKeys, extra: extraKeys });
        }
        console.log('');
    }

    // Write report to apps/editor/translation_report.txt
    let report = `=== Editor Translation Completeness Check ===\n\nReference (${REFERENCE_LANG}): ${referenceKeys.length} keys found\n\n`;
    results.forEach(r => {
        if (r.status === 'complete') {
            report += `✓ ${r.lang}: Complete\n`;
        } else {
            report += `✗ ${r.lang}: Incomplete\n`;
            if (r.missing.length > 0) {
                report += `  Missing ${r.missing.length} key(s):\n`;
                r.missing.forEach(k => report += `    - ${k}\n`);
            }
        }
        report += '\n';
    });

    const reportPath = path.join(LOCALES_DIR, '..', '..', '..', 'translation_report.txt');
    fs.writeFileSync(reportPath, report);
    console.log(`Report written to ${reportPath}`);

    if (hasErrors) {
        console.log(`${colors.red}Incomplete translations found.${colors.reset}`);
        process.exit(1);
    } else {
        console.log(`${colors.green}All languages complete!${colors.reset}`);
        process.exit(0);
    }
}

validateTranslations();
