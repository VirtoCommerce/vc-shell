#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'runtime', 'knowledge');

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function findFiles(dir, ext, base) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(full, ext, base));
    } else if (entry.name.endsWith(ext)) {
      results.push(path.relative(base, full));
    }
  }
  return results.sort();
}

function analyzeDoc(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const title = (lines.find(l => l.startsWith('# ')) || '').replace('# ', '');
  const hasWhenToUse = /^## When to Use/m.test(content);
  const hasSlots = /^## Slots/m.test(content);
  const hasQuickStart = /^## Quick Start/m.test(content);
  const codeBlocks = (content.match(/```/g) || []).length / 2;
  return { title, lines: lines.length, hasWhenToUse, hasSlots, hasQuickStart, codeBlocks: Math.floor(codeBlocks) };
}

function analyzePattern(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const title = (lines.find(l => l.startsWith('# ')) || '').replace('# ', '');
  const sections = lines.filter(l => l.startsWith('## ')).map(l => l.replace('## ', ''));
  const codeBlocks = (content.match(/```/g) || []).length / 2;
  return { title, lines: lines.length, sections, codeBlocks: Math.floor(codeBlocks) };
}

// --- Docs ---
const docsDir = path.join(KNOWLEDGE_DIR, 'docs');
const docFiles = findFiles(docsDir, '.docs.md', docsDir);

console.log(bold('\n📚 DOCS') + dim(` (${docsDir})`));
console.log(dim('─'.repeat(80)));

const docCategories = {};
for (const f of docFiles) {
  const cat = f.split(path.sep)[0]; // core, ui, shell, modules
  if (!docCategories[cat]) docCategories[cat] = [];
  docCategories[cat].push(f);
}

let totalDocs = 0;
let withWhenToUse = 0;
let withSlots = 0;
let withQuickStart = 0;

for (const [cat, files] of Object.entries(docCategories)) {
  console.log(`\n  ${bold(cat.toUpperCase())} ${dim(`(${files.length} files)`)}`);
  for (const f of files) {
    const info = analyzeDoc(path.join(docsDir, f));
    totalDocs++;
    if (info.hasWhenToUse) withWhenToUse++;
    if (info.hasSlots) withSlots++;
    if (info.hasQuickStart) withQuickStart++;

    const flags = [
      info.hasWhenToUse ? green('WtU') : red('WtU'),
      info.hasSlots ? green('Slt') : dim('Slt'),
      info.hasQuickStart ? green('QS') : dim('QS'),
    ].join(' ');

    const name = info.title || path.basename(f, '.docs.md');
    console.log(`    ${flags}  ${dim(`${String(info.lines).padStart(4)}L ${String(info.codeBlocks).padStart(2)}ex`)}  ${name}`);
  }
}

console.log(dim('\n─'.repeat(80)));
console.log(`  Total: ${bold(totalDocs)} docs | When to Use: ${withWhenToUse}/${totalDocs} | Slots: ${withSlots}/${totalDocs} | Quick Start: ${withQuickStart}/${totalDocs}`);

// --- Patterns ---
const patternsDir = path.join(KNOWLEDGE_DIR, 'patterns');
const patternFiles = findFiles(patternsDir, '.md', patternsDir).filter(f => f !== '.gitkeep');

console.log(bold('\n🧩 PATTERNS') + dim(` (${patternsDir})`));
console.log(dim('─'.repeat(80)));

for (const f of patternFiles) {
  const info = analyzePattern(path.join(patternsDir, f));
  console.log(`  ${dim(`${String(info.lines).padStart(4)}L ${String(info.codeBlocks).padStart(2)}ex`)}  ${bold(info.title || f)}`);
  console.log(`         ${dim(info.sections.join(' → '))}`);
}

console.log(dim('\n─'.repeat(80)));
console.log(`  Total: ${bold(patternFiles.length)} patterns`);

// --- Examples ---
const examplesDir = path.join(KNOWLEDGE_DIR, 'examples');
const exampleFiles = findFiles(examplesDir, '.md', examplesDir);

console.log(bold('\n📝 EXAMPLES') + dim(` (${examplesDir})`));
console.log(dim('─'.repeat(80)));

for (const f of exampleFiles) {
  const content = fs.readFileSync(path.join(examplesDir, f), 'utf-8');
  const lines = content.split('\n');
  const title = (lines.find(l => l.startsWith('# ')) || '').replace('# ', '');
  console.log(`  ${dim(`${String(lines.length).padStart(4)}L`)}  ${title || f}`);
}

console.log(dim('\n─'.repeat(80)));
console.log(`  Total: ${bold(exampleFiles.length)} examples`);

// --- Summary ---
const totalKB = Math.round(docFiles.concat(patternFiles, exampleFiles)
  .reduce((sum, f) => {
    const dir = f.endsWith('.docs.md') ? docsDir : patternFiles.includes(f) ? patternsDir : examplesDir;
    try { return sum + fs.statSync(path.join(dir, f)).size; } catch { return sum; }
  }, 0) / 1024);

console.log(bold('\n📊 SUMMARY'));
console.log(dim('─'.repeat(80)));
console.log(`  ${bold(totalDocs)} docs + ${bold(patternFiles.length)} patterns + ${bold(exampleFiles.length)} examples = ${bold(totalDocs + patternFiles.length + exampleFiles.length)} knowledge files (${totalKB} KB)`);
console.log(`  Coverage: When to Use ${bold(Math.round(withWhenToUse/totalDocs*100)+'%')} | Slots ${bold(Math.round(withSlots/totalDocs*100)+'%')} | Quick Start ${bold(Math.round(withQuickStart/totalDocs*100)+'%')}`);
console.log('');
