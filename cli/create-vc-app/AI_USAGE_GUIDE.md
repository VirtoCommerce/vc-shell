# AI Usage Guide for create-vc-app

This guide is specifically designed for AI assistants to help users generate VC Shell applications, modules, blades, and widgets using non-interactive commands and AI-powered code generation.

## AI-Generated UI (NEW!)

### Quick Start with AI Generation

Generate complete VC Shell modules from natural language prompts:

```bash
# 1. Generate UI-Plan from prompt
pnpm vcgen plan --from-prompt "Product catalog: grid with search, details form with gallery"

# 2. Generate code from plan
pnpm vcgen generate --plan ./__ai/ui-plan.json --fix --story

# 3. Start development server
pnpm dev
```

### Using Cursor AI

If you're using Cursor IDE, you can use custom commands:

**Generate UI-Plan:**
```
/ui-plan "Vendor list with status filter and add button"
```

**Generate Code:**
```
/ui-gen
```

See `.cursorrules` in your project for detailed commands and @Docs for component registry.

### UI-Plan Structure

A UI-Plan is a declarative JSON that describes your UI. Example:

```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "products",
  "blades": [
    {
      "id": "product-list",
      "route": "/products",
      "layout": "grid",
      "title": "Products",
      "components": [
        {
          "type": "DataTable",
          "dataSource": "products",
          "columns": [
            {"key": "name", "title": "Name"},
            {"key": "price", "title": "Price"}
          ],
          "actions": ["add", "edit"]
        }
      ],
      "permissions": ["product:read"]
    }
  ]
}
```

### Available vcgen Commands

**`vcgen plan`** - Generate UI-Plan from prompt
- `--from-prompt <text>` - Natural language description
- `--output <path>` - Output path (default: `./__ai/ui-plan.json`)
- `--module <name>` - Force module name

**`vcgen generate`** - Generate code from UI-Plan
- `--plan <path>` - Path to UI-Plan JSON (required)
- `--dry-run` - Show what would be generated
- `--fix` - Run ESLint/Prettier after generation
- `--story` - Generate Storybook stories
- `--cwd <path>` - Working directory

**`vcgen validate`** - Validate UI-Plan
- `--plan <path>` - Path to UI-Plan JSON

### Examples

**Example 1: Simple List**
```bash
pnpm vcgen plan --from-prompt "Orders list with search and date filter"
```
Result: Grid blade with VcTable, search bar, date range filter

**Example 2: Complete Module**
```bash
pnpm vcgen plan --from-prompt "Product catalog: grid with name, price, status. Details form with validation. Admin can add/edit/delete."
```
Result: Grid + Details blades, full CRUD operations

**Example 3: Multi-step Wizard**
```bash
pnpm vcgen plan --from-prompt "Vendor onboarding: Step 1 company info, Step 2 contacts, Step 3 review"
```
Result: Details blade with steps[], navigation buttons

### Generated Files

For a typical module, vcgen generates:
- `pages/{module}.vue` - Grid blade (if applicable)
- `pages/{module}-details.vue` - Details blade (if applicable)
- `composables/use{Module}List.ts` - Grid composable
- `composables/use{Module}Details.ts` - Details composable
- `locales/en.json` - i18n translations
- `pages/index.ts` - Blade exports
- `index.ts` - Module entry point

### Next Steps After Generation

1. **Review generated code** - Check all files
2. **Update API clients** - Replace TODO comments with actual API calls
3. **Test the UI** - Run `pnpm dev` and navigate to your module
4. **Customize as needed** - Adjust fields, validation, styling
5. **Commit changes** - `git add` and `git commit`

---

## Quick Reference

### Create New Application

```bash
node /path/to/cli/create-vc-app/dist/index.js <app-name> \
  --package-name "<package-name>" \
  --base-path "/apps/<app-name>/" \
  [--skip-module-gen] \
  [--overwrite]
```

### Generate Module/Blade/Widget

```bash
node /path/to/cli/create-vc-app/dist/index.js blade \
  --module <module-name> \
  --type <grid|details> \
  --name <blade-name> \
  [--composable] \
  [--locales] \
  [--is-workspace] \
  [--widget] \
  [--form-fields '<json>'] \
  [--skip-form-editor]
```

---

## 1. Creating Applications

### Basic App Creation (without module)

```bash
npx create-vc-app my-app \
  --package-name "my-app" \
  --base-path "/apps/my-app/" \
  --skip-module-gen \
  --overwrite
```

**Result:**
- Creates base application structure (60 files)
- No modules created
- Package name: `my-app`
- Base path: `/apps/my-app/`

### App with Module (requires interactive module input)

```bash
# Note: Module creation requires interactive input
# Use this command, then provide inputs when prompted
npx create-vc-app my-app

# Inputs needed:
# - Module name: (e.g., products)
# - Entity name: (e.g., Product)
# - Create both blades: yes/no
# - Workspace blade: Grid blade / Details blade
# - Customize form: yes/no
```

**Alternative:** Create app first, then add module separately:

```bash
# Step 1: Create app
npx create-vc-app my-app --skip-module-gen

# Step 2: Add module (see Module Generation section)
cd my-app
node ../../cli/create-vc-app/dist/index.js blade \
  --module products --type grid --name products --is-workspace
```

---

## 2. Module Generation

### Complete Module (Grid + Details) - Recommended Approach

**Three-step process for complete app with module:**

```bash
# Step 1: Create base app (no module)
npx create-vc-app my-shop --skip-module-gen
cd my-shop

# Step 2: Create grid blade (creates module automatically)
npx create-vc-app generate \
  --module products \
  --type grid \
  --name product \
  --form-fields '[
    {"name":"name","type":"text"},
    {"name":"sku","type":"text"},
    {"name":"price","type":"currency"},
    {"name":"status","type":"select"}
  ]'

# Step 3: Add details blade to existing module
npx create-vc-app generate \
  --module products \
  --type details \
  --name product \
  --form-fields '[
    {"name":"name","type":"text"},
    {"name":"sku","type":"text"},
    {"name":"description","type":"editor"},
    {"name":"price","type":"currency"},
    {"name":"images","type":"gallery"},
    {"name":"active","type":"switch"}
  ]'
```

**Result:**
- Complete app with products module
- Grid blade (list view) + Details blade (form)
- Both blades registered automatically
- Module registered in main.ts

### Alternative: Add Blades Separately

```bash
# Grid blade (list view)
npx create-vc-app generate \
  --module products \
  --type grid \
  --name product \
  --composable \
  --locales \
  --is-workspace

# Details blade (form view)
npx create-vc-app generate \
  --module products \
  --type details \
  --name product \
  --composable \
  --locales
```

### Module with Custom Form Fields (JSON)

```bash
npx create-vc-app blade \
  --module products \
  --type details \
  --name product-details \
  --composable \
  --locales \
  --skip-form-editor \
  --form-fields '[
    {"name":"title","type":"text","required":true},
    {"name":"price","type":"currency","required":true},
    {"name":"description","type":"editor","required":false},
    {"name":"category","type":"select","required":true,"options":"Electronics,Clothing,Books"},
    {"name":"inStock","type":"switch","required":true},
    {"name":"images","type":"gallery","required":false}
  ]'
```

---

## 3. Form Field Definitions (JSON Schema)

### Field Schema

```typescript
interface FormField {
  name: string;          // Field name (e.g., "price", "description")
  type: FieldType;       // Component type (see below)
  required: boolean;     // Is field required
  options?: string;      // For select/radio: comma-separated (e.g., "Option1,Option2")
}

type FieldType = 
  | "text"         // VcInput type="text"
  | "number"       // VcInput type="number"
  | "date"         // VcInput type="date"
  | "textarea"     // VcTextarea
  | "select"       // VcSelect (requires options)
  | "editor"       // VcEditor (rich text)
  | "switch"       // VcSwitch (boolean)
  | "gallery"      // VcGallery (images) + useAssets
  | "currency"     // VcInputCurrency
  | "radio"        // VcRadioButton (requires options)
  | "checkbox"     // VcCheckbox
  | "multivalue"   // VcMultivalue
  | "field";       // VcField (read-only)
```

### Field Examples

```json
[
  {
    "name": "title",
    "type": "text",
    "required": true
  },
  {
    "name": "price",
    "type": "currency",
    "required": true
  },
  {
    "name": "description",
    "type": "editor",
    "required": false
  },
  {
    "name": "category",
    "type": "select",
    "required": true,
    "options": "Electronics,Clothing,Books,Home & Garden"
  },
  {
    "name": "condition",
    "type": "radio",
    "required": true,
    "options": "New,Used,Refurbished"
  },
  {
    "name": "featured",
    "type": "switch",
    "required": false
  },
  {
    "name": "images",
    "type": "gallery",
    "required": false
  },
  {
    "name": "tags",
    "type": "multivalue",
    "required": false
  }
]
```

---

## 4. Widget Generation

### Non-Interactive Widget Generation (Recommended for AI)

```bash
npx create-vc-app generate \
  --widget \
  --widget-module products \
  --widget-blade product-details \
  --widget-name Stats \
  --widget-entity Product \
  --widget-icon material-sell
```

**Parameters:**
- `--widget` - Enable widget generation mode
- `--widget-module` - Module name (e.g., `products`)
- `--widget-blade` - Blade name without `.vue` (e.g., `product-details`)
- `--widget-name` - Widget display name (e.g., `Stats`, `Chart`)
- `--widget-entity` - Related entity name (e.g., `Product`, `Order`)
- `--widget-icon` - Material icon name (optional, default: `material-list`)

**Available Icons:**
- `material-list` - List icon
- `material-sell` - Price/sell icon
- `material-shopping_cart` - Shopping cart
- `material-star` - Star/rating
- `material-image` - Image icon
- `material-description` - Description/document
- Any Material Design icon name

**What Gets Created:**
- `components/widgets/{widget-name}/{widget-name}-widget.vue`
- `components/widgets/{widget-name}/index.ts`
- Auto-export in `components/widgets/index.ts`
- Auto-registration in parent blade with `useWidgets()`
- Auto-updates locales with `WIDGETS.{WIDGET_NAME}.TITLE`

### Interactive Widget Generation

```bash
# Interactive mode (prompts for all parameters)
npx create-vc-app generate --widget

# Then select:
# - Module: products
# - Blade: product-details
# - Widget name: Stats
# - Entity: Product
# - Icon: Sell/Price (material-sell)
```

---

## 5. Common Usage Patterns

### Pattern 1: E-commerce Product Module

```bash
# Grid blade for product list
npx create-vc-app blade \
  --module products \
  --type grid \
  --name products \
  --is-workspace \
  --composable \
  --locales

# Details blade with comprehensive form
npx create-vc-app blade \
  --module products \
  --type details \
  --name product-details \
  --composable \
  --locales \
  --skip-form-editor \
  --form-fields '[
    {"name":"name","type":"text","required":true},
    {"name":"sku","type":"text","required":true},
    {"name":"price","type":"currency","required":true},
    {"name":"description","type":"editor","required":false},
    {"name":"category","type":"select","required":true,"options":"Electronics,Clothing,Books,Home & Garden"},
    {"name":"inStock","type":"switch","required":true},
    {"name":"featured","type":"switch","required":false},
    {"name":"images","type":"gallery","required":false}
  ]'
```

### Pattern 2: Order Management Module

```bash
# Orders list
npx create-vc-app blade \
  --module orders \
  --type grid \
  --name orders \
  --is-workspace \
  --composable \
  --locales

# Order details with form
npx create-vc-app blade \
  --module orders \
  --type details \
  --name order-details \
  --composable \
  --locales \
  --skip-form-editor \
  --form-fields '[
    {"name":"orderNumber","type":"text","required":true},
    {"name":"customerName","type":"text","required":true},
    {"name":"orderDate","type":"date","required":true},
    {"name":"status","type":"select","required":true,"options":"Pending,Processing,Shipped,Delivered,Cancelled"},
    {"name":"totalAmount","type":"currency","required":true},
    {"name":"notes","type":"textarea","required":false},
    {"name":"isPaid","type":"switch","required":true}
  ]'
```

### Pattern 3: Customer Management Module

```bash
# Customers list
npx create-vc-app generate \
  --module customers \
  --type grid \
  --name customer \
  --is-workspace \
  --composable \
  --locales

# Customer details
npx create-vc-app generate \
  --module customers \
  --type details \
  --name customer \
  --composable \
  --locales \
  --skip-form-editor \
  --form-fields '[
    {"name":"firstName","type":"text","required":true},
    {"name":"lastName","type":"text","required":true},
    {"name":"email","type":"text","required":true},
    {"name":"phone","type":"text","required":false},
    {"name":"memberType","type":"select","required":true,"options":"Regular,Premium,VIP"},
    {"name":"isActive","type":"switch","required":true},
    {"name":"notes","type":"textarea","required":false}
  ]'
```

### Pattern 4: Product Module with Widget

```bash
# Step 1: Create grid blade
npx create-vc-app generate \
  --module products \
  --type grid \
  --name product \
  --is-workspace

# Step 2: Create details blade
npx create-vc-app generate \
  --module products \
  --type details \
  --name product \
  --form-fields '[
    {"name":"name","type":"text","required":true},
    {"name":"sku","type":"text","required":true},
    {"name":"price","type":"currency","required":true},
    {"name":"description","type":"editor","required":false},
    {"name":"images","type":"gallery","required":false}
  ]'

# Step 3: Add widget to details blade
npx create-vc-app generate \
  --widget \
  --widget-module products \
  --widget-blade product-details \
  --widget-name Variants \
  --widget-entity ProductVariant \
  --widget-icon material-list
```

**Result:**
- Complete products module with grid and details blades
- Variants widget automatically registered in product-details blade
- Widget displays count of product variants
- All locales updated automatically

---

## 6. Command Options Reference

### App Creation Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--name`, `--app-name` | string | App name | Directory name |
| `--package-name` | string | Package name | App name (validated) |
| `--base-path` | string | Base path | `/apps/<app-name>/` |
| `--skip-module-gen` | boolean | Skip module generation | `false` |
| `--skip-form-editor` | boolean | Skip interactive form builder | `false` |
| `--form-fields` | string | JSON form field definitions | - |
| `--overwrite` | boolean | Overwrite existing files | `false` |

### Blade Generation Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--module` | string | Target module name | - |
| `--type` | string | Blade type (`grid` or `details`) | - |
| `--name` | string | Blade name | - |
| `--composable` | boolean | Generate composable | `true` |
| `--locales` | boolean | Generate locales | `true` |
| `--is-workspace` | boolean | Mark as workspace blade | `false` |
| `--form-fields` | string | JSON form field definitions | - |
| `--skip-form-editor` | boolean | Skip interactive form builder | `false` |

### Widget Generation Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--widget` | boolean | Enable widget generation mode | `false` |
| `--widget-module` | string | Module name for widget | - |
| `--widget-blade` | string | Blade name (without .vue) | - |
| `--widget-name` | string | Widget display name | - |
| `--widget-entity` | string | Related entity name | - |
| `--widget-icon` | string | Material icon name | `material-list` |

---

## 7. Validation Rules

### Package Name
- Must be valid npm package name
- Allowed: `a-z`, `0-9`, `-`, `_`, `.`, `@`, `/`
- Examples:
  - ✅ `my-app`
  - ✅ `@my-org/my-app`
  - ❌ `My App!`
  - ❌ `my app`

### Base Path
- Must start and end with `/`
- Examples:
  - ✅ `/apps/my-app/`
  - ✅ `/custom/path/`
  - ❌ `apps/my-app`
  - ❌ `/apps/my-app`

### Module Name
- Converted to kebab-case
- Examples:
  - Input: `Products` → Output: `products`
  - Input: `My Orders` → Output: `my-orders`

---

## 8. What Gets Created

### App Structure (without module)

```
my-app/
├── src/
│   ├── main.ts                     # App entry point
│   ├── router/                     # Vue Router
│   ├── locales/                    # i18n
│   ├── api_client/                 # API client placeholder
│   └── pages/
│       └── App.vue                 # Root component
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── vite.config.mts
└── .prettierrc                     # 60 files total
```

### Complete Module Structure

```
src/modules/products/
├── pages/
│   ├── index.ts                    # Blade exports
│   ├── products.vue                # Grid blade (~350 lines)
│   └── product-details.vue         # Details blade (~180 lines)
├── composables/
│   ├── index.ts                    # Composable exports
│   ├── useProductList.ts           # Grid logic (~240 lines)
│   └── useProductDetails.ts        # Details logic (~100 lines)
├── locales/
│   ├── index.ts                    # Locale exports
│   └── en.json                     # Translations (~75 lines)
├── components/
│   └── widgets/                    # Widget components
│       └── index.ts
└── index.ts                        # Module definition
```

---

## 9. Automatic Actions

The CLI automatically:

1. ✅ **Registers modules** in `src/main.ts`
2. ✅ **Registers blades** in `pages/index.ts`
3. ✅ **Registers widgets** in parent blade (with `useWidgets`)
4. ✅ **Formats code** with Prettier
5. ✅ **Adds TODO comments** for API integration
6. ✅ **Creates locales** with proper namespaces
7. ✅ **Adds VcGallery helpers** (useAssets, assetsHandler) when gallery field is used
8. ✅ **Validates all inputs** (package name, base path, etc.)

---

## 10. Special Considerations for AI

### When to Use Non-Interactive Mode

✅ **Use non-interactive when:**
- Creating base app without module
- Adding blade to existing module
- Adding widget to existing blade
- Have all form field definitions in JSON
- Automating app generation
- Scripting or CI/CD pipelines

❌ **Don't use non-interactive when:**
- Prefer step-by-step guidance with prompts
- Want to explore available options interactively
- Learning the CLI for the first time

### Handling User Requirements

**If user says:** "Create a product management app"

**AI should:**
1. Create app with module
2. Ask for form fields (or use common e-commerce fields)
3. Generate both Grid and Details blades
4. Suggest widget for statistics

**Example commands:**
```bash
# Create app (requires interactive input for module)
npx create-vc-app my-shop

# When prompted, use:
# Module: products
# Entity: Product
# Both blades: yes
# Workspace: Grid
# Customize: no (or yes if user specified fields)
```

### Error Handling

**Common errors and solutions:**

1. **"Invalid package name"**
   - Remove spaces and special characters
   - Use kebab-case or @scope/package format

2. **"Invalid base path"**
   - Ensure starts and ends with `/`
   - Example: `/apps/my-app/`

3. **"Module not found"**
   - Check module exists in `src/modules/`
   - Verify spelling matches exactly

4. **"Form fields JSON invalid"**
   - Validate JSON syntax
   - Check all quotes are properly escaped
   - Ensure required fields: name, type, required

---

## 11. Examples for Common Scenarios

### Scenario 1: User wants "blog management"

```bash
# Create app (interactive)
npx create-vc-app my-blog

# When prompted:
# Module: posts
# Entity: Post
# Both blades: yes
# Workspace: Grid
# Customize: yes
# Fields:
#   - title (text, required)
#   - content (editor, required)
#   - category (select, required) → News,Tutorial,Review
#   - published (switch, required)
#   - coverImage (gallery, optional)
```

### Scenario 2: User wants "inventory tracking"

```bash
# Grid blade
npx create-vc-app blade \
  --module inventory \
  --type grid \
  --name inventory-items \
  --is-workspace \
  --composable \
  --locales

# Details blade
npx create-vc-app blade \
  --module inventory \
  --type details \
  --name inventory-item-details \
  --composable \
  --locales \
  --skip-form-editor \
  --form-fields '[
    {"name":"sku","type":"text","required":true},
    {"name":"productName","type":"text","required":true},
    {"name":"quantity","type":"number","required":true},
    {"name":"location","type":"select","required":true,"options":"Warehouse A,Warehouse B,Store"},
    {"name":"reorderPoint","type":"number","required":true},
    {"name":"notes","type":"textarea","required":false}
  ]'
```

### Scenario 3: User wants "event management"

```bash
# Events list
npx create-vc-app blade \
  --module events \
  --type grid \
  --name events \
  --is-workspace \
  --composable \
  --locales

# Event details
npx create-vc-app blade \
  --module events \
  --type details \
  --name event-details \
  --composable \
  --locales \
  --skip-form-editor \
  --form-fields '[
    {"name":"title","type":"text","required":true},
    {"name":"date","type":"date","required":true},
    {"name":"description","type":"editor","required":false},
    {"name":"location","type":"text","required":true},
    {"name":"capacity","type":"number","required":true},
    {"name":"eventType","type":"select","required":true,"options":"Conference,Workshop,Webinar,Meetup"},
    {"name":"isPublic","type":"switch","required":true},
    {"name":"bannerImage","type":"gallery","required":false}
  ]'
```

---

## 12. Troubleshooting

### CLI Not Found

```bash
# Build the CLI first
cd /path/to/vc-shell/cli/create-vc-app
yarn build

# Then use
npx create-vc-app --help
```

### Module Not Appearing

Check `src/main.ts` for module registration:

```typescript
import ProductsModule from "./modules/products";
app.use(ProductsModule);
```

### Form Fields Not Generated

Ensure:
- `--skip-form-editor` flag is used
- `--form-fields` contains valid JSON
- All required fields in JSON: `name`, `type`, `required`

---
