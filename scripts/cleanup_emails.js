const fs = require('fs');
const path = require('path');

const targetEmail = 'hakancinelii@gmail.com';
const dirs = ['/Users/hakancineli/protransfer_site/src'];

function replaceEmailInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern for any email ending in @protransfer.com.tr
    content = content.replace(/[a-zA-Z0-9._%+-]+@protransfer\.com\.tr/g, targetEmail);

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated email address in: ' + filePath);
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
            replaceEmailInFile(itemPath);
        }
    }
}

dirs.forEach(processDirectory);
console.log('Done replacing email addresses.');
