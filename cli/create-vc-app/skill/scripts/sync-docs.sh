#!/usr/bin/env bash
# Syncs *.docs.md from framework into skill's knowledge/docs/
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
KNOWLEDGE_DOCS="$SCRIPT_DIR/../knowledge/docs"
FRAMEWORK_DIR="${1:-$(cd "$SCRIPT_DIR/../../../../framework" && pwd)}"

if [ ! -d "$FRAMEWORK_DIR" ]; then
  echo "Error: Framework directory not found: $FRAMEWORK_DIR"
  echo "Usage: $0 [path-to-framework]"
  exit 1
fi

# Clean existing docs
rm -rf "$KNOWLEDGE_DOCS"
mkdir -p "$KNOWLEDGE_DOCS"

# Copy preserving relative structure
cd "$FRAMEWORK_DIR"
find . -name "*.docs.md" -type f | while read -r file; do
  dest="$KNOWLEDGE_DOCS/$file"
  mkdir -p "$(dirname "$dest")"
  cp "$file" "$dest"
done

# Write build hash
HASH=$(git -C "$FRAMEWORK_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")
echo "Synced from framework at commit $HASH on $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$KNOWLEDGE_DOCS/_BUILD_HASH.md"

TOTAL=$(find "$KNOWLEDGE_DOCS" -name "*.docs.md" | wc -l | tr -d ' ')
echo "Synced $TOTAL docs files from $FRAMEWORK_DIR (commit: $HASH)"
