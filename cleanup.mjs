import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIR = path.join(__dirname, 'src/features/admin');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filepath));
        } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
            results.push(filepath);
        }
    });
    return results;
}

const files = walk(DIR);

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Remove hook imports
    content = content.replace(/import\s*\{\s*useAdminTheme\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '');
    
    // 2. Remove const { isDark } = useAdminTheme();
    content = content.replace(/(?:\s*)const\s*\{\s*isDark\s*\}\s*=\s*useAdminTheme\([^)]*\);?\n?/g, '');
    
    // 3. Replace isDark ? A : B
    // A VERY CAREFUL REGEX logic to match specific ternary strings found via grep
    // Case 1: isDark ? "something" : "something else"
    content = content.replace(/isDark\s*\?\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, '"$2"');
    
    // Case 2: isDark ? 'something' : 'something else'
    content = content.replace(/isDark\s*\?\s*'([^'\\]*(?:\\.[^'\\]*)*)'\s*:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, "'$2'");
    
    // Case 3: isDark ? `...` : `...`
    content = content.replace(/isDark\s*\?\s*`([^`\\]*(?:\\.[^`\\]*)*)`\s*:\s*`([^`\\]*(?:\\.[^`\\]*)*)`/g, '`$2`');

    // Case 4: ${isDark ? "A" : "B"}
    content = content.replace(/\$\{isDark\s*\?\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"\}/g, '$2');
    content = content.replace(/\$\{isDark\s*\?\s*'([^'\\]*(?:\\.[^'\\]*)*)'\s*:\s*'([^'\\]*(?:\\.[^'\\]*)*)'\}/g, '$2');

    // Case 5: ${isDark ? `A` : `B`}
    content = content.replace(/\$\{isDark\s*\?\s*`([^`\\]*(?:\\.[^`\\]*)*)`\s*:\s*`([^`\\]*(?:\\.[^`\\]*)*)`\}/g, '$2');

    // 4. Red to Blue replacements
    content = content.replace(/bg-red-/g, 'bg-blue-');
    content = content.replace(/text-red-/g, 'text-blue-');
    content = content.replace(/border-red-/g, 'border-blue-');
    content = content.replace(/hover:bg-red-/g, 'hover:bg-blue-');
    content = content.replace(/hover:border-red-/g, 'hover:border-blue-');
    content = content.replace(/hover:text-red-/g, 'hover:text-blue-');
    content = content.replace(/shadow-red-/g, 'shadow-blue-');
    content = content.replace(/shadow-\[0_0_50px_rgba\(239,68,68/g, 'shadow-[0_0_50px_rgba(37,99,235'); // specific shadow in Analytics
    content = content.replace(/from-red-/g, 'from-blue-');
    content = content.replace(/to-red-/g, 'to-blue-');
    content = content.replace(/ring-red-/g, 'ring-blue-');
    content = content.replace(/#ef4444/g, '#2563eb');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
}
