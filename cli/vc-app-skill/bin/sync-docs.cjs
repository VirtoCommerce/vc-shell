#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const FRAMEWORK_DIR = path.join(ROOT, 'framework');
const DOCS_DIR = path.join(__dirname, '..', 'runtime', 'knowledge', 'docs');

function findDocsFiles(dir, base) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(base, fullPath);
    if (entry.isDirectory()) {
      results.push(...findDocsFiles(fullPath, base));
    } else if (entry.name.endsWith('.docs.md')) {
      results.push(relPath);
    }
  }
  return results;
}

// Collect framework docs
const frameworkDocs = findDocsFiles(FRAMEWORK_DIR, FRAMEWORK_DIR);

let copied = 0;
let skipped = 0;

for (const relPath of frameworkDocs) {
  const src = path.join(FRAMEWORK_DIR, relPath);
  const dest = path.join(DOCS_DIR, relPath);

  // Skip if dest is identical
  if (fs.existsSync(dest)) {
    const srcContent = fs.readFileSync(src);
    const destContent = fs.readFileSync(dest);
    if (srcContent.equals(destContent)) {
      skipped++;
      continue;
    }
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`  updated: ${relPath}`);
  copied++;
}

// Remove docs that no longer exist in framework
const skillDocs = findDocsFiles(DOCS_DIR, DOCS_DIR);
let removed = 0;
for (const relPath of skillDocs) {
  if (!fs.existsSync(path.join(FRAMEWORK_DIR, relPath))) {
    fs.unlinkSync(path.join(DOCS_DIR, relPath));
    console.log(`  removed: ${relPath}`);
    removed++;
  }
}

console.log(`\nSync complete: ${copied} updated, ${removed} removed, ${skipped} unchanged`);
