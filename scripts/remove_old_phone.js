const fs = require('fs');
const path = require('path');

const targetPhone = '905545812034';
const oldPhone = '5066411783';
const dirs = ['/Users/hakancineli/protransfer_site/src'];

function replacePhoneInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern for formatted +90 506 641 17 83
    content = content.replace(/\+90\s*506\s*641\s*17\s*83/g, '+90 554 581 20 34');

    // Pattern for unformatted 905066411783 or 5066411783
    content = content.replace(/905066411783/g, '905545812034');
    content = content.replace(/5066411783/g, '5545812034');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated phone number in: ' + filePath);
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
            replacePhoneInFile(itemPath);
        }
    }
}

dirs.forEach(processDirectory);
console.log('Done replacing old phone number.');
