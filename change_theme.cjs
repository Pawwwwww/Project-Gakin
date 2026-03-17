const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let orig = content;
            
            content = content.replace(/bg-\[\#0a0a0a\]/g, 'bg-gray-50');
            content = content.replace(/bg-\[\#111111\]\/80/g, 'bg-white/80');
            content = content.replace(/bg-\[\#111111\]\/50/g, 'bg-white/80');
            content = content.replace(/bg-\[\#111111\]/g, 'bg-white');
            content = content.replace(/border-white\/5/g, 'border-gray-200');
            content = content.replace(/border-white\/10/g, 'border-gray-200');
            content = content.replace(/border-white\/20/g, 'border-gray-200');
            content = content.replace(/text-gray-200/g, 'text-gray-800');
            content = content.replace(/text-gray-300/g, 'text-gray-700');
            content = content.replace(/text-gray-400/g, 'text-gray-500');
            
            content = content.replace(/\bbg-white\/5\b/g, 'bg-white shadow-sm');
            content = content.replace(/\bbg-white\/10\b/g, 'bg-gray-50');
            
            content = content.replace(/hover:bg-white\/10/g, 'hover:bg-gray-50');
            content = content.replace(/hover:bg-white\/5/g, 'hover:bg-gray-50');
            
            content = content.replace(/text-white font-bold/g, 'text-gray-900 font-bold');
            content = content.replace(/text-white text-sm/g, 'text-gray-900 text-sm');
            content = content.replace(/text-white text-xs/g, 'text-gray-900 text-xs');
            content = content.replace(/text-white truncate/g, 'text-gray-900 truncate');
            content = content.replace(/text-white leading-tight/g, 'text-gray-900 leading-tight');
            content = content.replace(/text-white\/80/g, 'text-gray-600');
            content = content.replace(/text-white\/70/g, 'text-gray-500');
            content = content.replace(/text-white\/60/g, 'text-gray-500');
            content = content.replace(/text-white\/50/g, 'text-gray-400');
            content = content.replace(/text-white\/40/g, 'text-gray-400');

            if (content !== orig) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

processDir(path.join(__dirname, 'src/features/admin'));
console.log('Done!');
