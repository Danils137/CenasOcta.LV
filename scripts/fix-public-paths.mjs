import { promises as fs } from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const allowedExts = new Set(['.html', '.js', '.css', '.json']);
const replacements = [
  { from: /"\/_expo\//g, to: '"./_expo/' },
  { from: /'\/_expo\//g, to: "'./_expo/" },
  { from: /"\/assets\//g, to: '"./assets/' },
  { from: /'\/assets\//g, to: "'./assets/" },
  { from: /\(\/_expo\//g, to: '(./_expo/' },
  { from: /\(\/assets\//g, to: '(./assets/' },
];

async function fileExists(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch (_) {
    return false;
  }
}

async function walk(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else if (allowedExts.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function applyReplacements(content) {
  let next = content;
  for (const { from, to } of replacements) {
    next = next.replace(from, to);
  }
  return next;
}

async function main() {
  if (!(await fileExists(distDir))) {
    console.warn('[fix-public-paths] dist folder not found, skipping');
    return;
  }

  const files = await walk(distDir);
  let changed = 0;

  for (const file of files) {
    const original = await fs.readFile(file, 'utf8');
    const updated = applyReplacements(original);
    if (updated !== original) {
      await fs.writeFile(file, updated, 'utf8');
      changed += 1;
    }
  }

  console.log([fix-public-paths] updated  file(s));
}

main().catch((err) => {
  console.error('[fix-public-paths] failed:', err);
  process.exitCode = 1;
});
