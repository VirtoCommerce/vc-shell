#!/usr/bin/env node

/**
 * Script to add frontmatter to all example markdown files
 */

const fs = require('fs');
const path = require('path');

const examplesDir = path.join(__dirname, '../src/examples');

// Check if file already has frontmatter
function hasFrontmatter(content) {
  return /^---\r?\n/.test(content.trim());
}

// Extract metadata from filename and content
function extractMetadata(filePath, content) {
  const relativePath = path.relative(examplesDir, filePath);
  const fileName = path.basename(filePath, '.md');
  const dirName = path.basename(path.dirname(filePath));
  const parentDir = path.basename(path.dirname(path.dirname(filePath)));

  const metadata = {
    id: null,
    type: null,
    component: null,
    complexity: 'SIMPLE',
    category: null,
    tags: [],
    critical: false,
    related_rules: [],
    title: null,
    description: null,
  };

  // Determine type and component based on path
  if (relativePath.startsWith('capabilities/')) {
    metadata.component = dirName;
    metadata.category = 'component';

    // Determine type from filename
    if (fileName.startsWith('prop-')) {
      metadata.type = 'PROP';
      const propName = fileName.replace('prop-', '');
      metadata.id = `${dirName.toLowerCase()}-prop-${propName}`;
      metadata.title = `${dirName} :${propName} prop`;
      metadata.tags.push('prop', propName);
      metadata.description = `${propName} property for ${dirName}`;
    } else if (fileName.startsWith('slot-')) {
      metadata.type = 'SLOT';
      const slotName = fileName.replace('slot-', '');
      metadata.id = `${dirName.toLowerCase()}-slot-${slotName}`;
      metadata.title = `${dirName} #${slotName} slot`;
      metadata.tags.push('slot', slotName);
      metadata.description = `${slotName} slot for ${dirName}`;

      // Slots are typically more complex
      metadata.complexity = 'MODERATE';
    } else if (fileName.startsWith('event-')) {
      metadata.type = 'EVENT';
      const eventName = fileName.replace('event-', '');
      metadata.id = `${dirName.toLowerCase()}-event-${eventName}`;
      metadata.title = `${dirName} @${eventName} event`;
      metadata.tags.push('event', eventName);
      metadata.description = `${eventName} event for ${dirName}`;
    } else {
      metadata.type = 'USAGE';
      metadata.id = `${dirName.toLowerCase()}-${fileName}`;
      metadata.title = `${dirName} - ${fileName}`;
      metadata.tags.push('usage');
      metadata.description = `Usage example for ${dirName}`;
    }
  } else if (relativePath.startsWith('patterns/')) {
    metadata.type = 'PATTERN';
    metadata.category = 'pattern';
    metadata.id = fileName;
    metadata.title = fileName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    metadata.description = `${metadata.title} pattern`;
    metadata.complexity = 'MODERATE';
    metadata.tags.push('pattern');

    // Check if critical pattern
    const criticalPatterns = [
      'module-registration',
      'workspace-blade',
      'browser-unload-prevention',
      'unsaved-changes',
      'domain-events',
      'api-client',
      'modification-tracking'
    ];

    if (criticalPatterns.includes(fileName)) {
      metadata.critical = true;
    }
  } else if (relativePath.startsWith('compositions/')) {
    metadata.type = 'COMPOSITION';
    metadata.category = 'composition';
    const subCategory = path.basename(path.dirname(filePath));
    metadata.id = `composition-${subCategory}-${fileName}`;
    metadata.title = fileName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    metadata.description = `${metadata.title} composition for ${subCategory} blades`;
    metadata.complexity = 'MODERATE';
    metadata.tags.push('composition', subCategory);

    if (subCategory === 'details' || subCategory === 'list') {
      metadata.tags.push(subCategory);
    }
  } else if (relativePath.startsWith('framework/')) {
    metadata.type = 'API';
    metadata.category = 'framework';

    if (relativePath.includes('composables/')) {
      const composableName = dirName;
      metadata.id = `framework-${composableName}`;
      metadata.title = composableName;
      metadata.description = `${composableName} composable API`;
      metadata.tags.push('composable', 'framework');
      metadata.complexity = 'MODERATE';

      // Critical composables
      const criticalComposables = [
        'useBeforeUnload',
        'useBladeNavigation',
        'usePopup',
        'useModificationTracker'
      ];

      if (criticalComposables.includes(composableName)) {
        metadata.critical = true;
      }
    } else if (relativePath.includes('utilities/')) {
      const utilityName = dirName;
      metadata.id = `framework-${utilityName}`;
      metadata.title = utilityName;
      metadata.description = `${utilityName} utility API`;
      metadata.tags.push('utility', 'framework');
    }
  } else if (relativePath.startsWith('templates/')) {
    metadata.type = 'TEMPLATE';
    metadata.category = 'template';
    metadata.id = `template-${fileName}`;
    metadata.title = fileName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    metadata.description = `${metadata.title} template`;
    metadata.tags.push('template');
  } else if (relativePath.startsWith('components/')) {
    metadata.type = 'COMPONENT';
    metadata.category = 'component';
    metadata.id = `component-${fileName}`;
    metadata.title = fileName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    metadata.description = `${metadata.title} component example`;
    metadata.tags.push('component');
  } else if (relativePath.startsWith('pages/')) {
    metadata.type = 'PAGE';
    metadata.category = 'page';
    metadata.id = `page-${fileName}`;
    metadata.title = fileName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    metadata.description = `${metadata.title} page example`;
    metadata.tags.push('page');
  } else if (relativePath.startsWith('api/')) {
    metadata.type = 'API';
    metadata.category = 'api';
    metadata.id = `api-${fileName}`;
    metadata.title = fileName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    metadata.description = `${metadata.title} API example`;
    metadata.tags.push('api');
  }

  return metadata;
}

// Generate frontmatter from metadata
function generateFrontmatter(metadata) {
  const lines = ['---'];

  lines.push(`id: ${metadata.id}`);

  if (metadata.component) {
    lines.push(`component: ${metadata.component}`);
  }

  lines.push(`type: ${metadata.type}`);
  lines.push(`complexity: ${metadata.complexity}`);

  if (metadata.category) {
    lines.push(`category: ${metadata.category}`);
  }

  if (metadata.tags.length > 0) {
    lines.push(`tags: [${metadata.tags.join(', ')}]`);
  }

  if (metadata.critical) {
    lines.push(`critical: true`);
  }

  if (metadata.related_rules && metadata.related_rules.length > 0) {
    lines.push(`related_rules: [${metadata.related_rules.map(r => `"${r}"`).join(', ')}]`);
  }

  if (metadata.title) {
    lines.push(`title: "${metadata.title}"`);
  }

  if (metadata.description) {
    lines.push(`description: "${metadata.description}"`);
  }

  lines.push('---');

  return lines.join('\n');
}

// Process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has frontmatter
    if (hasFrontmatter(content)) {
      console.log(`⏭️  Skip (has frontmatter): ${path.relative(examplesDir, filePath)}`);
      return { skipped: true };
    }

    // Extract metadata
    const metadata = extractMetadata(filePath, content);

    // Generate frontmatter
    const frontmatter = generateFrontmatter(metadata);

    // Combine frontmatter with content
    const newContent = frontmatter + '\n\n' + content;

    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf8');

    console.log(`✅ Added: ${path.relative(examplesDir, filePath)}`);
    return { processed: true, metadata };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { error: true };
  }
}

// Find all markdown files recursively
function findMarkdownFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Main execution
function main() {
  console.log('🚀 Adding frontmatter to all example files...\n');

  const files = findMarkdownFiles(examplesDir);
  console.log(`📝 Found ${files.length} markdown files\n`);

  const stats = {
    processed: 0,
    skipped: 0,
    errors: 0,
  };

  for (const file of files) {
    const result = processFile(file);

    if (result.processed) stats.processed++;
    if (result.skipped) stats.skipped++;
    if (result.error) stats.errors++;
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Processed: ${stats.processed}`);
  console.log(`   ⏭️  Skipped: ${stats.skipped}`);
  console.log(`   ❌ Errors: ${stats.errors}`);
  console.log(`   📝 Total: ${files.length}`);

  if (stats.errors === 0) {
    console.log('\n🎉 All files processed successfully!');
  } else {
    console.log('\n⚠️  Some files had errors. Please review.');
    process.exit(1);
  }
}

// Run
main();
