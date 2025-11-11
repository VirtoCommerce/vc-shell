# VC-Shell AI Codegen - Architecture

## Overview

VC-Shell AI Codegen is a **fully automatic code generator** that transforms UI-Plan JSON into complete, production-ready Vue 3 modules using AST transformations and pattern-based generation.

**Key principle:** AI does NOT manually adapt code. All generation is automated via MCP tools.

---

## Architecture Diagram

```
User Prompt
    ↓
AI (Cursor/Claude)
    ↓
UI-Plan JSON Generation
    ↓
validate_ui_plan (MCP Tool)
    ↓
generate_complete_module (MCP Tool)
    ↓
┌─────────────────────────────────────┐
│   UnifiedCodeGenerator              │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  TemplateAdapter (AST)       │  │
│  │  - Load template             │  │
│  │  - Parse to AST              │  │
│  │  - Transform (Entity→Vendor) │  │
│  │  - Generate code             │  │
│  └──────────────────────────────┘  │
│           ↓                         │
│  ┌──────────────────────────────┐  │
│  │  ComposableGenerator         │  │
│  │  - useEntityList pattern     │  │
│  │  - useEntityDetails pattern  │  │
│  │  - Mock data generation      │  │
│  └──────────────────────────────┘  │
│           ↓                         │
│  ┌──────────────────────────────┐  │
│  │  LocaleGenerator             │  │
│  │  - Extract i18n keys         │  │
│  │  - Generate JSON structure   │  │
│  │  - Default translations      │  │
│  └──────────────────────────────┘  │
│           ↓                         │
│  ┌──────────────────────────────┐  │
│  │  ModuleRegistrar             │  │
│  │  - Parse main.ts (AST)       │  │
│  │  - Add import                │  │
│  │  - Add .use() call           │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
    ↓
Complete Module
    ↓
Write to Disk
    ↓
✅ Ready to Use!
```

---

## Core Components

### 1. UnifiedCodeGenerator

**Main orchestrator** that coordinates all generation components.

**Responsibilities:**
- Validates UI-Plan
- Generates blades (calls TemplateAdapter)
- Generates composables (calls ComposableGenerator)
- Generates locales (calls LocaleGenerator)
- Creates module structure files
- Registers module (calls ModuleRegistrar)

**Key Method:**
```typescript
async generateModule(plan: UIPlan, cwd: string): Promise<GeneratedModule>
```

**Returns:**
- All generated files (paths + content)
- Summary (blade count, composable count, etc.)
- Registration status

---

### 2. TemplateAdapter

**AST-based template transformation** using Babel.

**Process:**
1. Parse Vue SFC to AST (template + script sections)
2. Transform script AST:
   - Replace identifiers (Entity → Vendor)
   - Update defineOptions (name, url)
   - Update columns array
   - Update i18n keys
3. Transform template (regex for simplicity)
4. Rebuild SFC

**Technologies:**
- `@babel/parser` - Parse TypeScript
- `@babel/traverse` - Walk AST
- `@babel/generator` - Generate code
- `@vue/compiler-sfc` - Parse Vue SFC

**Why AST?**
- ✅ Syntactically correct code
- ✅ Preserve code structure
- ✅ Handle complex transformations
- ❌ No string replace bugs

---

### 3. ComposableGenerator

**Pattern-based composable generation** with mock data.

**Patterns:**

**List Composable (useEntityList):**
```typescript
- Mock data array (3 items)
- Reactive state (items, loading, totalCount, currentPage)
- Computed properties (pages)
- CRUD methods (loadItems, deleteItem)
- Pagination logic
- Search/filter support
```

**Details Composable (useEntityDetails):**
```typescript
- Empty entity factory
- Reactive state (item, loading, modified)
- Modification tracking (watch)
- CRUD methods (loadItem, saveItem, deleteItem)
- Reset modification state
```

**Mock Data Benefits:**
- ✅ UI works immediately
- ✅ No backend dependency
- ✅ Easy to replace with real API later
- ✅ Testing without server

---

### 4. LocaleGenerator

**Automatic i18n structure generation**.

**Process:**
1. Extract columns/fields from plan
2. Generate nested locale structure
3. Follow pattern: MODULE.PAGES.BLADE.SECTION.KEY
4. Generate default translations

**Structure:**
```json
{
  "MODULE_NAME": {
    "MENU": { "TITLE": "..." },
    "PAGES": {
      "LIST": {
        "TITLE": "...",
        "TOOLBAR": { "ADD": "...", "REFRESH": "..." },
        "TABLE": { "HEADER": { "FIELD": "..." } },
        "EMPTY": { ... },
        "NOT_FOUND": { ... }
      },
      "DETAILS": {
        "TITLE": "...",
        "TOOLBAR": { "SAVE": "...", "DELETE": "..." },
        "FORM": { "INFO": { "FIELD": "...", "FIELD_PLACEHOLDER": "..." } },
        "ALERTS": { ... }
      }
    }
  }
}
```

---

### 5. ModuleRegistrar

**Automatic module registration** in main.ts using AST.

**Process:**
1. Parse main.ts to AST
2. Check if already registered (avoid duplicates)
3. Find last module import
4. Insert new import after it
5. Find .use(router) call
6. Insert .use(Module, { router }) before it
7. Generate updated code

**Why AST?**
- ✅ Preserves formatting
- ✅ Handles complex chains
- ✅ Avoids breaking existing code

---

## MCP Server Architecture

### Tool Categories

**1. Generation Tools (Automatic):**
- `generate_complete_module` - Main generation
- `generate_blade` - Single blade generation

**2. Validation Tools:**
- `validate_ui_plan` - Schema validation
- `validate_and_fix_plan` - Validation + fixes

**3. Discovery Tools:**
- `search_components` - Find components
- `view_components` - Component details
- `get_component_examples` - Usage examples

**4. Helper Tools:**
- `scaffold_app` - New project
- `get_blade_template` - Template reference
- `get_audit_checklist` - Quality checks

### Resources (Context for AI)

1. **vcshell://component-registry** - 42 components
2. **vcshell://ui-plan-schema** - JSON Schema
3. **vcshell://blade-list-pattern** - List example
4. **vcshell://blade-details-pattern** - Details example
5. **vcshell://composable-list-pattern** - useEntityList
6. **vcshell://composable-details-pattern** - useEntityDetails
7. **vcshell://component-templates** - Slot components

---

## Workflow

### Step 1: UI-Plan Generation

**AI Task:** Parse user prompt into structured JSON

```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "vendor-management",
  "blades": [
    {
      "id": "vendors-list",
      "route": "/vendors",
      "layout": "grid",
      "title": "Vendors",
      "isWorkspace": true,
      "components": [
        {
          "type": "VcTable",
          "columns": [
            { "key": "name", "title": "Name", "type": "text", "sortable": true },
            { "key": "email", "title": "Email", "type": "email" },
            { "key": "status", "title": "Status", "type": "status" }
          ]
        }
      ]
    },
    {
      "id": "vendor-details",
      "route": "/vendor",
      "layout": "details",
      "title": "Vendor Details",
      "components": [
        {
          "type": "VcForm",
          "fields": [
            { "key": "name", "as": "VcInput", "label": "Name", "type": "text", "required": true },
            { "key": "email", "as": "VcInput", "label": "Email", "type": "email", "required": true }
          ]
        }
      ]
    }
  ]
}
```

### Step 2: Automatic Generation

**Tool Call:** `generate_complete_module(plan, cwd)`

**Execution:**
```
1. Validate plan ✓
2. Load templates (list-simple.vue, details-simple.vue)
3. Adapt via AST:
   - Entity → Vendor
   - ENTITIES → VENDORS
   - /entities → /vendors
   - Update columns/fields
4. Generate composables:
   - useVendorList with mock data
   - useVendorDetails with mock data
5. Generate locales:
   - Extract keys
   - Build JSON structure
6. Create module files:
   - index.ts
   - pages/index.ts
   - composables/index.ts
   - locales/index.ts
7. Register in main.ts ✓
8. Write all files ✓
```

**Output:**
```
✅ Module generated successfully!
- 2 blades (vendors-list.vue, vendor-details.vue)
- 2 composables (useVendorList.ts, useVendorDetails.ts)
- 2 locales (en.json, index.ts)
- 5 module files (index.ts, pages/index.ts, etc.)
- Registered in main.ts

Total: 11 files, ~800 lines of code
Time: 30 seconds
```

---

## Two Patterns

### Pattern 1: List Blade

**Structure:**
```
VcBlade
  └─ VcTable
      ├─ columns (auto-generated)
      ├─ toolbar (refresh, add)
      ├─ search
      ├─ sort
      ├─ pagination
      └─ item-click → opens details
```

**Features:**
- Search by keyword
- Sort by columns
- Pagination
- Empty state
- Not found state
- Navigation to details

**Optional:**
- filters slot
- multiselect
- custom column slots

### Pattern 2: Details Blade

**Structure:**
```
VcBlade
  └─ VcContainer
      └─ VcForm
          ├─ fields (auto-generated)
          └─ validation (vee-validate)
```

**Features:**
- Form validation
- Save/delete toolbar
- Modification tracking
- Unsaved changes warning
- Empty entity factory

**Optional:**
- VcGallery for images
- VcCard sections
- Async validation

---

## Code Quality

### AST Transformations Ensure:
- ✅ Valid TypeScript syntax
- ✅ Proper imports
- ✅ Correct defineOptions
- ✅ Consistent naming
- ✅ Type safety

### Generated Code Includes:
- ✅ Full TypeScript types
- ✅ Vue 3 Composition API
- ✅ vee-validate integration
- ✅ i18n strings (no hardcoded text)
- ✅ Tailwind CSS classes
- ✅ Proper event handlers
- ✅ Lifecycle hooks

### Mock Data Features:
- ✅ Realistic data structure
- ✅ Simulated API delays (300ms)
- ✅ Pagination support
- ✅ Search/filter support
- ✅ Easy to replace with real API

---

## Extensibility

### Adding New Features

**To add filters support:**
1. Extend UI-Plan schema: Add "filters" to features enum
2. Update TemplateAdapter: Add filters slot transformation
3. Update ComposableGenerator: Add filters state management
4. Update LocaleGenerator: Add filter-related keys

**To add new column type:**
1. Add to ui-plan.v1.schema.json column.type enum
2. Update ComposableGenerator mock data generation
3. Document in component registry

---

## Performance

### Generation Speed:
- **UI-Plan validation:** < 100ms
- **Code generation:** 1-2 seconds
- **File writing:** 100-200ms
- **Total:** ~30 seconds (including AI time)

### Files Generated:
- Blades: 2 files (~200 lines each)
- Composables: 2 files (~100 lines each)
- Locales: 1 JSON file (~50 keys)
- Module files: 5 files (~10 lines each)
- **Total:** 11 files, ~800 lines

---

## Future Enhancements

### Possible Additions:
1. **Widget System** - Generate dashboard widgets
2. **State Machine Integration** - Generate state machine workflows
3. **API Client Auto-Generation** - From OpenAPI/Swagger specs
4. **Multi-Language i18n** - Generate ru.json, de.json, etc.
5. **Component Tests** - Generate Vitest tests
6. **Storybook Stories** - Generate component stories

### NOT Planned:
- ❌ Visual UI builder (not needed with AI)
- ❌ Live preview (dev server handles this)
- ❌ Ready module examples (modules can be on any topic)

---

## Comparison with Other Tools

### vs v0.dev (Vercel)
- **v0.dev:** Visual preview, iterative editing, React-focused
- **vc-shell/ai-codegen:** Direct code generation, Vue 3, VC-Shell specific

### vs shadcn CLI
- **shadcn:** Copy ready components from registry
- **vc-shell/ai-codegen:** Generate custom modules from prompts

### Unique Advantages:
- ✅ Vue 3 + TypeScript + VC-Shell framework
- ✅ Full module generation (not just components)
- ✅ Business logic with composables
- ✅ Automatic registration
- ✅ Works in IDE (no separate UI)

---

## Technical Decisions

### Why AST over String Replace?
- **Safety:** Syntactically correct code
- **Maintainability:** Clear transformations
- **Flexibility:** Complex transformations possible
- **Type Safety:** Preserves TypeScript types

### Why Mock Data?
- **Immediate Testing:** UI works without backend
- **Development Speed:** No API setup needed
- **Flexibility:** Easy to replace later
- **Documentation:** Shows expected data structure

### Why Two Patterns Only?
- **Simplicity:** Covers 90% of use cases
- **Quality:** Well-tested patterns
- **Maintainability:** Easy to understand
- **Extensibility:** Can be combined

---

## Dependencies

### Production:
- `@babel/*` - AST parsing and transformation
- `@vue/compiler-sfc` - Vue SFC parsing
- `@modelcontextprotocol/sdk` - MCP server
- `zod` - Schema validation
- `lodash-es` - String utilities

### Development:
- `vitest` - Testing
- `typescript` - Type checking
- `tsup` - Build tool

---

## Testing Strategy

### Unit Tests:
- TemplateAdapter - AST transformations
- ComposableGenerator - Pattern generation
- LocaleGenerator - Key extraction
- ModuleRegistrar - main.ts updates
- Validator - Schema validation

### Integration Tests:
- UnifiedCodeGenerator - Full module generation
- End-to-end workflow
- File writing
- Module registration

### Coverage Goals:
- Core logic: 90%+
- MCP handlers: 80%+
- Overall: 85%+

---

## Version History

**0.1.0** (2025-11-11):
- ✅ Full automatic code generation via AST
- ✅ Mock data support
- ✅ generate_complete_module MCP tool
- ✅ Strict workflow enforcement
- ✅ Comprehensive tests

**Previous (0.0.x):**
- Basic scaffolding
- Manual template adaptation
- AI-dependent generation

---

**Ready for production use!** 🚀

