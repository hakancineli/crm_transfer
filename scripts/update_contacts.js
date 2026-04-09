const fs = require('fs');
const path = require('path');

const dirs = ['/Users/hakancineli/protransfer_site/src', '/Users/hakancineli/protransfer_site/messages'];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/\+90 506 641 17 85/g, '+90 554 581 20 34');
    content = content.replace(/506 641 17 85/g, '554 581 20 34');
    content = content.replace(/905066411785/g, '905545812034');
    content = content.replace(/\+905066411785/g, '+905545812034');
    content = content.replace(/5066411785/g, '5545812034');

    content = content.replace(/\+90 555 555 55 55/g, '+90 554 581 20 34');
    content = content.replace(/905555555555/g, '905545812034');
    content = content.replace(/\+905555555555/g, '+905545812034');

    content = content.replace(/info@protransfer\.com\.tr/g, 'hakancinelii@gmail.com');
    content = content.replace(/seyfettin@protransfer\.com\.tr/g, 'hakancinelii@gmail.com');
    content = content.replace(/info@protransfer\.com/g, 'hakancinelii@gmail.com');
    content = content.replace(/seyfettin@protransfer\.com/g, 'hakancinelii@gmail.com');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
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
        } else if (stat.isFile() && /\.(tsx|ts|json|js|jsx)$/.test(itemPath)) {
            replaceInFile(itemPath);
        }
    }
}

dirs.forEach(processDirectory);
console.log('Done replacing contacts.');
