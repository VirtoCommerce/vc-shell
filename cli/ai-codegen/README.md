# @vc-shell/ai-codegen

AI-powered code generation for VC-Shell applications using Model Context Protocol (MCP).

**Generate complete, production-ready VC-Shell modules automatically from natural language prompts.**

[![Version](https://img.shields.io/npm/v/@vc-shell/ai-codegen.svg)](https://www.npmjs.com/package/@vc-shell/ai-codegen)
[![License](https://img.shields.io/npm/l/@vc-shell/ai-codegen.svg)](https://github.com/VirtoCommerce/vc-shell/blob/main/LICENSE)

## Features

- 🚀 **Fully Automatic**: AI generates complete modules in one command
- 🤖 **AI-Powered**: Works with Cursor, VS Code, Claude Code, Codex
- 📦 **Production Ready**: AST-based code generation with mock data
- 🎨 **Two Patterns**: List (table) and Details (form) - covers all use cases
- ✅ **Type-Safe**: Full TypeScript support
- 🌐 **i18n Ready**: All strings use vue-i18n
- 🔧 **MCP Integration**: 10 tools and 7 resources
- 🧪 **Mock Data**: Generated modules work immediately without backend

## Quick Start

### Option 1: Add to Existing Project

#### 1. Installation

```bash
cd /path/to/your-vc-shell-project
npx @vc-shell/ai-codegen@latest init-mcp --client cursor
```

#### 2. Restart IDE

```bash
# Cursor: Command + Q → Reopen
# Then: Settings → Features → MCP → Enable "vcshell"
```

#### 3. Generate Module

```
Create vendor management module with list and details blades
```

**AI will:**
1. Generate UI-Plan JSON
2. Validate the plan
3. Call `generate_complete_module` tool
4. **Everything generated automatically in 30 seconds!**

### Option 2: Create New VC-Shell App

#### 1. Configure MCP First

```bash
# In any directory
npx @vc-shell/ai-codegen@latest init-mcp --client cursor
```

#### 2. Restart Cursor

#### 3. Create App via AI

**Prompt in Cursor:**
```
Create new VC-Shell app called "my-vendor-portal"
```

**AI will automatically:**
1. Call `scaffold_app` tool
2. Tool runs: `npx @vc-shell/create-vc-app@latest my-vendor-portal --skip-module-gen`
3. App created with base structure (no modules yet)

#### 4. Generate Modules

```bash
cd my-vendor-portal
npm install
```

**Then prompt:**
```
Create vendor management module with list and details
```

**Ready!** 🚀

## Components

VC-Shell AI Codegen knows about all 35 VC-Shell UI components:

### Layout & Structure (4)
**VcBlade**, **VcCard**, **VcContainer**, **VcRow**, **VcCol**

### Data Display (2)
**VcTable**, **VcField**

### Form Inputs (11)
**VcInput**, **VcTextarea**, **VcSelect**, **VcCheckbox**, **VcSwitch**, **VcRadioButton**, **VcInputCurrency**, **VcInputDropdown**, **VcMultivalue**, **VcEditor**, **VcFileUpload**

### UI Components (14)
**VcBadge**, **VcBanner**, **VcButton**, **VcIcon**, **VcImage**, **VcLabel**, **VcLink**, **VcStatus**, **VcStatusIcon**, **VcTooltip**, **VcHint**, **VcRating**, **VcSlider**, **VcVideo**

### Navigation (1)
**VcBreadcrumbs**

### Organisms (2)
**VcForm**, **VcGallery**

**All components include:**
- Complete props documentation
- Event handlers
- Slots information
- Usage examples
- Real-world use cases

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

### Primary Tools
- `generate_complete_module` - 🚀 **Main tool - generates everything automatically**
- `validate_ui_plan` - Validate UI-Plan before generation
- `validate_and_fix_plan` - Auto-fix validation errors

### Helper Tools
- `search_components`, `view_components` - Browse component registry
- `get_component_examples` - Get usage examples
- `get_blade_template` - Get template for reference (not for manual use)
- `scaffold_app` - Create new VC-Shell app
- `generate_blade` - Generate single blade
- `get_audit_checklist` - Quality checklist

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
