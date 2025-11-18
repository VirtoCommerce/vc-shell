# VC-Shell AI Guidance System

Comprehensive AI guidance system for the VC-Shell framework, allowing clients without framework knowledge to create and modify applications using natural language.

---

## 🤖 FOR AI ASSISTANTS: CRITICAL INSTRUCTIONS

**You are in a VC-Shell project. Read this FIRST before any task.**

### 📋 Your Capabilities & Workflow

1. **Generate Complete App with Module (Grid + Details)**

   ```bash
   # Step 1: Create app
   npx create-vc-app {app-name} --skip-module-gen
   cd {app-name}

   # Step 2: Create grid blade (creates module)
   npx create-vc-app generate --module {name} --type grid --name {entity} --form-fields '{fields}'

   # Step 3: Add details blade
   npx create-vc-app generate --module {name} --type details --name {entity} --form-fields '{fields}'
   ```

   - See: `prompts/cli-usage.md` for complete CLI reference
   - See: `prompts/quick-start-scenarios.md` for ready-to-use templates

2. **Modify Existing Code**
   - See: `prompts/simple-modifications.md` for 65+ modification templates
   - See: `prompts/advanced-scenarios.md` for complex patterns
   - Always follow patterns from root `.cursorrules`

3. **Use VC-Shell Components**
   - **ALWAYS check:** `UI_COMPONENTS_REFERENCE.md` (27 components documented)
   - **NEVER create custom** if VC-Shell has it
   - See: `guides/ui-components-reference.md` for advanced usage

4. **Follow Framework Patterns**
   - Composables: `guides/composables-reference.md`
   - Blade System: `guides/blade-patterns.md`
   - Complete Workflow: `guides/complete-workflow.md`

### ⚡ Quick Decision Tree

```
User Request
  ├─ New App with Module? → 3 commands
  │   ├─ Create app: npx create-vc-app {app} --skip-module-gen
  │   ├─ Add grid: npx create-vc-app generate --module {name} --type grid --name {entity}
  │   └─ Add details: npx create-vc-app generate --module {name} --type details --name {entity}
  │
  ├─ New Module in Existing App? → Use CLI (`prompts/cli-usage.md`)
  │   ├─ Common type? → Use template (`prompts/quick-start-scenarios.md`)
  │   └─ Custom? → Build from scratch with CLI
  │
  ├─ Modify Existing? → Check template (`prompts/simple-modifications.md`)
  │   ├─ Simple change? → Use template as-is
  │   └─ Complex? → Combine patterns (`prompts/advanced-scenarios.md`)
  │
  ├─ Component Question? → Check `UI_COMPONENTS_REFERENCE.md`
  │
  └─ Error/Issue? → Check `guides/troubleshooting.md`
```

### ✅ CRITICAL RULES (From `.cursorrules`)

**ALWAYS:**

- Use `npx create-vc-app generate` for new modules/blades
- Check `UI_COMPONENTS_REFERENCE.md` before using components
- Use `VcCard` for sections (tabs don't exist!)
- Follow composable patterns
- Add validation (VeeValidate)
- Use i18n for all text
- Track modifications with `useModificationTracker`

**NEVER:**

- Create custom components if VC-Shell has one
- Add custom HTML inside `VcWidget` (props only!)
- Use tabs (use `VcCard`)
- Skip validation or i18n
- Modify `core/` or `shared/` directories

### 📖 File Priority Order

When answering questions, consult in this order:

1. **Root `.cursorrules`** - Framework rules & patterns
2. **`UI_COMPONENTS_REFERENCE.md`** - Component documentation
3. **`prompts/{relevant}.md`** - Task-specific templates
4. **`guides/{relevant}.md`** - Technical guides
5. **User's existing code** - Current implementation

---

## What is this?

This system provides AI assistants with complete knowledge of the VC-Shell framework, including:

- All 45 UI components with their props and events
- Blade system with 4 required props
- Module patterns and composables
- Correct API integration
- Form validation with VeeValidate
- CLI usage and automation
- Complete development workflow
- And much more

## Getting Started in 5 Minutes

### 1. Create Your Application

```bash
npx create-vc-app my-app
```

### 2. Let AI Build Your First Module

Open your AI assistant and say:

```
Create a products module with list and details views.
Add fields: name, price, category, description.
```

### 3. Run and Test

```bash
cd my-app
yarn
yarn serve
```

**Open:** `http://localhost:8080/apps/my-app/`

✅ **Done!** You now have a working application with a products module.

---

## How to Use This System

### For New Projects

When creating a new application via `create-vc-app`, the AI guidance system is automatically included in your project at `ai-guides/`.

### For Existing Projects

Copy the `.cursorrules-vc-shell` file to your project root and rename it to `.cursorrules`.

### Choose Your Prompt

Use this decision tree to find the right resource:

```
Need to...
├── Understand core patterns?
│   └── Read: .cursorrules-vc-shell (PRIMARY REFERENCE)
│
├── Find component API?
│   └── Check: UI_COMPONENTS_REFERENCE.md
│
├── Create new app?
│   └── See: prompts/cli-usage.md (Section: Create New Application)
│
├── Generate module?
│   ├── Common type? (products, orders, etc.)
│   │   └── See: prompts/quick-start-scenarios.md
│   └── Custom module?
│       └── See: prompts/cli-usage.md (Section: Generate Module)
│
├── Connect to API?
│   ├── VirtoCommerce Platform?
│   │   └── See: prompts/api-client-generation.md (VirtoCommerce)
│   ├── Custom REST API?
│   │   └── See: prompts/api-client-generation.md (Custom API)
│   └── GraphQL?
│       └── See: prompts/api-client-generation.md (GraphQL)
│
├── Modify existing module?
│   ├── Simple changes? (add field, change control)
│   │   └── See: prompts/simple-modifications.md
│   └── Complex changes? (dynamic forms, workflows)
│       └── See: prompts/advanced-scenarios.md
│
├── Having issues?
│   ├── First: guides/troubleshooting.md
│   └── Then: .cursorrules-vc-shell (Common Pitfalls section)
│
└── Want full walkthrough?
    └── See: guides/complete-workflow.md
```

## System Structure

### Main Files ⭐

- **`.cursorrules-vc-shell`** - **PRIMARY AI RULESET**. Auto-loaded by Cursor IDE. Contains:
  - Complete framework patterns
  - Essential code examples
  - Deprecated patterns to avoid
  - Verification checklist
  - Common pitfalls and solutions
- **`UI_COMPONENTS_REFERENCE.md`** - **COMPLETE COMPONENTS GUIDE**:
  - All 45+ UI components with props and events
  - Form components (VcInput, VcSelect, VcEditor, VcGallery, etc.)
  - Layout components (VcCard, VcBlade)
  - Data display (VcTable, VcWidget)
  - Usage examples and patterns
- **`README.md`** - This overview file

### Prompt Templates (`prompts/`)

**Getting Started:**

- **`cli-usage.md`** - Complete CLI reference with examples
- **`quick-start-scenarios.md`** - Ready-to-use prompts for common modules (10 scenarios)
- **`api-client-generation.md`** - Connecting to APIs (VirtoCommerce, REST, GraphQL)

**Customization:**

- **`simple-modifications.md`** - Universal prompt templates for any modification (65+ templates)
- **`adapt-existing-module.md`** - Complete guide for adapting existing modules to your needs
- **`advanced-scenarios.md`** - Complex patterns (dynamic forms, wizards, workflows)

### Technical Guides (`guides/`)

**Essential:**

- **`complete-workflow.md`** - Full development workflow from creation to deployment
- **`troubleshooting.md`** - Solutions for common issues

## Real-World Examples

### Example 1: E-commerce from Scratch

**User said:**

```
Create a complete e-commerce application.
I need: products, categories, orders, customers modules.
Each with list and edit views.
Use create-vc-app CLI to generate everything.
```

**AI did:**

1. Created app with `npx create-vc-app my-shop`
2. Generated 4 modules using CLI
3. Created appropriate form fields for each
4. Set up module registration
5. Result: Working app with 4 modules in ~5 minutes

### Example 2: Custom API Integration

**User said:**

```
Connect my products module to my backend at https://api.myshop.com

My API uses:
- JWT authentication
- GET /api/v1/products (list with pagination)
- POST /api/v1/products (create)
- PUT /api/v1/products/{id} (update)
- DELETE /api/v1/products/{id} (delete)

Response format: { data: [], total: number }
```

**AI did:**

1. Created custom API client in `src/api_client/`
2. Updated composables to use the API
3. Added authentication headers
4. Handled pagination correctly
5. Result: Module connected to real backend

### Example 3: Modify Existing Module

**User said:**

```
I have this products module [shows code].
Add these fields:
- SKU (text, required, unique)
- Weight (number with kg units)
- Tags (multiple values)
- Images (gallery with 5 max)
Remove the "oldDescription" field.
```

**AI did:**

1. Analyzed existing code structure
2. Added new form fields with correct components
3. Added validation rules
4. Updated locales
5. Removed old field
6. Result: Updated module with new fields

### Example 4: Complex Workflow

**User said:**

```
Create document approval workflow:
Draft → Submit → Approve/Reject → Publish

Rules:
- Authors can create and submit
- Reviewers can approve/reject
- Admins can override any state
Show approval history timeline.
```

**AI did:**

1. Implemented state machine
2. Created role-based permissions
3. Added state transition validation
4. Built history timeline component
5. Added notifications for state changes
6. Result: Complete approval system

---

## Tips for Better AI Results

### ✅ Do This:

```
Create an orders module using create-vc-app CLI.

Requirements:
- Grid blade with columns: order number, customer, total, status, date
- Details blade with these fields:
  - Order number (text, read-only)
  - Customer (text, required)
  - Total (currency, required)
  - Status (select: pending, shipped, delivered)
  - Date (date picker, default today)

Connect to API at https://api.example.com/orders
```

**Why it works:**

- Specific about tool (CLI)
- Clear structure
- Detailed requirements
- Mentions API connection

### ❌ Don't Do This:

```
Make a orders thing
```

**Why it doesn't work:**

- Too vague
- No context
- No requirements
- No mention of framework/CLI

### More Tips:

1. **Be Specific:** Describe exact fields and types
2. **Mention CLI:** Say "use create-vc-app CLI" or "generate with CLI"
3. **Provide API Info:** Include endpoints and authentication
4. **Show Examples:** Reference similar modules or show code snippets
5. **Break It Down:** For complex features, describe step by step

## System Capabilities

### What AI can do

- Create complete modules from scratch
- Modify existing blades
- Connect to any API (REST, GraphQL)
- Generate API clients
- Register modules in applications
- Create forms with validation
- Configure tables and filters
- Add authentication
- Customize UI
- And much more!

### Key Features

- **Natural language** - simply describe what you want
- **Complete framework knowledge** - AI knows all 45 components
- **Universality** - works with any modules and APIs
- **Automatic integration** - works out of the box in new projects
- **Self-sufficiency** - no need to refer to external documentation

## Quick Start

### 1. Creating a new project

```bash
npx create-vc-app my-app
cd my-app
```

AI guidance is already included! Now you can use AI for development.

### 2. Adding a module

Open AI chat and write:

```
Create an orders module with list and edit forms
```

### 3. Modifying existing module

```
Add "SKU" field and category filter to products module
```

### 4. Connecting to API

```
Connect module to my API: https://api.example.com
```

## Technical Details

### Blade System

- **4 required props**: expanded, closable, param, options
- **Events**: parent:call, close:blade, collapse:blade, expand:blade
- **Toolbar**: IBladeToolbar[] with id, title, icon, onClick, disabled, loading

### Module Structure

```
src/modules/[name]/
├── pages/list.vue, details.vue, index.ts
├── composables/use[Name]List/, use[Name]Details/, index.ts
├── locales/en.json, index.ts
└── index.ts (createAppModule)
```

### API Integration

1. Add to `.env.local`: `APP_PLATFORM_URL=https://platform-url/`
2. Run: `yarn generate-api-client`
3. Use: `const { getApiClient } = useApiClient(Client)`

### Form Validation

```vue
<Field name="field" v-slot="{ errors, errorMessage, handleChange }" :rules="{ required: true }">
  <VcInput 
    :model-value="data.field" 
    :error-message="errorMessage"
    @update:model-value="(v) => { data.field = v; handleChange(v); }"
  />
</Field>
```
