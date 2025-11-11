# VC-Shell AI Code Generation Rules

Complete rules for AI assistants generating VC-Shell modules.

---

## 🚨 CRITICAL RULE

**NEVER generate code manually!**

**ALWAYS use `generate_complete_module` MCP tool!**

---

## Workflow

### Phase 0: Create New App (Optional)

If user wants to create a new VC-Shell application:

**User Request:**
- "Create new VC-Shell app"
- "Initialize new project called my-app"
- "Start new VC-Shell application"

**AI MUST:**

1. **Call scaffold_app tool:**
   ```typescript
   scaffold_app({
     projectName: "my-vendor-portal", // kebab-case
     targetDirectory: "/path/to/workspace" // optional
   })
   ```

2. **Tool automatically:**
   - Runs `npx @vc-shell/create-vc-app@latest my-vendor-portal --skip-module-gen`
   - Creates base app structure
   - NO modules generated yet (AI will generate them in Phase 1)

3. **Report success:**
   ```
   ✅ VC-Shell app 'my-vendor-portal' created!
   
   Path: /path/to/workspace/my-vendor-portal
   
   Next steps:
   1. cd my-vendor-portal
   2. npm install
   3. npm run dev
   
   Ready to generate modules!
   ```

4. **User can now generate modules** using Phase 1 workflow

---

### Phase 1: UI-Plan Generation (MANDATORY FIRST)

**User Request Examples:**
- "Create vendor management module"
- "Add product catalog with list and details"
- "Generate order management"

**AI MUST:**

1. **Parse requirements:**
   - Module name (kebab-case)
   - Blade types (list, details, or both)
   - Entity name (singular and plural)
   - Columns (for list)
   - Fields (for details)
   - Features (filters, multiselect, validation)

2. **Generate UI-Plan JSON:**

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
            { "key": "name", "title": "Name", "sortable": true },
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
            { "key": "email", "as": "VcInput", "label": "Email", "type": "email", "required": true },
            { "key": "phone", "as": "VcInput", "label": "Phone", "type": "tel" }
          ]
        }
      ]
    }
  ]
}
```

3. **Validate plan:**
   ```typescript
   validate_ui_plan({ plan })
   ```

4. **Save to file:**
   ```typescript
   write("__ai/ui-plan-vendor-management.json", JSON.stringify(plan, null, 2))
   ```

5. **Show to user and WAIT:**
   ```
   "✅ UI-Plan generated for vendor-management module.
   
   Plan includes:
   - List blade at /vendors (workspace, menu item)
   - Details blade at /vendor (singular, no :id)
   
   Columns: name, email, status
   Fields: name, email, phone
   
   Saved to: __ai/ui-plan-vendor-management.json
   
   Should I proceed with code generation?"
   ```

**FORBIDDEN at this stage:**
- ❌ Creating any .vue files
- ❌ Creating any .ts files
- ❌ Editing main.ts
- ❌ Using write/search_replace for code

---

### Phase 2: Code Generation (AUTOMATIC)

**User confirms:** "Yes, generate"

**AI MUST:**

1. **Read saved plan:**
   ```typescript
   const plan = JSON.parse(readFile("__ai/ui-plan-vendor-management.json"));
   ```

2. **Call generate_complete_module:**
   ```typescript
   generate_complete_module({
     plan: plan,
     cwd: "/path/to/project",
     dryRun: false
   })
   ```

3. **Tool does EVERYTHING automatically:**
   - ✅ Generates blades (AST transformation)
   - ✅ Generates composables (mock data)
   - ✅ Generates locales (en.json)
   - ✅ Creates module structure
   - ✅ Registers in main.ts

4. **Report results:**
   ```
   "✅ Module generated successfully!
   
   Created files:
   - src/modules/vendor-management/pages/vendors-list.vue (201 lines)
   - src/modules/vendor-management/pages/vendor-details.vue (189 lines)
   - src/modules/vendor-management/composables/useVendorList.ts (92 lines)
   - src/modules/vendor-management/composables/useVendorDetails.ts (87 lines)
   - src/modules/vendor-management/locales/en.json (48 keys)
   - src/modules/vendor-management/locales/index.ts
   - src/modules/vendor-management/pages/index.ts
   - src/modules/vendor-management/composables/index.ts
   - src/modules/vendor-management/index.ts
   
   Module registered in src/main.ts ✓
   
   All composables use mock data. UI is ready to test immediately!"
   ```

**FORBIDDEN at this stage:**
- ❌ Manual template adaptation
- ❌ Manual composable creation
- ❌ Manual locale generation
- ❌ Manual registration

---

## UI-Plan Rules

### Naming Conventions

**Module name:** kebab-case
- ✅ `vendor-management`
- ✅ `product-catalog`
- ❌ `VendorManagement`
- ❌ `vendor_management`

**Blade IDs:** kebab-case
- ✅ `vendors-list`
- ✅ `vendor-details`
- ❌ `VendorsList`

**Routes:**
- List: `/{plural}` (e.g., `/vendors`)
- Details: `/{singular}` (e.g., `/vendor`) - NO :id!
- Must start with `/`

### Blade Properties

**List blade MUST have:**
- `isWorkspace: true`
- `menuItem` with title, icon, priority
- `layout: "grid"`
- At least one column

**Details blade MUST have:**
- `layout: "details"`
- NO `isWorkspace` (defaults to false)
- NO `menuItem`
- At least one field

### Components

**Only use components from Component Registry:**
- VcBlade, VcTable, VcForm
- VcInput, VcTextarea, VcSelect
- VcCheckbox, VcSwitch
- VcButton, VcCard, VcContainer
- etc. (42 total)

**Never invent components!**

### Column Types

Valid types:
- `text` - Default string display
- `number` - Numeric values
- `money` - Currency formatting
- `date` - Date formatting
- `date-ago` - Relative time (e.g., "2 days ago")
- `status` - Status badge
- `boolean` - Checkbox/icon
- `image` - Image thumbnail
- `email` - Email with mailto link

### Field Types

Valid types:
- `text` - Text input
- `email` - Email validation
- `number` - Numeric input
- `date` - Date picker
- `boolean` - Switch/checkbox
- `url` - URL validation
- `tel` - Phone number

### Field Components (as)

Valid values:
- `VcInput` - Text inputs
- `VcTextarea` - Multi-line text
- `VcSelect` - Dropdown
- `VcCheckbox` - Single checkbox
- `VcSwitch` - Toggle switch
- `VcGallery` - Image gallery
- `VcFileUpload` - File upload

---

## Generated Code Structure

### File Naming

**Blades:**
- List: `{plural}-list.vue` (vendors-list.vue)
- Details: `{singular}-details.vue` (vendor-details.vue)

**Composables:**
- List: `use{Singular}List.ts` (useVendorList.ts)
- Details: `use{Singular}Details.ts` (useVendorDetails.ts)

**Component Names (in code):**
- List: `{Singular}List` (VendorList)
- Details: `{Singular}Details` (VendorDetails)

### defineOptions

**List blade:**
```typescript
defineOptions({
  name: "VendorList",        // Singular + List
  url: "/vendors",           // Plural
  isWorkspace: true,         // Required!
  menuItem: {                // Required!
    title: "VENDORS.MENU.TITLE",
    icon: "material-people",
    priority: 1,
  },
});
```

**Details blade:**
```typescript
defineOptions({
  name: "VendorDetails",     // Singular + Details
  url: "/vendor",            // Singular, no :id
  // isWorkspace: false (default, omitted)
  // NO menuItem
});
```

---

## Mock Data Pattern

### List Composable

```typescript
const MOCK_VENDORS: Vendor[] = [
  {
    id: "1",
    name: "Vendor 1",
    email: "email1@example.com",
    status: "active",
    createdDate: new Date(Date.now() - 1 * 86400000),
  },
  // ... more items
];

async function loadVendors(query?: SearchQuery) {
  loading.value = true;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Apply mock filtering & pagination
  let filtered = [...MOCK_VENDORS];
  
  if (query?.keyword) {
    filtered = filtered.filter(/* search logic */);
  }
  
  const skip = query?.skip || 0;
  const take = query?.take || 20;
  items.value = filtered.slice(skip, skip + take);
  
  loading.value = false;
}
```

### Details Composable

```typescript
async function loadVendor(args: { id: string }) {
  loading.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock data
  item.value = {
    id: args.id,
    name: `Vendor ${args.id}`,
    email: `email${args.id}@example.com`,
    // ... other fields
  };
  
  originalItem.value = JSON.parse(JSON.stringify(item.value));
  loading.value = false;
}
```

---

## Quality Checklist

Before completing generation, verify:

- [ ] UI-Plan validated (no errors)
- [ ] generate_complete_module called
- [ ] All files generated
- [ ] Module registered in main.ts
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] File naming correct (plural-list, singular-details)
- [ ] Component names correct (SingularList, SingularDetails)
- [ ] URLs correct (/plural, /singular)
- [ ] i18n keys follow MODULE.PAGES.BLADE.SECTION.KEY
- [ ] Mock data present in composables

---

## Example Prompts

### Simple Module
```
Create vendor management module with name, email, status fields
```

**AI generates:**
- vendors-list.vue (table with 3 columns)
- vendor-details.vue (form with 3 fields)
- Composables with mock data
- Full i18n structure

### With Features
```
Create product catalog with:
- List with name, price, SKU, image columns
- Details with name, description, price, gallery
- Status filter in list
```

**AI generates:**
- products-list.vue (table with filters slot)
- product-details.vue (form with VcGallery)
- Enhanced composables
- Filter-specific i18n keys

---

## Error Handling

### If validation fails:

```typescript
validate_and_fix_plan({ plan })
```

**Returns:**
- Validation errors
- Suggested fixes
- Fixed plan (if possible)

**AI should:**
1. Review errors
2. Fix plan
3. Re-validate
4. Proceed with generation

### If generation fails:

1. Check plan structure
2. Verify component names
3. Check field/column definitions
4. Re-generate plan
5. Try again

---

## Remember

- ✅ Two patterns only: List (table) and Details (form)
- ✅ Mock data for all composables
- ✅ Automatic generation via MCP
- ✅ No manual template adaptation
- ✅ No API clients (added later)
- ✅ No preview needed
- ✅ Fast and automatic!

**AI does ALL the work through MCP tools.** 🚀

