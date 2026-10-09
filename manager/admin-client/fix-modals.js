const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fast check if it needs createPortal
    if (content.includes('fixed inset-0') && !content.includes('createPortal')) {
        // Add import if not exists
        if (!content.includes("from 'react-dom'")) {
            content = content.replace("import { useState", "import { useState }\nimport { createPortal } from 'react-dom'");
            if (content.includes("import { createPortal }") && !changed) changed = true;
        }

        // Try to find the common modal pattern: {modal && ( <div className="fixed inset-0...
        // This is a naive but often effective regex if formatted consistently
        const modalRegex = /\{([a-zA-Z0-9_]+)\s*&&\s*\(\s*(<div[^>]*className="[^"]*fixed inset-0[^>]*>[\s\S]*?)(\s*)\)\}/g;
        
        let newContent = content.replace(modalRegex, (match, condition, divContent, spaces) => {
            // Check if it's already using createPortal (just in case)
            if (match.includes('createPortal')) return match;
            
            // Upgrade z-50 to z-[100] to ensure it's always on top
            let updatedDiv = divContent.replace(/z-50/g, 'z-[100]');
            
            // Check if it has an absolute inset-0 backdrop, if not, it might have bg-black/50 on the fixed container.
            // We'll leave the HTML structure alone to not break the app, but wrap it in createPortal.
            return `{${condition} && createPortal(\n${updatedDiv}${spaces}, document.body\n)}`;
        });

        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Fixed:', path.basename(filePath));
        }
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'src/pages'));
console.log('Done fixing modals!');
