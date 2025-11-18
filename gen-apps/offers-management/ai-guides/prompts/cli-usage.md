# CLI Usage Guide

Complete reference for using `create-vc-app` CLI tool to scaffold applications and generate modules.

## When to Use This

Use these prompts when you need to:

- Create a new VC Shell application
- Generate modules, blades, or widgets
- Add functionality to existing projects
- Automate module creation with specific configurations

## Prerequisites

- Node.js 18 or higher installed
- Understanding of your project requirements
- API structure (if integrating with backend)

## Quick Reference

### Create New Application

**Interactive Mode (Recommended for first-time users):**

```bash
npx create-vc-app my-app
```

**Non-Interactive Mode:**

```bash
npx create-vc-app my-app \
  --package-name "my-app" \
  --base-path "/apps/my-app/" \
  --skip-module-gen
```

### Generate Module

**Interactive Mode:**

```bash
cd my-app
npx create-vc-app blade
# Select: "Module (with blades)"
```

**Non-Interactive Mode:**

```bash
npx create-vc-app blade \
  --module products \
  --type grid \
  --name products-list \
  --composable \
  --locales \
  --is-workspace
```

---

## Detailed Examples

### 1. Create New Application with Module

**Scenario:** Starting completely from scratch

**Prompt for AI:**

```
Create a new VC Shell application called "my-shop" with a products module.

The products module should have:
- Grid blade (list view) with table
- Details blade (form view) with these fields:
  - name (text, required)
  - price (currency, required)
  - description (editor, optional)
  - category (select: Electronics, Clothing, Books)
  - inStock (switch toggle)

Use the CLI to generate everything.
```

**AI will run:**

```bash
# Create app
npx create-vc-app my-shop

# Then follow interactive prompts:
# - Module name: products
# - Entity name: Product
# - Create both blades: yes
# - Workspace blade: Grid blade
# - Customize form: yes
# - Add fields as specified
```

---

### 2. Add Module to Existing Application

**Scenario:** You have an app, need to add new module

**Prompt for AI:**

```
Add an orders module to my existing application.

Requirements:
- Grid blade with columns: orderNumber, customer, total, status, date
- Details blade with form fields:
  - orderNumber (text, read-only)
  - customer (text, required)
  - total (currency, required)
  - status (select: pending, processing, shipped, delivered)
  - orderDate (date, required)
  - notes (textarea, optional)

Generate using CLI.
```

**AI will run:**

```bash
cd /path/to/your-app

npx create-vc-app blade \
  --module orders \
  --type grid \
  --name orders-list \
  --composable \
  --locales \
  --is-workspace

# Then add details blade
npx create-vc-app blade \
  --module orders \
  --type details \
  --name order-details \
  --composable \
  --locales \
  --form-fields '[
    {"name":"orderNumber","type":"VcInput","props":"{\"required\":true,\"readonly\":true}"},
    {"name":"customer","type":"VcInput","props":"{\"required\":true}"},
    {"name":"total","type":"VcInputCurrency","props":"{\"required\":true}"},
    {"name":"status","type":"VcSelect","props":"{\"required\":true,\"options\":\"pending,processing,shipped,delivered\"}"},
    {"name":"orderDate","type":"VcInput","props":"{\"type\":\"date\",\"required\":true}"},
    {"name":"notes","type":"VcTextarea","props":"{}"}
  ]'
```

---

### 3. Generate Module with Custom Form (Non-Interactive)

**Scenario:** Automated generation with specific form structure

**Prompt for AI:**

```
Generate a complete products module using CLI in non-interactive mode.

Form fields:
- title (text input, required)
- sku (text input, required)
- description (rich text editor)
- price (currency input, required)
- compareAtPrice (currency input)
- category (select dropdown with options: Electronics, Clothing, Books, Home)
- tags (multivalue input)
- featured (switch toggle)
- images (gallery)
- status (radio buttons: draft, active, archived)

Create both list and details blades.
```

**AI will run:**

```bash
npx create-vc-app blade \
  --module products \
  --type grid \
  --name products \
  --composable \
  --locales \
  --is-workspace

npx create-vc-app blade \
  --module products \
  --type details \
  --name product-details \
  --composable \
  --locales \
  --skip-form-editor \
  --form-fields '[
    {"name":"title","label":"Product Title","type":"VcInput","props":"{\"required\":true}"},
    {"name":"sku","label":"SKU","type":"VcInput","props":"{\"required\":true}"},
    {"name":"description","label":"Description","type":"VcEditor","props":"{}"},
    {"name":"price","label":"Price","type":"VcInputCurrency","props":"{\"required\":true}"},
    {"name":"compareAtPrice","label":"Compare at Price","type":"VcInputCurrency","props":"{}"},
    {"name":"category","label":"Category","type":"VcSelect","props":"{\"required\":true,\"options\":\"Electronics,Clothing,Books,Home\"}"},
    {"name":"tags","label":"Tags","type":"VcMultivalue","props":"{}"},
    {"name":"featured","label":"Featured","type":"VcSwitch","props":"{}"},
    {"name":"images","label":"Images","type":"VcGallery","props":"{}"},
    {"name":"status","label":"Status","type":"VcRadioButton","props":"{\"options\":\"draft,active,archived\"}"}
  ]'
```

---

### 4. Add Widget to Existing Blade

**Scenario:** Enhance blade with widget component

**Prompt for AI:**

```
Add a statistics widget to the product-details blade.

The widget should:
- Show product views count
- Show sales count
- Show revenue
- Be positioned on the right side

Use CLI to generate and register the widget.
```

**AI will run (Non-Interactive - Recommended):**

```bash
npx create-vc-app generate \
  --widget \
  --widget-module products \
  --widget-blade product-details \
  --widget-name Stats \
  --widget-entity Product \
  --widget-icon material-sell
```

**Alternative (Interactive):**

```bash
npx create-vc-app generate --widget

# Interactive prompts:
# - Select module: products
# - Select blade: product-details
# - Widget name: Stats
# - Entity: Product
# - Icon: Sell/Price (material-sell)
```

**What Gets Created:**

- `components/widgets/stats/stats-widget.vue`
- `components/widgets/stats/index.ts`
- Auto-export in `components/widgets/index.ts`
- Auto-registration in `product-details.vue` with `useWidgets()`
- Auto-updates `locales/en.json` with `WIDGETS.STATS.TITLE`

---

### 5. Generate Only Grid Blade (List Only)

**Scenario:** You only need a list view, no details

**Prompt for AI:**

```
Create a categories module with only a list view (no details blade).

List should show:
- Category name
- Number of products
- Status (active/inactive)
- Last modified date

Use CLI.
```

**AI will run:**

```bash
npx create-vc-app blade \
  --module categories \
  --type grid \
  --name categories \
  --composable \
  --locales \
  --is-workspace
```

---

### 6. Generate Only Details Blade (Form Only)

**Scenario:** You need a settings page (form without list)

**Prompt for AI:**

```
Create a settings module with only a details form (no list).

Form fields:
- storeName (text, required)
- storeEmail (text, required, email validation)
- currency (select: USD, EUR, GBP)
- timezone (select with multiple options)
- enableNotifications (switch)
- maintenanceMode (switch)

Use CLI.
```

**AI will run:**

```bash
npx create-vc-app blade \
  --module settings \
  --type details \
  --name settings \
  --composable \
  --locales \
  --is-workspace \
  --form-fields '[
    {"name":"storeName","label":"Store Name","type":"VcInput","props":"{\"required\":true}"},
    {"name":"storeEmail","label":"Store Email","type":"VcInput","props":"{\"required\":true,\"type\":\"email\"}"},
    {"name":"currency","label":"Currency","type":"VcSelect","props":"{\"required\":true,\"options\":\"USD,EUR,GBP\"}"},
    {"name":"timezone","label":"Timezone","type":"VcSelect","props":"{\"required\":true}"},
    {"name":"enableNotifications","label":"Enable Notifications","type":"VcSwitch","props":"{}"},
    {"name":"maintenanceMode","label":"Maintenance Mode","type":"VcSwitch","props":"{}"}
  ]'
```

---

## CLI Command Reference

### Application Creation

```bash
npx create-vc-app [project-name] [options]
```

**Options:**

- `--name, --app-name <name>` - Application name
- `--package-name <name>` - Package name (defaults to app name)
- `--base-path <path>` - Base path for the application (default: /apps/<app-name>/)
- `--skip-module-gen` - Skip initial module generation
- `--skip-form-editor` - Skip interactive form builder
- `--form-fields <json>` - JSON string with form field definitions
- `--overwrite` - Overwrite existing files without confirmation
- `--help, -h` - Show help
- `--version, -v` - Show version

**Examples:**

```bash
# Basic app
npx create-vc-app my-app

# App without module
npx create-vc-app my-app --skip-module-gen

# App with custom base path
npx create-vc-app my-app --base-path "/custom/path/"
```

---

### Module/Blade Generation

```bash
npx create-vc-app blade [options]
```

**Options:**

- `--module <name>` - Target module name
- `--type <grid|details>` - Blade type
- `--name <name>` - Blade name
- `--composable` - Generate composable (default: true)
- `--locales` - Generate locales (default: true)
- `--is-workspace` - Mark blade as workspace blade (main module blade)
- `--widget` - Generate widget instead of blade
- `--path <path>` - Target path for generation
- `--skip-form-editor` - Skip interactive form builder
- `--form-fields <json>` - JSON array of form field definitions

**Examples:**

```bash
# Interactive mode
npx create-vc-app blade

# Generate grid blade
npx create-vc-app blade --module products --type grid --name products

# Generate details blade with form
npx create-vc-app blade --module products --type details --name product-details

# Generate widget
npx create-vc-app blade --widget
```

---

## Form Field Types Reference

When using `--form-fields` option, use this JSON structure:

```typescript
interface FormField {
  name: string; // Field property name
  label?: string; // Display label (optional, uses name if not provided)
  type: FieldType; // Component type (see below)
  props?: string; // JSON string of component props
}
```

**Available Field Types:**

| Type              | Component        | Use Case                   | Example Props                                   |
| ----------------- | ---------------- | -------------------------- | ----------------------------------------------- |
| `VcInput`         | Text input       | Basic text, numbers, dates | `{"required":true,"type":"text"}`               |
| `VcTextarea`      | Multi-line text  | Long text, comments        | `{"rows":5}`                                    |
| `VcSelect`        | Dropdown         | Single selection           | `{"required":true,"options":"Option1,Option2"}` |
| `VcEditor`        | Rich text editor | Formatted content          | `{"placeholder":"Enter content"}`               |
| `VcSwitch`        | Toggle           | Boolean values             | `{}`                                            |
| `VcGallery`       | Image gallery    | Multiple images            | `{}`                                            |
| `VcInputCurrency` | Currency input   | Money values               | `{"required":true}`                             |
| `VcRadioButton`   | Radio buttons    | Single choice from list    | `{"options":"Option1,Option2,Option3"}`         |
| `VcCheckbox`      | Checkbox         | Single boolean             | `{"label":"Agree to terms"}`                    |
| `VcMultivalue`    | Tag input        | Multiple text values       | `{"placeholder":"Add tag"}`                     |
| `VcField`         | Read-only field  | Display-only data          | `{}`                                            |

**Example JSON for --form-fields:**

```json
[
  {
    "name": "title",
    "label": "Product Title",
    "type": "VcInput",
    "props": "{\"required\":true}"
  },
  {
    "name": "price",
    "label": "Price",
    "type": "VcInputCurrency",
    "props": "{\"required\":true}"
  },
  {
    "name": "description",
    "label": "Description",
    "type": "VcEditor",
    "props": "{}"
  }
]
```

---

## Expected Output

### After Creating Application

```
✨ Application created successfully!

📊 Summary:
   Location: /path/to/my-app
   Package: my-app
   Base path: /apps/my-app/
   Files created: 60+

🚀 Next steps:
  1. cd my-app
  2. yarn
  3. yarn serve
```

**What was created:**

- Complete Vue 3 + TypeScript application
- Router configuration
- Localization setup
- Prettier and ESLint configuration
- Base components and styles
- Development scripts

---

### After Generating Module

```
✅ Module generated successfully!

Created files:
- src/modules/products/pages/products.vue
- src/modules/products/pages/product-details.vue
- src/modules/products/composables/useProductList.ts
- src/modules/products/composables/useProductDetails.ts
- src/modules/products/locales/en.json
- src/modules/products/index.ts

Module registered in src/main.ts
```

**What was created:**

- Complete module structure
- Grid blade with VcTable
- Details blade with form fields
- Composables with async logic
- Localization files
- Automatic module registration

---

## Next Steps After Generation

### 1. Install Dependencies

```bash
cd your-app
yarn
```

### 2. Connect to API

See [API Client Generation Guide](./api-client-generation.md)

### 3. Start Development Server

```bash
yarn serve
```

### 4. Access Application

```
http://localhost:8080/apps/your-app/
```

### 5. Customize Generated Code

- Update TODO comments in composables
- Replace placeholder API calls
- Add validation rules
- Customize UI components

---

## Common Patterns

### Pattern 1: E-commerce Module Set

**Prompt:**

```
Create a complete e-commerce module set:
1. Products (list + details)
2. Categories (list + details)
3. Orders (list + details)
4. Customers (list + details)

Use CLI to generate all modules.
```

**AI will execute:**

```bash
# Products
npx create-vc-app blade --module products --type grid --name products --is-workspace
npx create-vc-app blade --module products --type details --name product-details

# Categories
npx create-vc-app blade --module categories --type grid --name categories --is-workspace
npx create-vc-app blade --module categories --type details --name category-details

# Orders
npx create-vc-app blade --module orders --type grid --name orders --is-workspace
npx create-vc-app blade --module orders --type details --name order-details

# Customers
npx create-vc-app blade --module customers --type grid --name customers --is-workspace
npx create-vc-app blade --module customers --type details --name customer-details
```

---

### Pattern 2: Settings Pages (Forms Only)

**Prompt:**

```
Create settings pages (no lists):
1. General Settings (store name, email, timezone)
2. Payment Settings (payment methods, currencies)
3. Shipping Settings (shipping zones, rates)

Use CLI.
```

**AI will execute:**

```bash
# General
npx create-vc-app blade --module settings-general --type details --name general --is-workspace

# Payment
npx create-vc-app blade --module settings-payment --type details --name payment --is-workspace

# Shipping
npx create-vc-app blade --module settings-shipping --type details --name shipping --is-workspace
```

---

## Troubleshooting

### Issue: Module Not Created

**Error:** `Module "xyz" not found`

**Solution:** When generating a blade for non-existent module in non-interactive mode, the CLI automatically creates the module. Make sure you're in the project directory.

---

### Issue: Form Fields Not Generated

**Error:** Invalid JSON in `--form-fields`

**Solution:** Ensure JSON is properly escaped:

- Use single quotes around the entire JSON
- Use double quotes inside for JSON properties
- Escape inner JSON in props: `"{\"required\":true}"`

**Correct:**

```bash
--form-fields '[{"name":"title","type":"VcInput","props":"{\"required\":true}"}]'
```

---

### Issue: Command Not Found

**Error:** `create-vc-app: command not found`

**Solution:** Use `npx` to run without global installation:

```bash
npx create-vc-app blade
```

---

## Tips for Better AI Prompts

1. **Be Specific:** Describe field types, validations, and requirements clearly
2. **Use Structure:** List fields in bullet points or tables
3. **Mention CLI:** Always say "use CLI" or "generate with create-vc-app"
4. **Provide Context:** Mention if adding to existing app or creating new
5. **Include Data Structure:** Describe your API data format if integrating

**Good Prompt Example:**

```
Use create-vc-app CLI to generate an invoices module.

Structure:
- List blade with columns: invoice number, customer, date, total, status
- Details blade with form:
  - Invoice number (text, auto-generated, read-only)
  - Customer (select dropdown)
  - Date (date picker, required)
  - Items (table with add/remove)
  - Total (currency, auto-calculated, read-only)
  - Status (select: draft, sent, paid)
  - Notes (textarea)

Create both grid and details blades.
```

---

## Related Documentation

- [Quick Start Scenarios](./quick-start-scenarios.md) - Ready-to-use examples
- [API Client Generation](./api-client-generation.md) - Connecting to backend
- [Complete Workflow Guide](../guides/complete-workflow.md) - End-to-end process
- [Official Documentation](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/)
