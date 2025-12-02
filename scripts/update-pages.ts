import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const pages = [
  'app/equipment/page.tsx',
  'app/equipment/[id]/page.tsx',
  'app/maintenance/page.tsx',
  'app/maintenance/[id]/page.tsx',
  'app/departments/page.tsx',
  'app/departments/[id]/page.tsx',
  'app/schedule/page.tsx',
  'app/reports/page.tsx',
];

const rootDir = join(__dirname, '..');

pages.forEach((pagePath) => {
  const fullPath = join(rootDir, pagePath);

  try {
    let content = readFileSync(fullPath, 'utf-8');

    // Remove Navigation import
    content = content.replace(/import\s+{\s*Navigation\s*}\s+from\s+["']@\/components\/navigation["'];?\n?/g, '');

    // Remove the entire wrapper div with Navigation and adjust layout
    // Pattern 1: <div className="flex h-screen bg-background"><Navigation />
    content = content.replace(
      /<div className="flex h-screen bg-background">\s*<Navigation \/>\s*<div className="flex-1 flex flex-col overflow-hidden">\s*<div className="flex-1 overflow-auto p-6">/g,
      '<div className="flex-1 space-y-4 overflow-auto">'
    );

    // Remove closing tags (3 divs)
    const lines = content.split('\n');
    let divCount = 0;
    let inReturn = false;
    let modified = false;

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();

      if (line.includes('return (')) {
        inReturn = true;
      }

      if (inReturn && line === '</div>' && !modified) {
        divCount++;
        if (divCount === 3) {
          // Remove this line and the two before it
          lines.splice(i, 1);
          modified = true;
        }
      }

      if (line.includes('export default function')) {
        break;
      }
    }

    content = lines.join('\n');

    writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Updated: ${pagePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${pagePath}:`, error);
  }
});

console.log('\n✨ All pages updated!');
