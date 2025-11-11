# Changelog

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

**Latest:** v0.4.0 - Production Ready ✅

