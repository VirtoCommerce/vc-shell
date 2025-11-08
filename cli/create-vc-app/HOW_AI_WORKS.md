# How AI Integration Works

> Quick guide: How Cursor AI works with your VC-Shell project

---

## 🎯 Overview

When you create a VC-Shell app with `npx create-vc-app my-app`, the generated project includes **complete documentation** that Cursor AI can read automatically.

---

## 📁 What Gets Created

```
my-app/
├── .cursorrules                   ← AI reads this AUTOMATICALLY
├── ai-guides/                     ← Complete documentation
│   ├── AI_INSTRUCTIONS.md         ← AI workflow guide
│   ├── UI_COMPONENTS_REFERENCE.md ← All 27 components
│   ├── prompts/                   ← 90+ ready-to-use templates
│   └── guides/                    ← Technical guides
└── src/                           ← Your application code
```

---

## ⚙️ How It Works

### Step 1: You Open Project in Cursor

Cursor IDE automatically loads `.cursorrules` file → AI gets framework knowledge

### Step 2: You Ask AI

```
You: "Create products module with name, price, description"
```

### Step 3: AI Reads Documentation

```
1. AI reads .cursorrules → knows to use CLI
2. AI checks prompts/quick-start-scenarios.md → finds products template
3. AI checks UI_COMPONENTS_REFERENCE.md → knows which components to use
```

### Step 4: AI Executes

```bash
# AI runs CLI commands (3-step process)

# Step 1: Create app
npx create-vc-app my-shop --skip-module-gen
cd my-shop

# Step 2: Create grid blade (creates module)
npx create-vc-app generate \
  --module products \
  --type grid \
  --name product \
  --form-fields '[{"name":"name","type":"text"},{"name":"price","type":"currency"}]'

# Step 3: Add details blade
npx create-vc-app generate \
  --module products \
  --type details \
  --name product \
  --form-fields '[{"name":"name","type":"text"},{"name":"price","type":"currency"},{"name":"description","type":"editor"},{"name":"images","type":"gallery"}]'
```

### Step 5: AI Explains

```
AI: "✅ Created products module with:
- Grid blade (list view with search and pagination)
- Details blade (edit form with validation)
- Composable for business logic
- API client stub
- i18n keys

Next steps:
1. Connect API in src/api/products.ts
2. Run: yarn serve
3. Navigate to: http://localhost:8080/apps/my-app/products"
```

---

## 🎨 Example Interactions

### 1. Create New Module

```
You: Create orders module with order number, customer, date, total, status

AI:
→ Reads prompts/quick-start-scenarios.md
→ Finds orders template
→ Runs CLI with correct parameters
→ Creates grid + details blades
→ Shows you what was created
```

### 2. Modify Existing Code

```
You: Add category field to products

AI:
→ Reads products-details.vue
→ Checks UI_COMPONENTS_REFERENCE.md for VcSelect
→ Checks prompts/simple-modifications.md for template
→ Adds VcSelect component
→ Updates validation schema
→ Adds i18n keys
→ Shows you the changes
```

### 3. Ask About Components

```
You: How to use image gallery?

AI:
→ Opens UI_COMPONENTS_REFERENCE.md
→ Finds VcGallery section
→ Shows you:
  - Props
  - Events
  - Usage example
  - Common pitfalls
```

### 4. Fix Error

```
You: Table not showing data

AI:
→ Reads guides/troubleshooting.md
→ Checks common pitfalls in .cursorrules
→ Identifies missing stateKey prop
→ Shows fix with explanation
```

---

## 💡 Key Features

### AI Knows Everything

✅ All 27 UI components (VcInput, VcSelect, VcTable, etc.)  
✅ All CLI commands and parameters  
✅ All framework patterns (Blade, Composable, Widget, API Client)  
✅ 90+ ready-to-use templates  
✅ Common pitfalls and solutions  

### AI Follows Best Practices

✅ Always uses TypeScript  
✅ Always adds validation (VeeValidate)  
✅ Always uses i18n for text  
✅ Always tracks modifications  
✅ Never creates custom components if framework has them  
✅ Never uses tabs (uses VcCard for sections)  

### AI Uses CLI First

```bash
# For new app with module (3 commands)
npx create-vc-app {app-name} --skip-module-gen
npx create-vc-app generate --module {name} --type grid --name {entity} --form-fields '{fields}'
npx create-vc-app generate --module {name} --type details --name {entity} --form-fields '{fields}'

# Then manually adds custom logic if needed
```

---

## 📚 Documentation Structure

### For You (Human)

- **README.md** - Getting started guide
- **ai-guides/README.md** - Documentation index
- **Guides in `ai-guides/guides/`** - Technical tutorials

### For AI (Automatic)

- **.cursorrules** - Loaded automatically by Cursor
- **AI_INSTRUCTIONS.md** - AI workflow guide
- **UI_COMPONENTS_REFERENCE.md** - Component documentation
- **Prompts in `ai-guides/prompts/`** - Task templates

---

## 🚀 Getting Started

### 1. Create Your App

```bash
npx create-vc-app my-app
cd my-app
yarn
```

### 2. Open in Cursor

```bash
cursor .
```

Cursor automatically loads `.cursorrules` → AI is ready

### 3. Start Chatting

```
You: Create products module with name, SKU, price, category, description, images

AI: [Creates complete module with CLI, shows code, explains next steps]
```

### 4. Test Your App

```bash
yarn serve
```

Open: `http://localhost:8080/apps/my-app/`

---

## 🎓 What You Can Ask

### Module Creation
- "Create products module with [fields]"
- "Generate orders blade with [fields]"
- "Add widget to products showing stats"

### Code Modification
- "Add category field to products"
- "Change price to currency input"
- "Add validation for email"
- "Make name field required"

### Component Usage
- "How to use VcGallery?"
- "Show example of VcSelect with async options"
- "How to create nested table in details blade?"

### Troubleshooting
- "Table not showing data"
- "Modified state not working"
- "Validation not triggering"

### Architecture Questions
- "How to structure composables?"
- "How to create custom widget?"
- "How to integrate with custom API?"

---

## 🔧 Advanced: For Developers

### How Documentation Gets Loaded

1. **App Generation:**
   ```bash
   npx create-vc-app my-app
   ```
   Copies `src/templates/base/` → `my-app/`

2. **Cursor Opens Project:**
   - Reads `.cursorrules` (auto-loaded)
   - Links to `ai-guides/` documentation

3. **AI Gets Context:**
   - Framework rules from `.cursorrules`
   - Component docs from `UI_COMPONENTS_REFERENCE.md`
   - Templates from `prompts/`
   - Guides from `guides/`

### Customization

You can customize AI behavior by editing:
- `.cursorrules` - Add custom rules
- `ai-guides/prompts/` - Add custom templates
- `ai-guides/guides/` - Add custom guides

---

## ✅ Benefits

### For Non-Developers
- Don't need to learn VC-Shell
- AI does everything correctly
- Get working code immediately

### For Developers
- Faster development
- Consistent code style
- Best practices enforced

### For Teams
- Same patterns everywhere
- Easy onboarding
- Knowledge documented

---

## 📖 Learn More

- **Full Documentation:** `ai-guides/README.md`
- **Component Reference:** `ai-guides/UI_COMPONENTS_REFERENCE.md`
- **Prompt Templates:** `ai-guides/prompts/`
- **Technical Guides:** `ai-guides/guides/`

---

## 🎉 Summary

**Cursor AI + VC-Shell = Powerful Development**

1. Create app → Documentation included
2. Open in Cursor → AI loads knowledge
3. Ask AI → Get working code
4. Run app → Everything works

**No VC-Shell knowledge required!**

