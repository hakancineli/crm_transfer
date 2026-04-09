const fs = require('fs');
const path = require('path');

const targetPhone = '905545812034';
const dirs = ['/Users/hakancineli/protransfer_site/src'];

function replaceWaMeInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Matches href="https://wa.me/..." or href={`https://wa.me/...`}
    content = content.replace(/wa\.me\/[0-9]+/g, `wa.me/${targetPhone}`);

    // For template literals like wa.me/${variable}
    content = content.replace(/wa\.me\/\$\{[^}]+\}/g, `wa.me/${targetPhone}`);

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated wa.me links in: ' + filePath);
    }
}

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
            processDirectory(itemPath);
        } else if (stat.isFile() && /\.(tsx|ts|js|jsx)$/.test(itemPath)) {
            replaceWaMeInFile(itemPath);
        }
    }
}

dirs.forEach(processDirectory);
console.log('Done replacing wa.me links.');
