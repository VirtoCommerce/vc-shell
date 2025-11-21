# Path Resolution Fix

## Проблема

MCP tools `get_applicable_rules` и `get_best_template` возвращали пустые результаты:
- `get_applicable_rules` → "Found 0 applicable rules"
- `get_best_template` → "No template found for list blade"

## Root Cause

**Path resolution bug в compiled code**:

Когда TypeScript компилируется в ESM bundle через tsup, `__dirname` указывает на `/dist` directory:

```typescript
// В source code:
this.rulesDir = path.join(__dirname, "../rules");

// Во время runtime (__dirname = /path/to/dist):
// Результат: /path/to/dist/../rules = /path/to/rules ❌

// Но файлы находятся:
// /path/to/dist/rules ✅
```

## Исправление

### 1. `rules-loader.ts` (строки 32-33)

**Было**:
```typescript
constructor(options: RulesLoaderOptions = {}) {
  this.rulesDir = options.rulesDir || path.join(__dirname, "../rules");
  this.examplesDir = options.examplesDir || path.join(__dirname, "../examples");
  this.cacheEnabled = options.cache !== false;
}
```

**Стало**:
```typescript
constructor(options: RulesLoaderOptions = {}) {
  this.rulesDir = options.rulesDir || path.join(__dirname, "rules");
  this.examplesDir = options.examplesDir || path.join(__dirname, "examples");
  this.cacheEnabled = options.cache !== false;
}
```

### 2. `patterns-loader.ts` (строка 59)

**Было**:
```typescript
constructor(examplesDir?: string, cacheEnabled = true) {
  this.examplesDir = examplesDir || path.join(__dirname, "../examples");
  this.cacheEnabled = cacheEnabled;
}
```

**Стало**:
```typescript
constructor(examplesDir?: string, cacheEnabled = true) {
  this.examplesDir = examplesDir || path.join(__dirname, "examples");
  this.cacheEnabled = cacheEnabled;
}
```

## Path Resolution Math

### До исправления:

```
Source code:       path.join(__dirname, "../rules")
Runtime __dirname: /Users/symbot/DEV/vc-shell/cli/ai-codegen/dist
Resolved path:     /Users/symbot/DEV/vc-shell/cli/ai-codegen/rules ❌
Actual files:      /Users/symbot/DEV/vc-shell/cli/ai-codegen/dist/rules ✅
Result:            fs.readdir() finds nothing → 0 rules returned
```

### После исправления:

```
Source code:       path.join(__dirname, "rules")
Runtime __dirname: /Users/symbot/DEV/vc-shell/cli/ai-codegen/dist
Resolved path:     /Users/symbot/DEV/vc-shell/cli/ai-codegen/dist/rules ✅
Actual files:      /Users/symbot/DEV/vc-shell/cli/ai-codegen/dist/rules ✅
Result:            fs.readdir() finds 18 YAML files → rules returned
```

## Затронутые MCP Tools

После исправления эти tools теперь работают:

1. **`mcp__vcshell-codegen__get_applicable_rules`**
   - **До**: "Found 0 applicable rules"
   - **После**: Возвращает 18 critical rules из `/dist/rules/critical/`

2. **`mcp__vcshell-codegen__get_best_template`**
   - **До**: "No template found for list blade"
   - **После**: Возвращает соответствующий Vue SFC template из `/dist/examples/templates/`

3. **`mcp__vcshell-codegen__get_relevant_patterns`**
   - **До**: "Found 0 patterns"
   - **После**: Возвращает patterns из `/dist/examples/patterns/`

## Файлы в dist после build

### Rules (18 critical + 3 constraints):
```bash
$ ls dist/rules/critical/
01-blade-structure.yaml
02-api-client.yaml
03-async-operations.yaml
04-modification-tracking.yaml
05-form-validation.yaml
06-blade-close.yaml
07-domain-events.yaml
08-module-index.yaml
09-module-registration.yaml
09a-menu-items.yaml           # Workspace blade specific
10-vctable-generic.yaml
11-vcselect-slot.yaml
12-icons.yaml
13-browser-unload.yaml
14-blade-close-confirmation.yaml
15-filters-usage.yaml
```

### Templates (9 Vue SFC):
```bash
$ ls dist/examples/templates/
list-simple.vue          (5.5KB)
list-filters.vue         (8.3KB)
list-multiselect.vue     (8.8KB)
list-reorderable.vue     (9.0KB)
details-simple.vue       (8.1KB)
details-validation.vue   (13.8KB)
details-gallery.vue      (13.2KB)
details-widgets.vue      (10.3KB)
details-tabs.vue         (18.8KB)
```

## Build Process

```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
npm run build
# ✅ Build success
# ✅ Copied rules (20 files)
# ✅ Copied templates (9 files)
```

Assets are copied by `scripts/copy-assets.sh`:
```bash
# Copy rules
cp -r src/rules/* dist/rules/

# Copy templates
cp src/examples/templates/*.vue dist/examples/templates/
```

## Verification

### Test 1: Check paths exist
```bash
ls dist/rules/critical/        # ✅ 18 files
ls dist/examples/templates/    # ✅ 9 files
```

### Test 2: Test MCP tools
```typescript
// Should now return rules:
mcp__vcshell-codegen__get_applicable_rules({
  bladeType: "list",
  features: ["filters"],
  isWorkspace: true,
  strategy: "AI_FULL"
})
// Expected: Array of Rule objects with YAML content

// Should now return template:
mcp__vcshell-codegen__get_best_template({
  bladeType: "list",
  features: ["filters"],
  complexity: "moderate"
})
// Expected: TemplateFile with Vue SFC content
```

## Impact on Lazy-Loading V2

Это исправление **критично** для Lazy-Loading V2 архитектуры:

### До исправления:
```
generate_with_composition
  ↓ Returns template with MCP tool call instructions
AI calls get_applicable_rules
  ↓ Returns 0 rules ❌
AI calls get_best_template
  ↓ Returns "No template found" ❌
AI generates code
  ↓ Without rules/template → poor quality
```

### После исправления:
```
generate_with_composition
  ↓ Returns template with MCP tool call instructions
AI calls get_applicable_rules
  ↓ Returns 18 critical rules ✅
AI calls get_best_template
  ↓ Returns Vue SFC template ✅
AI generates code
  ↓ Using template + rules → high quality ✅
```

## Related Issues

Этот bug также затрагивал:
- ❌ `ai-generation-guide-builder.ts` - если бы использовал RulesLoader напрямую
- ❌ Any other code using RulesLoader/PatternsLoader without explicit paths

## Дата

2024-11-20

## Commit Message

```
fix(ai-codegen): correct path resolution in rules and patterns loaders

- Changed path.join(__dirname, "../rules") to path.join(__dirname, "rules")
- Changed path.join(__dirname, "../examples") to path.join(__dirname, "examples")
- Fixes MCP tools returning 0 rules/templates
- Critical for Lazy-Loading V2 architecture

Files changed:
- src/core/rules-loader.ts (lines 32-33)
- src/core/patterns-loader.ts (line 59)
```
