# AI Usage Guide for create-vc-app

This guide is specifically designed for AI assistants to help users generate VC Shell applications, modules, blades, and widgets using non-interactive commands.

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
node dist/index.js my-app \
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
node dist/index.js my-app

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
node dist/index.js my-app --skip-module-gen

# Step 2: Add module (see Module Generation section)
cd my-app
node ../../cli/create-vc-app/dist/index.js blade \
  --module products --type grid --name products --is-workspace
```

---

## 2. Module Generation

### Complete Module (Grid + Details)

```bash
# Grid blade (list view)
node dist/index.js blade \
  --module products \
  --type grid \
  --name products \
  --composable \
  --locales \
  --is-workspace

# Details blade (form view)
node dist/index.js blade \
  --module products \
  --type details \
  --name product-details \
  --composable \
  --locales
```

### Module with Custom Form Fields (JSON)

```bash
node dist/index.js blade \
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

### Basic Widget

```bash
# Must be run interactively (requires module/blade selection)
node dist/index.js blade --widget

# Then select:
# - Module: products
# - Blade: product-details
# - Widget name: ProductStats
```

**Note:** Widget generation requires interactive input to select module and blade.

---

## 5. Common Usage Patterns

### Pattern 1: E-commerce Product Module

```bash
# Grid blade for product list
node dist/index.js blade \
  --module products \
  --type grid \
  --name products \
  --is-workspace \
  --composable \
  --locales

# Details blade with comprehensive form
node dist/index.js blade \
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
node dist/index.js blade \
  --module orders \
  --type grid \
  --name orders \
  --is-workspace \
  --composable \
  --locales

# Order details with form
node dist/index.js blade \
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
node dist/index.js blade \
  --module customers \
  --type grid \
  --name customers \
  --is-workspace \
  --composable \
  --locales

# Customer details
node dist/index.js blade \
  --module customers \
  --type details \
  --name customer-details \
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
| `--widget` | boolean | Generate widget instead | `false` |
| `--form-fields` | string | JSON form field definitions | - |
| `--skip-form-editor` | boolean | Skip interactive form builder | `false` |

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
- Have all form field definitions in JSON
- Automating app generation

❌ **Don't use non-interactive when:**
- Need to create initial module (use app creation)
- Want to add widget (requires module/blade selection)
- Prefer step-by-step guidance

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
node dist/index.js my-shop

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
node dist/index.js my-blog

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
node dist/index.js blade \
  --module inventory \
  --type grid \
  --name inventory-items \
  --is-workspace \
  --composable \
  --locales

# Details blade
node dist/index.js blade \
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
node dist/index.js blade \
  --module events \
  --type grid \
  --name events \
  --is-workspace \
  --composable \
  --locales

# Event details
node dist/index.js blade \
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
node dist/index.js --help
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
