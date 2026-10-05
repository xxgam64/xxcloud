import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const rootDir = process.cwd();

// 1. Copy dist/assets to root/assets if exists
const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(rootDir, 'assets');

if (fs.existsSync(distAssets)) {
  fs.mkdirSync(rootAssets, { recursive: true });
  const assetFiles = fs.readdirSync(distAssets);
  for (const file of assetFiles) {
    fs.copyFileSync(path.join(distAssets, file), path.join(rootAssets, file));
  }
  console.log(`Copied ${assetFiles.length} asset files to root /assets`);
}

// 2. Synchronize root index.html to 404.html for GitHub Pages SPA routing
const rootIndex = path.join(rootDir, 'index.html');
if (fs.existsSync(rootIndex)) {
  const content = fs.readFileSync(rootIndex, 'utf-8');
  fs.writeFileSync(path.join(rootDir, '404.html'), content, 'utf-8');
  console.log('Synchronized root 404.html for GitHub Pages routing');
}

// 3. Ensure root .nojekyll exists
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '', 'utf-8');
console.log('Ensured root .nojekyll exists');
