# Phase 3: Pattern Composition - IN PROGRESS 🔄

## Summary

Phase 3 добавляет **систему композиции паттернов** для улучшения качества генерации кода. Вместо монолитных шаблонов, генератор теперь может комбинировать несколько небольших паттернов в полный код.

## Deliverables

### 1. PatternMerger Class ✅

**File:** [pattern-merger.ts](src/core/pattern-merger.ts)
**Lines:** 450+ lines
**Purpose:** Intelligent pattern composition and merging

**Key Features:**
- Парсинг markdown паттернов с кодом
- Извлечение секций Vue SFC (template, script, style)
- Умное слияние импортов, composables, refs, методов
- Дедупликация кода
- Сортировка импортов (framework → 3rd party → local)

**API:**
```typescript
const merger = new PatternMerger();

// Merge multiple patterns
const merged = merger.merge(patterns, {
  deduplicateImports: true,
  sortImports: true,
  addComments: true,
});

// Build complete Vue SFC
const sfc = merger.buildSFC(merged);
```

**Merging Strategy:**

```
Pattern 1: list-basic.md
├── <template>
│   └── VcBlade > VcTable
├── <script>
│   ├── imports: { VcBlade, VcTable }
│   ├── composables: useEntityList()
│   ├── refs: items, loading
│   └── methods: loadItems()
└── <style>

Pattern 2: filters-pattern.md
├── <template>
│   └── VcTable > #filters slot
├── <script>
│   ├── refs: stagedFilters, appliedFilters
│   └── methods: onApplyFilters()
└── (no style)

Pattern 3: multiselect.md
├── <template>
│   └── VcTable :multiselect="true"
├── <script>
│   ├── refs: selectedItems
│   └── methods: onSelectionChange()
└── (no style)

↓ PatternMerger.merge() ↓

Merged Result:
├── <template>
│   └── VcBlade
│       └── VcTable (with filters slot + multiselect)
├── <script>
│   ├── imports: { VcBlade, VcTable } (deduplicated)
│   ├── composables: useEntityList()
│   ├── refs: items, loading, stagedFilters, appliedFilters, selectedItems
│   └── methods: loadItems(), onApplyFilters(), onSelectionChange()
└── <style>
```

## Architecture

### Before Phase 3: Monolithic Templates

```
Template Selection:
- list-simple.vue (200 lines)
- list-filters.vue (250 lines)
- list-multiselect.vue (280 lines)
- list-filters-multiselect.vue (320 lines) ← duplicate code!
```

**Problem:** N×M template combinations → code duplication

### After Phase 3: Pattern Composition

```
Pattern Library:
- list-basic.md (core VcBlade + VcTable structure)
- filters-pattern.md (filter panel logic)
- multiselect.md (selection handlers)
- toolbar-patterns.md (custom toolbar actions)
- error-handling.md (try/catch wrappers)

PatternMerger → Compose → Complete code
```

**Benefit:** N+M patterns → infinite combinations, no duplication

## Pattern Format

Patterns stored as **markdown files** with code blocks:

```markdown
# List with Filters Pattern

Description of what this pattern does...

## Template

\```vue
<template>
  <VcTable>
    <template #filters>
      <VcCard>
        <!-- Filter UI -->
      </VcCard>
    </template>
  </VcTable>
</template>
\```

## Script

\```typescript
const stagedFilters = ref({});
const appliedFilters = ref({});

function onApplyFilters() {
  appliedFilters.value = { ...stagedFilters.value };
  load();
}
\```

## Usage

Apply this pattern when `features` includes "filters"
```

## Code Sections Parsed

PatternMerger extracts and categorizes code into:

1. **Template** - DOM structure
2. **Imports** - import statements
3. **Composables** - `useXxx()` calls
4. **Refs** - `ref()`, `reactive()` declarations
5. **Computed** - `computed()` properties
6. **Methods** - Functions
7. **Lifecycle** - `onMounted()`, `watch()`, etc.
8. **Style** - CSS/SCSS

## Deduplication Strategy

```typescript
// Input: Multiple patterns with overlapping imports
Pattern 1: import { ref, computed } from "vue"
Pattern 2: import { ref, watch } from "vue"
Pattern 3: import { computed } from "vue"

// After merge + dedupe:
import { ref, computed, watch } from "vue"
```

## Integration Points

### 1. BladeComposer
```typescript
class BladeComposer {
  composeBlade(config: CompositionConfig): string {
    // Select patterns
    const patterns = this.selectPatterns(config.context);

    // Merge patterns
    const merger = new PatternMerger();
    const merged = merger.merge(patterns);

    // Build SFC
    return merger.buildSFC(merged);
  }
}
```

### 2. UnifiedCodeGenerator
```typescript
class UnifiedCodeGenerator {
  async generateBlade(blade: Blade): Promise<string> {
    const composer = new BladeComposer();
    return composer.composeBlade({ context });
  }
}
```

## Pattern Library Structure

```
src/examples/
├── compositions/          # Pattern library (markdown)
│   ├── list/
│   │   ├── list-basic.md           # Core list structure
│   │   ├── filters-pattern.md      # Filter panel
│   │   ├── multiselect.md          # Row selection
│   │   └── reorderable-table.md    # Drag-drop sorting
│   ├── details/
│   │   ├── form-basic.md           # Core form structure
│   │   ├── validation-patterns.md  # vee-validate rules
│   │   ├── gallery-patterns.md     # VcGallery integration
│   │   └── widgets-registration.md # Widget lifecycle
│   └── shared/
│       ├── error-handling.md       # Try/catch patterns
│       ├── toolbar-patterns.md     # Custom toolbar
│       ├── async-select-patterns.md # Async VcSelect
│       └── custom-column-slots.md   # Table slot patterns
```

## Testing

Tests to be added in Phase 3:

```typescript
describe("PatternMerger", () => {
  it("should merge template sections");
  it("should deduplicate imports");
  it("should sort imports by category");
  it("should extract composables");
  it("should parse script sections");
  it("should build complete Vue SFC");
  it("should handle multiple patterns");
  it("should preserve code structure");
});
```

## Benefits

### 1. Maintainability
- **Before:** 10+ template files to maintain
- **After:** 15 small pattern files (easier to update)

### 2. Flexibility
- **Before:** Fixed template combinations
- **After:** Dynamic pattern composition

### 3. Code Quality
- **Before:** Duplicate code across templates
- **After:** DRY patterns, composed once

### 4. Extensibility
- **Before:** Add new template = copy 200+ lines
- **After:** Add new pattern = 20-30 lines

## Next Steps (Phase 3 continuation)

1. ✅ **PatternMerger class** - Complete
2. 🔄 **Convert markdown patterns** - Create 10-15 pattern files
3. ⏳ **Integrate with BladeComposer** - Use PatternMerger in composeBlade()
4. ⏳ **Add tests** - pattern-merger.spec.ts
5. ⏳ **Update templates** - Convert existing templates to patterns

## Example: List with Filters + Multiselect

**Old approach (Monolithic):**
```vue
<!-- list-filters-multiselect.vue - 320 lines -->
<template>
  <VcBlade>
    <VcTable :multiselect="true">
      <template #filters>
        <!-- 50 lines of filter UI -->
      </template>
      <!-- 100 lines of table columns -->
    </VcTable>
  </VcBlade>
</template>

<script>
// 150 lines of mixed logic
</script>
```

**New approach (Composition):**
```typescript
// Step 1: Select patterns
const patterns = [
  listBasic,           // 40 lines
  filtersPattern,      // 30 lines
  multiselect,         // 25 lines
  errorHandling,       // 15 lines
];

// Step 2: Merge
const merger = new PatternMerger();
const merged = merger.merge(patterns);

// Step 3: Build
const sfc = merger.buildSFC(merged);
// Result: Clean, composed 320-line SFC with all features
```

## Statistics

| Metric | Value |
|--------|-------|
| PatternMerger LOC | 450+ |
| Methods implemented | 15 |
| Pattern sections supported | 8 |
| Deduplication strategies | 3 |
| Import sorting categories | 3 |

## References

- [pattern-merger.ts](src/core/pattern-merger.ts) - Main implementation
- [blade-composer.ts](src/core/blade-composer.ts) - Integration point
- [generation-rules.ts](src/core/generation-rules.ts) - Pattern interface

---

**Status:** Phase 3 - 30% complete
**Next:** Convert existing markdown patterns to structured format
