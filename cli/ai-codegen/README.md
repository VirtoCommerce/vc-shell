# @vc-shell/ai-codegen

AI-powered code generation for VC-Shell applications using Model Context Protocol (MCP).

Generate complete, production-ready VC-Shell modules from natural language prompts.

[![Version](https://img.shields.io/npm/v/@vc-shell/ai-codegen.svg)](https://www.npmjs.com/package/@vc-shell/ai-codegen)
[![License](https://img.shields.io/npm/l/@vc-shell/ai-codegen.svg)](https://github.com/VirtoCommerce/vc-shell/blob/main/LICENSE)

## Features

- 🤖 **AI-Powered**: Works with Cursor, VS Code, Claude Code, Codex
- 📦 **Production Ready**: Based on real vendor-portal patterns
- 🎨 **Flexible**: Templates for quick start + Compositions for unlimited customization
- ✅ **Type-Safe**: Full TypeScript support
- 🌐 **i18n Ready**: All strings use vue-i18n
- 🔧 **MCP Integration**: 7 tools and 7 resources

## Quick Start

### 1. Installation

```bash
npx @vc-shell/ai-codegen@latest init-mcp --client cursor
```

### 2. Restart IDE

```bash
# Cursor: Command + Q → Reopen
# Then: Settings → Features → MCP → Enable "vcshell"
```

### 3. Generate Module

```
Create vendor management with list and details
```

AI will generate complete module with blades, composables, and i18n!

## What Gets Generated

```
src/modules/vendor-management/
├── pages/
│   ├── vendors-list.vue       # List blade
│   └── vendor-details.vue     # Details blade
├── composables/
│   ├── useVendorList.ts
│   └── useVendorDetails.ts
├── locales/
│   ├── en.json
│   └── index.ts
└── index.ts
```

## Documentation

- [Quick Start](docs/QUICKSTART.md) - Detailed setup guide
- [Commands Reference](docs/COMMANDS.md) - All CLI commands
- [MCP Setup](docs/MCP_SETUP.md) - MCP configuration
- [Module Registration](docs/MODULE_REGISTRATION.md) - Registering modules
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues
- [Testing](TESTING.md) - Test suite information
- [Changelog](CHANGELOG.md) - Version history

## Key Rules

### Naming

- List blade: `vendors-list.vue` → `VendorList`
- Details blade: `vendor-details.vue` → `VendorDetails`  
- Import: `import VendorDetails from "./vendor-details.vue"`

### URLs

- List: `/vendors` (plural) + `isWorkspace: true` + `menuItem`
- Details: `/vendor` (singular, no :id)
- ID via: `openBlade({ param: id })`

### Components

42 real VC-Shell components available.

**Important:** VcField is for read-only display only. Use Field from vee-validate for forms!

## CLI Commands

```bash
vcgen search                    # Search components
vcgen view VcTable              # View details
vcgen init-mcp --client cursor  # Configure IDE
vcgen validate --plan __ai/ui-plan.json
vcgen generate --plan __ai/ui-plan.json
```

## MCP Tools

- `search_components`, `view_components`
- `get_component_examples`, `get_blade_template`
- `validate_ui_plan`, `get_audit_checklist`
- `scaffold_app`

## Version

**Current:** 0.4.0  
**Status:** Production Ready ✅

## Links

- [GitHub](https://github.com/VirtoCommerce/vc-shell)
- [VC-Shell Docs](https://github.com/VirtoCommerce/vc-shell-docs)
- [MCP](https://modelcontextprotocol.io/)

## License

MIT

---

**Ready to use!** Install, restart IDE, and start generating! 🚀
