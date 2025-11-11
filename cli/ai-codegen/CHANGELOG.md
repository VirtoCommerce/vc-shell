# Changelog

## [0.5.0] - 2025-11-11

### 🚀 Major: Fully Automatic Code Generation

This release transforms the tool from a scaffolding assistant into a **fully automatic code generator**.

### Added

- **UnifiedCodeGenerator** - Orchestrates entire generation pipeline
- **TemplateAdapter** - AST-based template transformation using Babel
- **ComposableGenerator** - Pattern-based composable generation with mock data
- **LocaleGenerator** - Automatic i18n key extraction and structure generation
- **ModuleRegistrar** - Automatic module registration in main.ts using AST
- **generate_complete_module** MCP tool - Main tool for automatic generation
- **validate_and_fix_plan** MCP tool - Validation with suggested fixes
- **generate_blade** MCP tool - Single blade generation
- **scaffold_app** now automatically creates apps (runs create-vc-app with --skip-module-gen)
- Mock data support in all composables (300ms simulated API delay)
- Extended UI-Plan schema with `features`, `customSlots`, column/field `type` fields
- Comprehensive test suite (9 files, 50+ tests)
- ARCHITECTURE.md - Complete architecture documentation
- RULES.md - Full AI generation rules

### Changed

- **BREAKING:** `generate` command now uses UnifiedCodeGenerator instead of basic scaffolding
- **BREAKING:** AI workflow now requires `generate_complete_module` tool call
- **BREAKING:** `scaffold_app` tool now automatically creates apps (no manual npx required)
- Updated .cursorrules with strict workflow (no manual adaptation allowed)
- README.md updated to reflect automatic generation and app creation
- MCP tool count: 7 → 10 tools
- Dependencies: Added `@babel/*` packages for AST transformations
- Dependencies: Added `@vue/compiler-sfc` for Vue SFC parsing

### Removed

- Manual template adaptation instructions from .cursorrules
- AI dependency on manual composable creation
- Manual locale creation workflow

### Fixed

- TypeScript types for all generators
- ESM import issues with Babel packages
- Linter errors in core modules

### Migration Guide

**Old workflow (0.4.0 and earlier):**
```
1. AI generates UI-Plan
2. AI calls get_blade_template
3. AI manually adapts template (Entity → Vendor)
4. AI manually creates composables
5. AI manually creates locales
6. AI manually registers module
→ 15-20 minutes + manual work
```

**New workflow (0.5.0+):**
```
1. AI generates UI-Plan
2. AI calls generate_complete_module
→ 30 seconds, fully automatic!
```

---

## [0.4.0] - 2025-11-10

### Added
- 🎨 Compositional blade generation (12 atomic patterns)
- 📦 5 production-ready Vue templates
- 🔧 MCP tool: `get_blade_template`
- 📚 Modular documentation structure (guides/)
- 🧩 42 real VC-Shell components documented

### Fixed
- 🐛 Details blade URLs: now `/vendor` (singular, no :id)
- 🐛 Workflow: plan-first strictly enforced
- 🐛 File naming: `vendors-list.vue`, `vendor-details.vue`
- 🐛 Import naming: `VendorDetails` (singular)
- 🐛 List blades: `isWorkspace: true` + `menuItem` required
- 🐛 UI-Plan schema: uses real component names (VcTable, VcForm)
- 🐛 VcField: clarified as read-only display only
- 🐛 Validator: now works with real component names

### Changed
- 📖 Documentation: removed llms.txt (not needed for npm package)
- 📖 Optimized: .cursorrules as primary AI source
- 🔄 Approach: Templates + Compositions (like shadcn/ui)

### Removed
- ❌ llms.txt files (not needed for local tooling)
- ❌ Fictional components (VcChart, VcTabs, etc.)
- ❌ Temporary dev documentation files

## [0.1.0] - 2024-11-08

### Added
- 🚀 Initial MCP server implementation
- 🔧 7 MCP tools for AI integration
- 📚 Component registry with examples
- 🎯 UI-Plan schema and validation
- 📝 Blade and composable patterns
- 🛠️ CLI commands (plan, generate, validate)

---

**Latest:** v0.5.0 - Fully Automatic Generation ✅

