# AI Quick Reference Card

**One-page cheatsheet for AI assistants using create-vc-app non-interactively**

---

## 🚀 Quick Commands

### Create App (base only)
```bash
node dist/index.js <app-name> --skip-module-gen
```

### Add Grid Blade
```bash
node dist/index.js blade --module <name> --type grid --name <name> --is-workspace
```

### Add Details Blade with Form
```bash
node dist/index.js blade --module <name> --type details --name <name> \
  --skip-form-editor --form-fields '<json>'
```

---

## 📋 Form Fields JSON

### Template
```json
[
  {"name":"fieldName","type":"componentType","required":true|false,"options":"opt1,opt2"}
]
```

### Component Types
| Type | Component | Use |
|------|-----------|-----|
| `text` | VcInput | Text input |
| `number` | VcInput | Number input |
| `currency` | VcInputCurrency | Money |
| `textarea` | VcTextarea | Multi-line text |
| `select` | VcSelect | Dropdown (needs `options`) |
| `radio` | VcRadioButton | Radio group (needs `options`) |
| `editor` | VcEditor | Rich text |
| `switch` | VcSwitch | Boolean toggle |
| `gallery` | VcGallery | Images + useAssets |
| `checkbox` | VcCheckbox | Checkbox |
| `multivalue` | VcMultivalue | Multiple values |
| `date` | VcInput | Date picker |
| `field` | VcField | Read-only |

---

## 📦 Common Patterns

### E-commerce Product
```json
[
  {"name":"name","type":"text","required":true},
  {"name":"sku","type":"text","required":true},
  {"name":"price","type":"currency","required":true},
  {"name":"description","type":"editor","required":false},
  {"name":"category","type":"select","required":true,"options":"Electronics,Clothing,Books"},
  {"name":"inStock","type":"switch","required":true},
  {"name":"images","type":"gallery","required":false}
]
```

### Blog Post
```json
[
  {"name":"title","type":"text","required":true},
  {"name":"content","type":"editor","required":true},
  {"name":"category","type":"select","required":true,"options":"News,Tutorial,Review"},
  {"name":"published","type":"switch","required":true},
  {"name":"coverImage","type":"gallery","required":false}
]
```

### Customer
```json
[
  {"name":"firstName","type":"text","required":true},
  {"name":"lastName","type":"text","required":true},
  {"name":"email","type":"text","required":true},
  {"name":"phone","type":"text","required":false},
  {"name":"memberType","type":"select","required":true,"options":"Regular,Premium,VIP"},
  {"name":"isActive","type":"switch","required":true}
]
```

### Order
```json
[
  {"name":"orderNumber","type":"text","required":true},
  {"name":"customerName","type":"text","required":true},
  {"name":"orderDate","type":"date","required":true},
  {"name":"status","type":"select","required":true,"options":"Pending,Processing,Shipped,Delivered"},
  {"name":"totalAmount","type":"currency","required":true},
  {"name":"isPaid","type":"switch","required":true}
]
```

---

## ✅ Validation

### Package Name
- ✅ `my-app`
- ✅ `@org/app`
- ❌ `My App!`

### Base Path
- ✅ `/apps/my-app/`
- ❌ `apps/my-app`

---

## 🎯 What Gets Created

### App (--skip-module-gen)
- 60 files
- Base structure
- No modules

### Grid Blade
- ~350 lines
- List view
- Filters & table
- useList composable

### Details Blade
- ~180 lines  
- Form view
- Validation
- useDetails composable

---

## 🔧 Options

```
--module <name>           Module name
--type grid|details       Blade type
--name <name>            Blade name
--is-workspace           Main blade
--composable             Generate composable
--locales                Generate locales
--skip-form-editor       Use JSON fields
--form-fields '<json>'   Field definitions
--skip-module-gen        App without module
--overwrite              Force overwrite
```

---

## 🤖 AI Decision Tree

```
User wants...

├─ New app
│  ├─ With module → Use interactive (requires input)
│  └─ Without module → Use --skip-module-gen
│
├─ Add module to existing app
│  ├─ List view → --type grid
│  └─ Form view → --type details + --form-fields
│
└─ Add widget → Use --widget (requires interactive)
```

---

## 💡 Pro Tips

1. **Gallery fields** → Auto-adds `useAssets` + `assetsHandler`
2. **Module names** → Auto-converts to kebab-case
3. **All files** → Auto-formatted with Prettier
4. **Modules** → Auto-registered in main.ts
5. **Blades** → Auto-registered in pages/index.ts

---

## 🚨 Common Issues

**"Invalid package name"** → Remove spaces, use kebab-case  
**"Invalid base path"** → Must start/end with `/`  
**"Module not found"** → Check exact spelling  
**JSON parse error** → Validate JSON, escape quotes

---
