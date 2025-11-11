#!/bin/bash

# Copy assets to dist/ after tsup build

echo "Copying assets to dist/..."

# Create directories
mkdir -p dist/schemas
mkdir -p dist/examples
mkdir -p dist/examples/components
mkdir -p dist/examples/templates  
mkdir -p dist/examples/patterns
mkdir -p dist/examples/compositions

# Copy schemas
cp src/schemas/*.json dist/schemas/ 2>/dev/null && echo "✓ Copied JSON schemas"

# Copy example markdown files
cp src/examples/*.md dist/examples/ 2>/dev/null && echo "✓ Copied example markdown files"

# Copy component demos (md)
cp src/examples/components/*.md dist/examples/components/ 2>/dev/null && echo "✓ Copied component demos (md)"

# Copy component templates (vue)
cp src/examples/components/*.vue dist/examples/components/ 2>/dev/null && echo "✓ Copied component templates (vue)"

# Copy blade templates
cp src/examples/templates/*.vue dist/examples/templates/ 2>/dev/null && echo "✓ Copied blade templates"

# Copy pattern documentation
cp src/examples/patterns/*.md dist/examples/patterns/ 2>/dev/null && echo "✓ Copied pattern documentation"

# Copy composition patterns
cp src/examples/compositions/*.md dist/examples/compositions/ 2>/dev/null && echo "✓ Copied composition patterns"

echo ""
echo "✅ Asset copy complete!"

