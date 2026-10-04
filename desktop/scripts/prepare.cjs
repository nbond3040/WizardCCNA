/** Copies the production web build (../dist) into ./web so the desktop shell can serve it. */
const fs = require('node:fs');
const path = require('node:path');

const src = path.join(__dirname, '..', '..', 'dist');
const dest = path.join(__dirname, '..', 'web');

if (!fs.existsSync(path.join(src, 'index.html'))) {
  console.error('dist/index.html not found. Run "npm run build" in the repository root first.');
  process.exit(1);
}
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);
console.log(`Copied ${count(dest)} files from dist/ to desktop/web/`);
