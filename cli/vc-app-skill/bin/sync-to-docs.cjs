#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ───────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..', '..', '..');
const FRAMEWORK_DIR = path.join(ROOT, 'framework');

const STORYBOOK_BASE = 'https://vc-shell-storybook.govirto.com';

// Resolve vc-docs path from --docs-path arg or VC_DOCS_PATH env or default
const docsPathArg = process.argv.find((a) => a.startsWith('--docs-path='));
const VC_DOCS_PATH =
  (docsPathArg && docsPathArg.split('=')[1]) ||
  process.env.VC_DOCS_PATH ||
  path.resolve(ROOT, '..', 'vc-docs');

const MKDOCS_YML = path.join(VC_DOCS_PATH, 'platform', 'developer-guide', 'mkdocs.yml');
const DOCS_OUT = path.join(VC_DOCS_PATH, 'platform', 'developer-guide', 'docs', 'custom-apps-development', 'vc-shell');

if (!fs.existsSync(VC_DOCS_PATH)) {
  console.error(`vc-docs repo not found at: ${VC_DOCS_PATH}`);
  console.error('Use --docs-path=/path/to/vc-docs or set VC_DOCS_PATH env var');
  process.exit(1);
}

// ─── Path mapping ────────────────────────────────────────────────────────────
// framework relative path → vc-docs relative path (under DOCS_OUT) + nav category
function mapPath(relPath) {
  const parts = relPath.replace(/\.docs\.md$/, '').split(path.sep);

  // core/composables/{name}/index → Essentials/composables/{name}.md
  // core/composables/{name}.docs.md (flat) → Essentials/composables/{name}.md
  if (parts[0] === 'core' && parts[1] === 'composables') {
    const name = parts.length >= 3 ? parts[2] : parts[1];
    return { outPath: `Essentials/composables/${name}.md`, navCategory: 'Composables' };
  }

  // core/plugins/{name}/* → Essentials/plugins/{name}.md
  if (parts[0] === 'core' && parts[1] === 'plugins') {
    const name = parts[2];
    return { outPath: `Essentials/plugins/${name}.md`, navCategory: 'Plugins' };
  }

  // core/api/* → Essentials/API-Integration/{name}.md
  if (parts[0] === 'core' && parts[1] === 'api') {
    const name = parts[parts.length - 1];
    return { outPath: `Essentials/API-Integration/${name}.md`, navCategory: null };
  }

  // core/blade-navigation/* → Essentials/composables/{name}.md
  if (parts[0] === 'core' && parts[1] === 'blade-navigation') {
    const name = parts[parts.length - 1];
    return { outPath: `Essentials/composables/${name}.md`, navCategory: 'Composables' };
  }

  // core/notifications/* → Essentials/shared/components/notifications.md
  if (parts[0] === 'core' && parts[1] === 'notifications') {
    return { outPath: 'Essentials/shared/components/notifications.md', navCategory: null };
  }

  // ui/components/{tier}/{name}/* → Essentials/ui-components/{name}.md
  // Skip internal composable docs (table-composables) — only sync the main component doc
  if (parts[0] === 'ui' && parts[1] === 'components') {
    const tier = parts[2]; // atoms, molecules, organisms
    const compDir = parts[3]; // vc-badge, vc-select, etc.
    const fileName = parts[parts.length - 1];
    if (compDir) {
      // Skip sub-directory docs (e.g. composables/table-composables.docs.md) — main doc covers these
      if (parts.length > 5) return null;
      // vc-table dir contains VcDataTable — use the actual component name
      const outName = compDir === 'vc-table' ? 'vc-data-table' : compDir;
      return { outPath: `Essentials/ui-components/${outName}.md`, navCategory: 'UI Components', tier };
    }
  }

  // ui/composables/* → skip (internal table composables)
  if (parts[0] === 'ui' && parts[1] === 'composables') {
    return null;
  }

  // shell/components/{name}/* → Essentials/shared/components/{name}.md
  if (parts[0] === 'shell' && parts[1] === 'components') {
    const name = parts[2];
    return { outPath: `Essentials/shared/components/${name}.md`, navCategory: null };
  }

  // shell/dashboard/{name}/* → Essentials/shared/components/{name}.md
  if (parts[0] === 'shell' && parts[1] === 'dashboard') {
    const name = parts[2];
    return { outPath: `Essentials/shared/components/${name}.md`, navCategory: null };
  }

  // Anything else we don't map (core/types, core/utilities, etc.)
  return null;
}

// ─── Storybook helpers ───────────────────────────────────────────────────────
function findStorybookTitle(compDir) {
  const storiesGlob = fs.readdirSync(compDir).find((f) => f.endsWith('.stories.ts'));
  if (!storiesGlob) return null;

  const content = fs.readFileSync(path.join(compDir, storiesGlob), 'utf-8');
  const match = content.match(/title:\s*["']([^"']+)["']/);
  return match ? match[1] : null;
}

function storybookTitleToId(title) {
  // "Data Display/VcBadge" → "data-display-vcbadge"
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\//g, '-');
}

function buildStorybookSection(title, componentName) {
  const id = storybookTitleToId(title);
  const displayName = componentName.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  return [
    '',
    '## Storybook',
    '',
    `[${displayName} Storybook](${STORYBOOK_BASE}/?path=/docs/${id}--docs)`,
    '',
    '<iframe',
    `  src="${STORYBOOK_BASE}/iframe.html?id=${id}--docs&viewMode=story&shortcuts=false&singleStory=true"`,
    '  width="1000"',
    '  height="500"',
    '></iframe>',
    '',
  ].join('\n');
}

// ─── Content transformation ──────────────────────────────────────────────────
function transformContent(content, mapping, frameworkRelPath) {
  let result = content;

  // If UI component, inject Storybook iframe after first heading
  if (mapping.navCategory === 'UI Components' && mapping.tier) {
    const compName = path.basename(mapping.outPath, '.md');
    const compDir = path.join(FRAMEWORK_DIR, path.dirname(frameworkRelPath));
    const storybookTitle = findStorybookTitle(compDir);

    if (storybookTitle) {
      const storySection = buildStorybookSection(storybookTitle, compName);
      // Insert after first # heading line
      result = result.replace(/^(# .+\n)/, `$1${storySection}\n`);
    }
  }

  return result;
}

// ─── Find all docs ───────────────────────────────────────────────────────────
function findDocsFiles(dir, base) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findDocsFiles(fullPath, base));
    } else if (entry.name.endsWith('.docs.md')) {
      results.push(path.relative(base, fullPath));
    }
  }
  return results;
}

// ─── Nav update helpers ──────────────────────────────────────────────────────
function extractTitle(content) {
  const match = content.match(/^# (.+)$/m);
  return match ? match[1] : null;
}

function updateNavSection(mkdocsContent, category, entries) {
  // entries: [{title, path}]
  // We update the specific nav category section in mkdocs.yml
  // This is a targeted update — find the category line and replace its children

  const lines = mkdocsContent.split('\n');
  const result = [];
  let inCategory = false;
  let categoryIndent = 0;
  let replaced = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // Find the category header (e.g., "- Composables:" or "- UI Components:")
    if (!replaced && trimmed === `- ${category}:`) {
      categoryIndent = line.length - trimmed.length;
      inCategory = true;
      result.push(line);

      // Add all entries with proper indentation
      const childIndent = ' '.repeat(categoryIndent + 6); // 6 more for child items
      const sortedEntries = entries.sort((a, b) => a.title.localeCompare(b.title));
      for (const entry of sortedEntries) {
        result.push(`${childIndent}- ${entry.title}: ${entry.navPath}`);
      }
      replaced = true;
      continue;
    }

    // Skip old children of this category
    if (inCategory) {
      const lineIndent = line.length - line.trimStart().length;
      if (line.trim() === '' || lineIndent > categoryIndent) {
        // Still inside category children, skip
        if (line.trim().startsWith('-') && lineIndent > categoryIndent) {
          continue;
        }
      }
      if (line.trim() !== '' && (line.length - line.trimStart().length) <= categoryIndent) {
        inCategory = false;
        // This line belongs to next section, keep it
        result.push(line);
        continue;
      }
      if (line.trim() === '') {
        continue;
      }
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────
const frameworkDocs = findDocsFiles(FRAMEWORK_DIR, FRAMEWORK_DIR);

let synced = 0;
let skipped = 0;
let unmapped = 0;

// Track nav entries per category
const navEntries = {
  Composables: [],
  Plugins: [],
  'UI Components': [],
};

// Pre-populate nav entries from existing mkdocs.yml to preserve manual entries
// (we only update categories we manage)

const NAV_PREFIX = 'custom-apps-development/vc-shell/';

for (const relPath of frameworkDocs) {
  const mapping = mapPath(relPath);
  if (!mapping) {
    unmapped++;
    continue;
  }

  const src = path.join(FRAMEWORK_DIR, relPath);
  const dest = path.join(DOCS_OUT, mapping.outPath);
  const srcContent = fs.readFileSync(src, 'utf-8');

  // Transform content
  const transformed = transformContent(srcContent, mapping, relPath);

  // Check if dest is identical
  if (fs.existsSync(dest)) {
    const destContent = fs.readFileSync(dest, 'utf-8');
    if (destContent === transformed) {
      skipped++;
      // Still collect nav entry
      if (mapping.navCategory && navEntries[mapping.navCategory]) {
        const title = extractTitle(srcContent) || path.basename(mapping.outPath, '.md');
        navEntries[mapping.navCategory].push({
          title,
          navPath: NAV_PREFIX + mapping.outPath,
        });
      }
      continue;
    }
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, transformed);
  console.log(`  synced: ${relPath} → ${mapping.outPath}`);
  synced++;

  // Collect nav entry
  if (mapping.navCategory && navEntries[mapping.navCategory]) {
    const title = extractTitle(srcContent) || path.basename(mapping.outPath, '.md');
    navEntries[mapping.navCategory].push({
      title,
      navPath: NAV_PREFIX + mapping.outPath,
    });
  }
}

// Update mkdocs.yml nav sections
if (fs.existsSync(MKDOCS_YML)) {
  let mkdocsContent = fs.readFileSync(MKDOCS_YML, 'utf-8');
  let navUpdated = false;

  for (const [category, entries] of Object.entries(navEntries)) {
    if (entries.length === 0) continue;

    const before = mkdocsContent;
    mkdocsContent = updateNavSection(mkdocsContent, category, entries);
    if (mkdocsContent !== before) navUpdated = true;
  }

  if (navUpdated) {
    fs.writeFileSync(MKDOCS_YML, mkdocsContent);
    console.log(`\n  mkdocs.yml nav updated`);
  }
}

// ─── Mark orphaned docs ──────────────────────────────────────────────────────
// Docs in vc-docs that no longer have a source in framework get a deprecation banner
const DEPRECATION_BANNER = [
  '!!! warning "Deprecated"',
  '    This API has been removed from the current version of the framework.',
  '    This page is kept for reference only. Do not use in new code.',
  '',
].join('\n');

const managedDirs = [
  path.join(DOCS_OUT, 'Essentials', 'composables'),
  path.join(DOCS_OUT, 'Essentials', 'plugins'),
  path.join(DOCS_OUT, 'Essentials', 'ui-components'),
];

// Build set of all output paths we just synced
const syncedOutPaths = new Set();
for (const relPath of frameworkDocs) {
  const mapping = mapPath(relPath);
  if (mapping) syncedOutPaths.add(path.join(DOCS_OUT, mapping.outPath));
}

let deprecated = 0;
for (const dir of managedDirs) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(dir, file);
    if (syncedOutPaths.has(filePath)) continue;

    // File exists in vc-docs but not in framework — mark as deprecated
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('This API has been removed')) continue; // already marked

    fs.writeFileSync(filePath, DEPRECATION_BANNER + '\n' + content);
    const relFile = path.relative(DOCS_OUT, filePath);
    console.log(`  deprecated: ${relFile}`);
    deprecated++;
  }
}

console.log(`\nSync to vc-docs complete: ${synced} synced, ${skipped} unchanged, ${unmapped} unmapped, ${deprecated} deprecated`);
