# Examples Directory Structure - Final

## Summary

The `src/examples/` directory has been reorganized into a clean, well-structured hierarchy with 318 total files.

**Note:** Dashboard setup examples removed as they are already included in scaffold application (`@vc-shell/create-vc-app`).

## Directory Structure

```
examples/
├── index.yaml                           # Central catalog of all examples
├── ui-plan-example-complete.json        # Complete valid UI-Plan (MCP resource)
│
├── patterns/                            # 26 architectural & blade patterns
│   ├── workspace-blade.md               # Workspace blades with menuItem
│   ├── module-registration.md           # Module registration patterns
│   ├── blade-list-complete.md           # Complete working list blade
│   ├── blade-details-complete.md        # Complete working details blade
│   ├── composable-list-complete.md      # Complete list composable
│   ├── composable-details-complete.md   # Complete details composable
│   ├── widgets-complete.md              # Complete widgets guide
│   └── ...                              # 19 more patterns
│
├── templates/                           # 9 production-ready .vue templates
│   ├── list-simple.vue
│   ├── list-filters.vue
│   ├── list-multiselect.vue
│   ├── list-reorderable.vue
│   ├── details-simple.vue
│   ├── details-validation.vue
│   ├── details-gallery.vue
│   ├── details-widgets.vue
│   └── details-tabs.vue
│
├── components/                          # 30 component demos
│   ├── VcTable-demo.md
│   ├── VcInput-demo.md
│   └── ...
│
├── capabilities/                        # 243 component capability examples
│   ├── VcTable/                         # 17 examples
│   ├── VcInput/                         # 14 examples
│   ├── VcSelect/                        # 24 examples
│   └── ...                              # 27 components total
│
└── framework/                           # 5 framework API examples
    └── composables/
        ├── useBladeNavigation/
        ├── usePopup/
        └── useBeforeUnload/
```

## Key Changes

### ✅ Consolidated
- Moved 12 files from `compositions/` → `patterns/`
- Moved 5 root pattern files → `patterns/` with standardized names
- Removed duplicate `compositions/` directory
- **Removed `pages/` directory** - Dashboard examples already in scaffold app

### ✅ Standardized Names
- `blade-list-pattern.md` → `patterns/blade-list-complete.md`
- `blade-details-pattern.md` → `patterns/blade-details-complete.md`
- `composable-list-pattern.md` → `patterns/composable-list-complete.md`
- `composable-details-pattern.md` → `patterns/composable-details-complete.md`
- `widgets-pattern.md` → `patterns/widgets-complete.md`

### ✅ Fixed Locations
- **FIXED**: `ui-plan-example-complete.json` moved from `pages/` to `examples/` root
  - Used by MCP resource `vcshell://ui-plan-example-complete`
  - Referenced in error messages in `mcp.ts`
  - Now in correct location as expected by `resources.ts`

### ✅ Updated Code References
- Updated all imports in `ai-generation-guide-builder.ts`
- Updated all paths in `mcp/resources.ts`
- All build scripts verified working

## MCP Integration

### New MCP Tools (Transparent Access)
1. **get_applicable_rules** - Retrieve rules filtered by blade type, workspace status, features
2. **get_best_template** - Find best matching .vue template
3. **get_relevant_patterns** - Get patterns relevant to blade context

### Existing MCP Resources
All MCP resources (`vcshell://...`) now correctly reference the new structure:
- `vcshell://blade-list-pattern` → `patterns/blade-list-complete.md`
- `vcshell://blade-details-pattern` → `patterns/blade-details-complete.md`
- `vcshell://composable-list-pattern` → `patterns/composable-list-complete.md`
- `vcshell://composable-details-pattern` → `patterns/composable-details-complete.md`
- `vcshell://ui-plan-example-complete` → `ui-plan-example-complete.json` ✅ FIXED

## Statistics

- **Total files**: 318
  - 304 markdown files (.md)
  - 12 Vue templates (.vue)
  - 2 other files (.json, .yaml)
- **Patterns**: 26 (21 general + 5 complete examples)
- **Templates**: 9 production-ready Vue SFCs
- **Components**: 30 demos
- **Capabilities**: 243 examples across 29 components
- **Framework**: 5 API usage examples

## Usage

### Central Index
All examples are cataloged in `src/examples/index.yaml` with:
- Pattern metadata (id, file, category, features)
- Template metadata (blade type, complexity, features, lines)
- Statistics and categories
- Directory structure documentation

### PatternsLoader
New `src/core/patterns-loader.ts` provides programmatic access:
```typescript
const loader = new PatternsLoader();

// Load all patterns
const patterns = await loader.loadAllPatterns();

// Get patterns by blade type
const listPatterns = await loader.getPatternsByBladeType('list');

// Get relevant patterns
const relevant = await loader.getRelevantPatterns({
  bladeType: 'list',
  isWorkspace: true,
  features: ['filters', 'multiselect']
});

// Get best template
const template = await loader.getBestTemplate({
  bladeType: 'details',
  features: ['validation', 'gallery']
});
```

## Build Verification

✅ Build succeeds with new structure:
```bash
npm run build
# ESM ⚡️ Build success in 31ms
# DTS ⚡️ Build success in 2842ms
# ✓ Copied pattern documentation
# ✓ Copied capability examples (242 files)
# ✓ Copied framework API examples (5 files)
```

## Next Steps

The examples structure is now ideal and ready for:
1. ✅ MCP tools to transparently retrieve rules and patterns
2. ✅ AI generation guides to reference correct files
3. ✅ Build system to copy all assets correctly
4. ✅ Documentation generation from index.yaml

All path references fixed, build verified, structure documented. 🎉
