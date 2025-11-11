# AI Assistant Instructions for VC-Shell Development

> **READ THIS FILE FIRST** when user opens this project in Cursor IDE

---

## 🎯 Your Role

You are an AI assistant helping users develop VC-Shell applications. This project has **complete documentation** for all framework features.

---

## 📋 How to Work with This Project

### Step 1: Understand the Request

Listen to user's requirements and classify the task:
- **New module/blade** → Use CLI
- **Modify existing code** → Use templates
- **Component question** → Reference docs
- **Error/troubleshooting** → Check guides

### Step 2: Consult Documentation

**Always** check relevant docs BEFORE generating code:

```
/.cursorrules                           # Framework rules & patterns (ALWAYS READ)
/ai-guides/UI_COMPONENTS_REFERENCE.md   # All 27 components (CHECK BEFORE USING)
/ai-guides/prompts/*.md                 # Task-specific templates
/ai-guides/guides/*.md                  # Technical guides
```

### Step 3: Execute Task

#### For New App with Module (Recommended):
```bash
# Complete 3-step process for app + module (grid + details):

# Step 1: Create base app (no module)
npx create-vc-app {app-name} --skip-module-gen
cd {app-name}

# Step 2: Create grid blade (creates module automatically)
npx create-vc-app generate \
  --module {moduleName} \
  --type grid \
  --name {entityName} \
  --form-fields '[{"name":"field1","type":"text"},{"name":"field2","type":"currency"}]'

# Step 3: Add details blade to module
npx create-vc-app generate \
  --module {moduleName} \
  --type details \
  --name {entityName} \
  --form-fields '[{"name":"field1","type":"text"},{"name":"field2","type":"editor"}]'

# Result: Complete app with module (grid + details blades)
```

#### For New Module in Existing App:
```bash
# 1. Check if template exists in prompts/quick-start-scenarios.md
# 2. If yes, use CLI with template values
npx create-vc-app generate \
  --module {moduleName} \
  --type grid \
  --name {entityName} \
  --form-fields "{field1}:{type1},{field2}:{type2}"

# 3. Create details blade too (if needed)
npx create-vc-app generate \
  --module {moduleName} \
  --type details \
  --name {entityName} \
  --form-fields "{detailsFields}"

# 4. Manually add any custom logic not supported by CLI
```

#### For Modifications:
```typescript
// 1. Check prompts/simple-modifications.md for template
// 2. Apply template with actual values
// 3. Verify against .cursorrules patterns
// 4. Test the change
```

#### For Component Usage:
```typescript
// 1. ALWAYS check UI_COMPONENTS_REFERENCE.md first
// 2. Copy usage example
// 3. Adapt to current context
// 4. Follow framework patterns from .cursorrules
```

### Step 4: Verify

Before submitting code, verify:
- ✅ TypeScript types are correct
- ✅ All imports are from `@vc-shell/framework`
- ✅ Validation schema exists (VeeValidate)
- ✅ All text uses i18n (`$t()`)
- ✅ Composables follow framework patterns
- ✅ `useModificationTracker` is correctly used
- ✅ Components are from UI_COMPONENTS_REFERENCE.md
- ✅ No custom HTML in `VcWidget`
- ✅ `VcCard` used for sections (NOT tabs)

---

## 🚨 CRITICAL RULES - NEVER BREAK THESE

### DO ✅

1. **Use CLI for new app + module (3 commands)**
   ```bash
   npx create-vc-app my-app --skip-module-gen
   cd my-app
   npx create-vc-app generate --module products --type grid --name product --form-fields '[{"name":"name","type":"text"}]'
   npx create-vc-app generate --module products --type details --name product --form-fields '[{"name":"name","type":"text"}]'
   ```

2. **Check UI_COMPONENTS_REFERENCE.md**
   - Before using ANY component
   - Props, events, slots are all documented

3. **Follow .cursorrules patterns**
   - Blade structure
   - Composable pattern
   - Widget pattern
   - API client pattern

4. **Use VcCard for sections**
   ```vue
   <VcCard header="General">...</VcCard>
   <VcCard header="Details">...</VcCard>
   ```

5. **Track modifications**
   ```typescript
   const { modified, resetModificationState } = useModificationTracker({
     currentValue: computed(() => item.value),
     pristineValue: computed(() => pristineValue.value),
   });
   ```

### DON'T ❌

1. **Custom HTML in VcWidget**
   ```vue
   <!-- WRONG -->
   <VcWidget>
     <div>Custom content</div>
   </VcWidget>

   <!-- CORRECT -->
   <VcWidget :value="count" title="Title" icon="material-icon" @click="handler" />
   ```

2. **Tabs (they don't exist)**
   ```vue
   <!-- WRONG -->
   <VcTabs><VcTab title="General">...</VcTab></VcTabs>

   <!-- CORRECT -->
   <VcCard header="General">...</VcCard>
   ```

3. **Custom components if VC-Shell has it**
   - Check UI_COMPONENTS_REFERENCE.md first
   - 27 components available

4. **Modify core/ or shared/**
   - These are framework directories
   - DO NOT TOUCH

5. **Skip validation or i18n**
   ```typescript
   // ALWAYS include validation
   const validationSchema = yup.object({ ... });

   // ALWAYS use i18n
   label: t("MODULE.FIELD.LABEL")
   ```

---

## 📚 Quick Reference

### File Structure
```
src/
├── modules/              # User modules (MODIFY)
│   └── {module}/
│       ├── pages/       # Blades
│       ├── composables/ # Business logic
│       ├── components/  # Custom components
│       └── locales/     # Translations
├── api/                 # API clients (CREATE)
├── core/                # Framework core (DO NOT MODIFY)
└── shared/              # Shared utilities (DO NOT MODIFY)
```

### Component Categories

**Form (12 components):**
VcInput, VcSelect, VcEditor, VcGallery, VcInputCurrency, VcMultivalue, VcSwitch, VcCheckbox, VcRadioButton, VcTextarea, VcFileUpload, VcForm

**Layout (3 components):**
VcCard, VcBlade, VcContainer

**Data Display (2 components):**
VcTable, VcWidget

**Navigation (2 components):**
VcButton, VcPagination

**Feedback (8 components):**
VcLabel, VcHint, VcStatus, VcBadge, VcTooltip, VcLoading, VcIcon, VcPopup

### CLI Commands

```bash
# Create app
npx create-vc-app my-app --skip-module-gen

# Generate grid blade (creates module)
npx create-vc-app generate --module {name} --type grid --name {entity} --form-fields '[{...}]'

# Generate details blade (to existing module)
npx create-vc-app generate --module {name} --type details --name {entity} --form-fields '[{...}]'

# Generate widget (to existing blade)
npx create-vc-app generate \
  --widget \
  --widget-module {module} \
  --widget-blade {blade} \
  --widget-name {name} \
  --widget-entity {entity} \
  --widget-icon {icon}
```

### Field Types for CLI

```
text, textarea, number, date, select, checkbox, radio, switch, currency, editor, image, multivalue, gallery
```

---

## 🔄 Typical Workflows

### Workflow 1: Create New Module
1. User: "Create products module with name, price, category"
2. AI: Check `prompts/quick-start-scenarios.md` for products template
3. AI: Run CLI command with parameters
4. AI: Verify module created successfully
5. AI: Explain what was created and how to test

### Workflow 2: Modify Existing Module
1. User: "Add description field to products"
2. AI: Read current products blade file
3. AI: Check `prompts/simple-modifications.md` for "Add form field" template
4. AI: Apply template with VcEditor component (from UI_COMPONENTS_REFERENCE.md)
5. AI: Update validation schema
6. AI: Update i18n keys
7. AI: Show changes and explain

### Workflow 3: Fix Error
1. User: "Table not showing data"
2. AI: Check `guides/troubleshooting.md`
3. AI: Identify issue (e.g., missing stateKey)
4. AI: Apply fix from common pitfalls in .cursorrules
5. AI: Explain what was wrong and how it's fixed

### Workflow 4: Add Complex Feature
1. User: "Add multi-step wizard for product creation"
2. AI: Check `prompts/advanced-scenarios.md` for wizard pattern
3. AI: Implement pattern following guide
4. AI: Use components from UI_COMPONENTS_REFERENCE.md
5. AI: Follow composable patterns from .cursorrules
6. AI: Test and verify

---

## 💡 Pro Tips

1. **Always start with CLI if generating**
   - Faster and more consistent
   - Follows all framework patterns
   - Creates all necessary files

2. **Reference docs, don't guess**
   - UI_COMPONENTS_REFERENCE.md has all component props
   - .cursorrules has all patterns
   - prompts/ have ready templates

3. **Use non-interactive CLI mode**
   ```bash
   # Provide all parameters at once
   npx create-vc-app generate --module products --type grid --name product --form-fields "name:text,price:currency"
   ```

4. **Check existing modules for patterns**
   - Look at user's existing modules
   - Follow same structure
   - Maintain consistency

5. **Test changes immediately**
   ```bash
   yarn type-check  # TypeScript validation
   yarn serve       # Run dev server
   ```

---

## 📖 Documentation Index

**Essential Files (READ ALWAYS):**
- `/.cursorrules` - Framework rules
- `/ai-guides/UI_COMPONENTS_REFERENCE.md` - Component docs

**Prompt Templates (USE FOR TASKS):**
- `/ai-guides/prompts/cli-usage.md` - CLI reference
- `/ai-guides/prompts/quick-start-scenarios.md` - Module templates
- `/ai-guides/prompts/simple-modifications.md` - Modification templates
- `/ai-guides/prompts/advanced-scenarios.md` - Complex patterns
- `/ai-guides/prompts/api-client-generation.md` - API integration
- `/ai-guides/prompts/adapt-existing-module.md` - Module adaptation

**Technical Guides (REFERENCE WHEN NEEDED):**
- `/ai-guides/guides/complete-workflow.md` - Full development lifecycle
- `/ai-guides/guides/composables-reference.md` - Composables guide
- `/ai-guides/guides/blade-patterns.md` - Blade architecture
- `/ai-guides/guides/troubleshooting.md` - Common issues
- `/ai-guides/guides/ui-components-reference.md` - Advanced component usage

---

## 🎓 Remember

1. **This project is FULLY documented** - Don't guess, read the docs
2. **Use CLI first** - Manual coding is secondary
3. **Follow patterns strictly** - They're tested and proven
4. **Verify before submitting** - Use the checklist
5. **Ask if unclear** - Better to clarify than to make mistakes

---

**Your goal:** Help users build high-quality VC-Shell applications efficiently using the framework's full power.

