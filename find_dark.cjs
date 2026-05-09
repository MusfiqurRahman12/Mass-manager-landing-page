const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let count = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /className\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|\{([^}]*)\})/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const classStr = match[1] || match[2] || match[3] || '';
    // Look for bold/semibold classes that often imply titles/headers
    // and check if they have a base text color but no dark mode text color
    const hasBold = /font-(bold|semibold|medium)/.test(classStr);
    const hasBaseText = /text-(neutral|gray|slate|zinc|stone)-[789]00/.test(classStr);
    const hasDarkText = /dark:text-/.test(classStr);
    
    // Also catch cases where no text color is specified at all but it's a bold header
    // (browser default is black, which fails in dark mode if parent isn't white-text)
    const isHeaderTag = /<h[1-6]|<span|<p/.test(content.substring(Math.max(0, match.index - 50), match.index));

    if (hasBold && !hasDarkText && (hasBaseText || isHeaderTag)) {
        // Exclude some common cases that might not need it (e.g. within a colored badge)
        if (!/bg-(primary|secondary|success|error|warning|info|indigo|blue|green|red|purple|orange)/.test(classStr)) {
            console.log(file + ' MATCH: ' + classStr.trim().replace(/\n/g, ' '));
            count++;
        }
    }
  }
});
console.log('Total:', count);
