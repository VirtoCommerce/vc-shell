# create-vc-app Cheatsheet

Quick reference for common operations.

## 📦 Installation

```bash
npm install -g @vc-shell/create-vc-app
# or
npx create-vc-app@latest
```

---

## 🚀 Create New App

### Interactive (Recommended)
```bash
npx create-vc-app my-app
```

### Non-Interactive (Base Only)
```bash
npx create-vc-app my-app \
  --package-name "@my-org/my-app" \
  --base-path "/apps/my-app/" \
  --skip-module-gen \
  --overwrite
```

---

## 🏗️ Generate Module

### Interactive
```bash
npx create-vc-app blade
# Select: "Module (with blades)"
```

### Non-Interactive
```bash
# Grid blade
npx create-vc-app blade \
  --module products \
  --type grid \
  --name products \
  --is-workspace \
  --composable \
  --locales

# Details blade
npx create-vc-app blade \
  --module products \
  --type details \
  --name product-details \
  --composable \
  --locales
```

---

## 📝 Custom Form Fields

### Interactive Form Builder
```bash
npx create-vc-app blade
# Select: Module → Customize form fields: yes
# Add fields interactively
```

### JSON Form Fields
```bash
npx create-vc-app blade \
  --module products \
  --type details \
  --name product-details \
  --skip-form-editor \
  --form-fields '[
    {"name":"name","type":"text","required":true},
    {"name":"price","type":"currency","required":true},
    {"name":"description","type":"editor","required":false},
    {"name":"category","type":"select","required":true,"options":"A,B,C"},
    {"name":"active","type":"switch","required":true}
  ]'
```

---

## 🧩 Add Widget

### Interactive
```bash
npx create-vc-app blade --widget
# Select module → Select blade → Enter widget name
```

### Non-Interactive
```bash
npx create-vc-app blade --widget \
  --widget-module products \
  --widget-blade products-list \
  --widget-name Stats \
  --widget-entity Product \
  --widget-icon material-sell
```

**Parameters:**
- `--widget-module` - Module name (required)
- `--widget-blade` - Blade name without .vue extension (required)
- `--widget-name` - Widget name (required)
- `--widget-entity` - Related entity name (required)
- `--widget-icon` - Icon name (optional, default: material-list)

---

## 📋 Form Field Types

| Type | Component | Example |
|------|-----------|---------|
| `text` | VcInput | Text input |
| `number` | VcInput | Number input |
| `date` | VcInput | Date picker |
| `textarea` | VcTextarea | Multi-line |
| `select` | VcSelect | Dropdown (needs `options`) |
| `radio` | VcRadioButton | Radio group (needs `options`) |
| `editor` | VcEditor | Rich text |
| `switch` | VcSwitch | Toggle |
| `gallery` | VcGallery | Images + useAssets |
| `currency` | VcInputCurrency | Money |
| `checkbox` | VcCheckbox | Checkbox |
| `multivalue` | VcMultivalue | Multiple values |
| `field` | VcField | Read-only |

---

## 🎯 Common Scenarios

### E-commerce Product Module
```bash
# Grid
npx create-vc-app blade --module products --type grid --name products --is-workspace

# Details with form
npx create-vc-app blade --module products --type details --name product-details \
  --skip-form-editor --form-fields '[
    {"name":"name","type":"text","required":true},
    {"name":"sku","type":"text","required":true},
    {"name":"price","type":"currency","required":true},
    {"name":"description","type":"editor","required":false},
    {"name":"category","type":"select","required":true,"options":"Electronics,Clothing,Books"},
    {"name":"inStock","type":"switch","required":true},
    {"name":"images","type":"gallery","required":false}
  ]'
```

### Blog Post Module
```bash
npx create-vc-app blade --module posts --type details --name post-details \
  --skip-form-editor --form-fields '[
    {"name":"title","type":"text","required":true},
    {"name":"content","type":"editor","required":true},
    {"name":"category","type":"select","required":true,"options":"News,Tutorial,Review"},
    {"name":"published","type":"switch","required":true},
    {"name":"coverImage","type":"gallery","required":false}
  ]'
```

### Order Management Module
```bash
npx create-vc-app blade --module orders --type details --name order-details \
  --skip-form-editor --form-fields '[
    {"name":"orderNumber","type":"text","required":true},
    {"name":"customerName","type":"text","required":true},
    {"name":"orderDate","type":"date","required":true},
    {"name":"status","type":"select","required":true,"options":"Pending,Processing,Shipped,Delivered"},
    {"name":"totalAmount","type":"currency","required":true},
    {"name":"isPaid","type":"switch","required":true}
  ]'
```

---

## ⚙️ Options

### App Creation
```
--name, --app-name        App name
--package-name            Package name
--base-path               Base path (must start/end with /)
--skip-module-gen         Skip module generation
--skip-form-editor        Skip form builder
--form-fields             JSON form fields
--overwrite               Overwrite existing
```

### Blade Generation
```
--module                  Module name
--type                    grid | details
--name                    Blade name
--composable              Generate composable (default: true)
--locales                 Generate locales (default: true)
--is-workspace            Mark as workspace blade
--widget                  Generate widget
--form-fields             JSON form fields
--skip-form-editor        Skip form builder
```

---

## ✅ Validation Rules

### Package Name
- ✅ `my-app`, `@org/app`
- ❌ `My App!`, `my app`

### Base Path
- ✅ `/apps/my-app/`
- ❌ `apps/my-app`, `/apps/my-app`

### Module Name
- Auto-converts to kebab-case
- `Products` → `products`
- `My Orders` → `my-orders`

---

## 🔧 Development

```bash
yarn serve      # Start dev server
yarn build      # Build for production
yarn lint       # Run linter
yarn format     # Format with Prettier
```

---

## 📁 What Gets Created

### App Structure (--skip-module-gen)
```
my-app/                  # 60 files
├── src/
│   ├── main.ts
│   ├── router/
│   ├── locales/
│   └── pages/
├── public/
├── package.json
└── .prettierrc
```

### Module Structure
```
src/modules/products/    # Added to app
├── pages/
│   ├── products.vue              # ~350 lines
│   └── product-details.vue        # ~180 lines
├── composables/
│   ├── useProductList.ts          # ~240 lines
│   └── useProductDetails.ts       # ~100 lines
├── locales/
│   └── en.json                    # ~75 lines
└── components/widgets/
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not appearing | Check registration in `main.ts` |
| TypeScript errors | Replace `@ts-expect-error` with actual types |
| Widget not showing | Verify `registerWidget()` called |
| Form fields missing | Use `--skip-form-editor` + valid JSON |
| Package name error | Remove spaces, use kebab-case |
| Base path error | Must start and end with `/` |

---

## 📚 More Info

- **Detailed Guide:** [AI_USAGE_GUIDE.md](./AI_USAGE_GUIDE.md)
- **Quick Reference:** [AI_QUICK_REFERENCE.md](./AI_QUICK_REFERENCE.md)
- **Full Documentation:** [README.md](./README.md)
- **User Docs:** `/vc-docs/platform/developer-guide/.../Getting-started/`

---

## 🎓 Examples

### Full E-commerce App Setup

```bash
# 1. Create app
npx create-vc-app my-shop

# 2. When prompted:
#    Module: products
#    Entity: Product
#    Both blades: yes
#    Workspace: Grid
#    Customize: yes
#    Fields: name, price, description, category, images

# 3. Install & run
cd my-shop
yarn
yarn serve
```

### Add Orders Module Later

```bash
# In my-shop directory
npx create-vc-app blade

# Select: Module (with blades)
# Module: orders
# Entity: Order
# Both blades: yes
# Workspace: Grid
# Customize: yes
# Fields: orderNumber, customer, date, status, total
```

### Add Widget to Blade

```bash
npx create-vc-app blade --widget

# Select: products
# Blade: product-details
# Widget: ProductStats
```

---
