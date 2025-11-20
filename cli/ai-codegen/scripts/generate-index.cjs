#!/usr/bin/env node

/**
 * Script to generate examples/index.yaml from all markdown files with frontmatter
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const examplesDir = path.join(__dirname, '../src/examples');
const indexPath = path.join(examplesDir, 'index.yaml');

// Parse frontmatter from markdown file
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatterMatch) {
    return null;
  }

  try {
    return yaml.parse(frontmatterMatch[1]);
  } catch (error) {
    return null;
  }
}

// Find all markdown files with frontmatter
function findExamplesWithMetadata(dir) {
  const examples = {
    capabilities: {},
    patterns: [],
    compositions: [],
    framework: [],
    templates: [],
    components: [],
    pages: [],
    api: [],
  };

  function traverse(currentDir, relativePath = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, dist, etc.
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          traverse(fullPath, relPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const frontmatter = parseFrontmatter(content);

          if (!frontmatter) {
            // console.warn(`⚠️  No frontmatter: ${relPath}`);
            continue;
          }

          const metadata = {
            id: frontmatter.id,
            file: relPath,
            type: frontmatter.type,
            complexity: frontmatter.complexity || 'SIMPLE',
          };

          // Add optional fields
          if (frontmatter.component) metadata.component = frontmatter.component;
          if (frontmatter.category) metadata.category = frontmatter.category;
          if (frontmatter.tags && frontmatter.tags.length > 0) metadata.tags = frontmatter.tags;
          if (frontmatter.critical) metadata.critical = frontmatter.critical;
          if (frontmatter.related_rules && frontmatter.related_rules.length > 0) {
            metadata.related_rules = frontmatter.related_rules;
          }
          if (frontmatter.title) metadata.title = frontmatter.title;
          if (frontmatter.description) metadata.description = frontmatter.description;

          // Categorize by type and path
          if (relPath.startsWith('capabilities/')) {
            const component = frontmatter.component;
            if (component) {
              if (!examples.capabilities[component]) {
                examples.capabilities[component] = [];
              }
              examples.capabilities[component].push(metadata);
            }
          } else if (relPath.startsWith('patterns/')) {
            examples.patterns.push(metadata);
          } else if (relPath.startsWith('compositions/')) {
            examples.compositions.push(metadata);
          } else if (relPath.startsWith('framework/')) {
            examples.framework.push(metadata);
          } else if (relPath.startsWith('templates/')) {
            examples.templates.push(metadata);
          } else if (relPath.startsWith('components/')) {
            examples.components.push(metadata);
          } else if (relPath.startsWith('pages/')) {
            examples.pages.push(metadata);
          } else if (relPath.startsWith('api/')) {
            examples.api.push(metadata);
          }
        } catch (error) {
          console.error(`❌ Error processing ${relPath}:`, error.message);
        }
      }
    }
  }

  traverse(dir);
  return examples;
}

// Generate index.yaml
function generateIndex() {
  console.log('🔍 Scanning example files...\n');

  const examples = findExamplesWithMetadata(examplesDir);

  // Sort components alphabetically
  const sortedCapabilities = {};
  Object.keys(examples.capabilities)
    .sort()
    .forEach(key => {
      sortedCapabilities[key] = examples.capabilities[key];
    });

  // Sort patterns by critical first, then alphabetically
  examples.patterns.sort((a, b) => {
    if (a.critical && !b.critical) return -1;
    if (!a.critical && b.critical) return 1;
    return a.id.localeCompare(b.id);
  });

  // Sort compositions by category
  examples.compositions.sort((a, b) => {
    const catCompare = (a.category || '').localeCompare(b.category || '');
    if (catCompare !== 0) return catCompare;
    return a.id.localeCompare(b.id);
  });

  // Sort framework by critical first
  examples.framework.sort((a, b) => {
    if (a.critical && !b.critical) return -1;
    if (!a.critical && b.critical) return 1;
    return a.id.localeCompare(b.id);
  });

  const index = {
    capabilities: sortedCapabilities,
    patterns: examples.patterns,
    compositions: examples.compositions,
    framework: examples.framework,
  };

  // Add optional sections if they exist
  if (examples.templates.length > 0) {
    index.templates = examples.templates;
  }
  if (examples.components.length > 0) {
    index.components = examples.components;
  }
  if (examples.pages.length > 0) {
    index.pages = examples.pages;
  }
  if (examples.api.length > 0) {
    index.api = examples.api;
  }

  // Write to file
  const yamlContent = yaml.stringify(index, {
    indent: 2,
    lineWidth: 120,
  });

  fs.writeFileSync(indexPath, yamlContent, 'utf8');

  // Print statistics
  console.log('📊 Generated index with:');
  console.log(`   📦 Components: ${Object.keys(sortedCapabilities).length}`);

  let totalCapabilities = 0;
  Object.values(sortedCapabilities).forEach(caps => {
    totalCapabilities += caps.length;
  });
  console.log(`   🔧 Capabilities: ${totalCapabilities}`);

  console.log(`   📋 Patterns: ${examples.patterns.length} (${examples.patterns.filter(p => p.critical).length} critical)`);
  console.log(`   🎼 Compositions: ${examples.compositions.length}`);
  console.log(`   🛠️  Framework APIs: ${examples.framework.length} (${examples.framework.filter(f => f.critical).length} critical)`);

  if (examples.templates.length > 0) {
    console.log(`   📄 Templates: ${examples.templates.length}`);
  }
  if (examples.components.length > 0) {
    console.log(`   🧩 Components: ${examples.components.length}`);
  }
  if (examples.pages.length > 0) {
    console.log(`   📃 Pages: ${examples.pages.length}`);
  }
  if (examples.api.length > 0) {
    console.log(`   🌐 API: ${examples.api.length}`);
  }

  const total = totalCapabilities + examples.patterns.length + examples.compositions.length +
                examples.framework.length + examples.templates.length + examples.components.length +
                examples.pages.length + examples.api.length;

  console.log(`   📝 Total: ${total} examples`);
  console.log(`\n✅ Index saved to: ${path.relative(process.cwd(), indexPath)}`);
}

// Run
try {
  generateIndex();
  console.log('\n🎉 Index generation complete!');
} catch (error) {
  console.error('\n❌ Error generating index:', error);
  process.exit(1);
}
