const fs = require('fs');
const path = require('path');

// Attempt to find brand image files in Downloads using flexible matching
// This helps when filenames differ slightly (e.g., "Burger King.png" or "bk-logo.png")
const homedir = require('os').homedir();
const downloads = path.join(homedir, 'Downloads');
const targetDir = path.join(process.cwd(), 'public', 'images');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const brands = [
  { id: 'mcd', dest: 'mcd.png', patterns: ['mcdonald', 'mcd'] },
  { id: 'bk', dest: 'bk.png', patterns: ['burger', 'burger-king', 'burgerking', 'bk'] },
  { id: 'wendys', dest: 'wendys.png', patterns: ['wendy', 'wendys'] },
  { id: 'kfc', dest: 'kfc.png', patterns: ['kfc'] },
];

function findInDownloads(patterns) {
  try {
    const items = fs.readdirSync(downloads);
    const lowered = items.map(i => ({ name: i, low: i.toLowerCase() }));
    for (const p of patterns) {
      const needle = p.toLowerCase();
        // prefer PNG first, then SVG
        const png = lowered.find(it => it.low.includes(needle) && /\.png$/i.test(it.name));
        if (png) return path.join(downloads, png.name);
        const svg = lowered.find(it => it.low.includes(needle) && /\.svg$/i.test(it.name));
        if (svg) return path.join(downloads, svg.name);
    }
    return null;
  } catch (err) {
    return null;
  }
}

let anyCopied = false;

brands.forEach(b => {
  try {
    const found = findInDownloads(b.patterns);
    if (found) {
      const ext = path.extname(found).toLowerCase();
      const destName = b.dest.replace(/\.png$/, ext === '.svg' ? '.svg' : '.png');
      const dest = path.join(targetDir, destName);
      fs.copyFileSync(found, dest);
      console.log(`Copied ${found} -> ${dest}`);
      anyCopied = true;
    } else {
      console.warn(`No matching file found in Downloads for ${b.id} (patterns: ${b.patterns.join(', ')})`);
    }
  } catch (err) {
    console.error(`Failed copying for ${b.id}:`, err.message || err);
  }
});

if (!anyCopied) {
  console.log('No files copied. Please place your icons (named or similar to mcd, bk, wendys, kfc) in your Downloads folder and run `npm run install-icons`.');
} else {
  console.log('Done. You can now run `npm start` and your local icons will be used.');
}
