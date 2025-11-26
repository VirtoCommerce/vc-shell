#!/bin/bash

# Copy assets to dist/ after tsup build

echo "Copying assets to dist/..."

# Create directories
mkdir -p dist/schemas
mkdir -p dist/examples
mkdir -p dist/examples/reference
mkdir -p dist/examples/components
mkdir -p dist/examples/templates
mkdir -p dist/examples/patterns
mkdir -p dist/examples/compositions
mkdir -p dist/examples/capabilities
mkdir -p dist/examples/framework
mkdir -p dist/rules

# Copy schemas
cp src/schemas/*.json dist/schemas/ 2>/dev/null && echo "✓ Copied JSON schemas"

# Copy examples index (YAML)
cp src/examples/index.yaml dist/examples/ 2>/dev/null && echo "✓ Copied examples index (index.yaml)"

# Copy example markdown files
cp src/examples/*.md dist/examples/ 2>/dev/null && echo "✓ Copied example markdown files"

# Copy example JSON files (UI-Plan examples)
cp src/examples/*.json dist/examples/ 2>/dev/null && echo "✓ Copied example JSON files"

# Copy component demos (md)
cp src/examples/components/*.md dist/examples/components/ 2>/dev/null && echo "✓ Copied component demos (md)"

# Copy component templates (vue)
cp src/examples/components/*.vue dist/examples/components/ 2>/dev/null && echo "✓ Copied component templates (vue)"

# Copy blade templates
cp src/examples/templates/*.vue dist/examples/templates/ 2>/dev/null && echo "✓ Copied blade templates"

# Copy composable templates
cp src/examples/templates/*.template dist/examples/templates/ 2>/dev/null && echo "✓ Copied composable templates"

# Copy pattern documentation
cp src/examples/patterns/*.md dist/examples/patterns/ 2>/dev/null && echo "✓ Copied pattern documentation"

# Copy reference examples (single source of truth)
if [ -d "src/examples/reference" ]; then
  cp src/examples/reference/*.vue dist/examples/reference/ 2>/dev/null
  cp src/examples/reference/*.ts dist/examples/reference/ 2>/dev/null
  cp src/examples/reference/*.md dist/examples/reference/ 2>/dev/null
  REFERENCE_COUNT=$(find src/examples/reference -type f \( -name "*.vue" -o -name "*.ts" -o -name "*.md" \) | wc -l | tr -d ' ')
  echo "✓ Copied reference examples ($REFERENCE_COUNT files)"
fi

# Copy composition patterns
cp src/examples/compositions/*.md dist/examples/compositions/ 2>/dev/null && echo "✓ Copied composition patterns"

# Copy capability examples (all subdirectories)
if [ -d "src/examples/capabilities" ]; then
  cp -r src/examples/capabilities/* dist/examples/capabilities/ 2>/dev/null && echo "✓ Copied capability examples (242 files)"
fi

# Copy framework API examples (new)
if [ -d "src/examples/framework" ]; then
  cp -r src/examples/framework/* dist/examples/framework/ 2>/dev/null
  FRAMEWORK_COUNT=$(find src/examples/framework -type f -name "*.md" | wc -l | tr -d ' ')
  echo "✓ Copied framework API examples ($FRAMEWORK_COUNT files)"
fi

# Copy rules (YAML files for external rule system)
if [ -d "src/rules" ]; then
  cp -r src/rules/* dist/rules/ 2>/dev/null
  RULES_COUNT=$(find src/rules -type f -name "*.yaml" -o -name "*.yml" -o -name "*.md" | wc -l | tr -d ' ')
  echo "✓ Copied rules ($RULES_COUNT files)"
fi

echo ""
echo "✅ Asset copy complete!"

