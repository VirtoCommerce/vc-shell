# @vc-shell/ai-codegen

Pattern-based code generation for VC-Shell applications with AI assistance via Model Context Protocol (MCP).

**Generate complete, production-ready VC-Shell modules from UI-Plans.** In MCP mode (Cursor, Claude Code), AI helps create UI-Plans from natural language prompts.

[![Version](https://img.shields.io/npm/v/@vc-shell/ai-codegen.svg)](https://www.npmjs.com/package/@vc-shell/ai-codegen)
[![License](https://img.shields.io/npm/l/@vc-shell/ai-codegen.svg)](https://github.com/VirtoCommerce/vc-shell/blob/main/LICENSE)

## Features

- 🚀 **MCP-Powered**: Works with AI IDEs (Cursor, Claude Code) via Model Context Protocol
- 🤖 **AI-Assisted**: AI reads guides and examples to generate UI-Plans and code
- 📦 **Production Ready**: Pattern-based code generation with mock data
- 🎨 **Two Patterns**: List (table) and Details (form) - covers all use cases
- ✅ **Type-Safe**: Full TypeScript support
- 🌐 **i18n Ready**: All strings use vue-i18n
- 🔧 **MCP Integration**: 10 tools and 7 resources for AI assistance
- 🧪 **Mock Data**: Generated modules work immediately without backend

## How It Actually Works

### Current Implementation (v0.7.0)

This tool uses **pattern composition** and **template adaptation**, not direct LLM code generation:

1. **In MCP Mode (Cursor/Claude Code):**
   - AI reads component docs and examples via MCP resources
   - AI generates UI-Plan JSON based on your prompt
   - Tool validates UI-Plan and generates code using **pattern merging**
   - Generated code comes from pre-written patterns, not LLM output

2. **In CLI Mode:**
   - You provide UI-Plan JSON or simple prompt
   - Planner extracts entity name (first word only)
   - Code generated using **template adaptation**
   - No LLM calls - fully deterministic

### What "AI-Powered" Means Here

- ✅ **AI reads documentation** - MCP resources provide component info to AI
- ✅ **AI creates UI-Plans** - Based on your natural language request
- ✅ **AI calls tools** - Uses `generate_complete_module` MCP tool
- ❌ **AI does NOT write the Vue/TS code** - Code comes from patterns/templates
- ❌ **No LLM API calls** - No OpenAI, Anthropic, or local models used for generation

### Generation Strategies

The tool uses 3 strategies (selected automatically by complexity):

| Strategy | Complexity | Method | LLM Used? |
|----------|-----------|---------|-----------|
| `TEMPLATE` | Simple (0-6) | AST-based template adaptation | ❌ No |
| `COMPOSITION` | Moderate (7-10) | Pattern merging with regex | ❌ No |
| `AI_GUIDED` | High (11-20) | Returns guide for AI to read | ❌ No* |

*In MCP mode, your AI IDE can read the guide and generate code, but the tool itself doesn't call LLMs.

### What Gets Generated

All code is generated from **pre-written patterns** located in:
- `src/examples/compositions/` - Pattern library (12 markdown files)
- `src/examples/templates/` - Blade templates (5 Vue SFCs)

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

**What happens:**
1. **AI generates UI-Plan JSON** (based on MCP docs and examples)
2. **AI calls** `generate_complete_module` tool with the plan
3. **Tool generates code** using pattern composition (not LLM)
4. **Done in ~5 seconds!** (no API calls, fully local)

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

**Then prompt in AI IDE:**
```
Create vendor management module with list and details
```

**What AI does:**
1. Reads component docs via MCP resources
2. Creates UI-Plan JSON with VcTable, VcForm, etc.
3. Calls `generate_complete_module` MCP tool
4. Tool generates Vue/TS code from patterns

**Ready!** 🚀 All code generated locally without API calls.

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

## Known Limitations

### Pattern Merging (COMPOSITION mode)
- Uses regex-based parsing, not AST
- Cannot merge complex Vue slots (e.g., `<template #mobile-item>`)
- May skip some pattern features in generated code
- **Workaround:** Use TEMPLATE mode for simple cases, or edit generated code manually

### CLI Planner
- Extracts only first word as entity name
- No semantic understanding of relationships, features, or roles
- **Workaround:** Write UI-Plan JSON manually or use AI IDE with MCP

### Not Yet Implemented
- ❌ `--story` flag (Storybook generation)
- ❌ `--test` flag (unit test generation)
- ❌ Direct LLM integration (OpenAI/Anthropic APIs)

### Composable Generation
- AI mode falls back to template-based approach
- May generate placeholder functions instead of complete logic
- **Workaround:** Edit composables after generation to add real API calls

See [CRITICAL_ISSUES_AND_IMPROVEMENTS.md](CRITICAL_ISSUES_AND_IMPROVEMENTS.md) for detailed analysis.

## Version

**Current:** 0.7.0
**Status:** Production Ready (with known limitations) ⚠️

## Links

- [GitHub](https://github.com/VirtoCommerce/vc-shell)
- [VC-Shell Docs](https://github.com/VirtoCommerce/vc-shell-docs)
- [MCP](https://modelcontextprotocol.io/)

## License

MIT

---

**Ready to use!** Install, restart IDE, and start generating! 🚀
