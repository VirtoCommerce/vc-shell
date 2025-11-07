# Adapt Existing Module

Guide for taking ready-made VC-Shell modules and adapting them to your needs. Use when you have an existing module (from GitHub, vendor-portal, or other source) and want to customize it for your application.

## What is Module Adaptation?

**Module adaptation** means taking an existing, working VC-Shell module and customizing it:
- Connect to your own API instead of the original one
- Modify UI (add/remove columns, fields, widgets)
- Change functionality (filters, bulk operations, validations)
- Update styling and branding

**Important**: The module type stays the same - if it was a product catalog, it remains a catalog with similar structure.

## When to Use This Guide

✅ You have a ready-made module from VirtoCommerce or community
✅ You want to use its structure and UI
✅ You need to connect it to your own API
✅ You want to add/remove some features

❌ Don't use if you need a completely different entity type (use `create-vc-app blade` generator instead)

---

## Step 1: Get the Module

### Clone Module from Repository

```
I need to get module {{moduleName}} from repository.
Repository URL: {{githubUrl}}
Target location in my app: src/modules/{{target-module-name}}

Commands:
1. Clone repository: git clone {{githubUrl}} temp-module
2. Copy module: cp -r temp-module/src/modules/{{source-module-name}} src/modules/{{target-module-name}}
3. Clean up: rm -rf temp-module
4. Install dependencies if needed
```

**Example:**
```
Repository URL: https://github.com/VirtoCommerce/vc-shell
Target location: src/modules/products
source-module-name: products
target-module-name: products
```

---

### Download Module Files Manually

```
I have module files for {{moduleName}}.
Files are located in: {{filesLocation}}

Copy structure:
- pages/ → src/modules/{{module-name}}/pages/
- components/ → src/modules/{{module-name}}/components/
- composables/ → src/modules/{{module-name}}/composables/
- locales/ → src/modules/{{module-name}}/locales/
- index.ts → src/modules/{{module-name}}/index.ts
```

---

## Step 2: Connect to Your API

### Replace API Client

```
Connect module {{moduleName}} to my API.

My API details:
Base URL: {{apiBaseUrl}}
Authentication: {{authMethod}}

Endpoints:
- List items: {{listEndpoint}} ({{listMethod}})
- Get by ID: {{getByIdEndpoint}} ({{getMethod}})
- Create: {{createEndpoint}} ({{createMethod}})
- Update: {{updateEndpoint}} ({{updateMethod}})
- Delete: {{deleteEndpoint}} ({{deleteMethod}})

Response structure:
{{apiResponseStructure}}

Request payload structure:
{{apiRequestStructure}}

Changes needed:
1. Update composable files: use{{EntityName}}List.ts and use{{EntityName}}Details.ts
2. Replace API client class: {{OldApiClient}} → {{NewApiClient}} or use fetch/axios
3. Update endpoint URLs in all API calls
4. Map API response fields to match component expectations
5. Map component data to match API request payload
```

**Example:**
```
My API details:
Base URL: https://api.mystore.com/v1
Authentication: Bearer token in Authorization header

Endpoints:
- List items: /products (GET)
- Get by ID: /products/:id (GET)
- Create: /products (POST)
- Update: /products/:id (PUT)
- Delete: /products/:id (DELETE)

Response structure:
{
  data: { items: [...], total: number },
  success: boolean
}

Map response:
- response.data.items → items
- response.data.total → totalCount
```

---

### Map API Response Fields

```
Map API response fields for {{moduleName}}.

My API returns:
{{myApiFields}}

Module expects:
{{moduleExpectedFields}}

Field mapping:
{{fieldMapping}}

Apply mapping in composable: use{{EntityName}}{{Type}}.ts
Transform data in {{transformLocation}}
```

**Example:**
```
My API returns:
- product_id → map to → id
- product_name → map to → name
- product_sku → map to → sku
- image_url → map to → imgSrc
- created_at → map to → createdDate
- is_active → map to → isActive

Apply in: useProductsList.ts
Transform in: loadProducts function after API call
```

---

### Handle API Errors

```
Update error handling in {{moduleName}} composables.

My API error structure:
{{errorStructure}}

Error handling:
- Show notification: {{showNotification}}
- Error message location: {{errorMessagePath}}
- Retry logic: {{retryLogic}}
- Fallback behavior: {{fallbackBehavior}}
```

---

## Step 3: Customize Table UI

### Add/Remove Columns

```
Customize table columns in {{moduleName}} list blade.

Add columns:
{{columnsToAdd}}

Remove columns:
{{columnsToRemove}}

Reorder columns:
{{newColumnOrder}}

Update in: modules/{{module-name}}/pages/{{module-name}}-list.vue
Update locales: modules/{{module-name}}/locales/en.json
```

**Example:**
```
Add columns:
- name: "supplier", type: "text", sortable: true, width: "150px"
- name: "warehouse", type: "text", sortable: true, width: "120px"

Remove columns:
- "oldColumn1"
- "oldColumn2"

New order: image, name, supplier, sku, warehouse, price, status, createdDate
```

---

### Change Column Types

```
Change column display types in {{moduleName}} table.

Column changes:
{{columnTypeChanges}}

Update cell templates if needed:
{{cellTemplateChanges}}
```

**Example:**
```
Column changes:
- "status": from "text" to "status-icon" (green=active, gray=inactive)
- "price": from "text" to "currency" (format with $)
- "createdDate": from "text" to "date-ago" (relative time)

Create custom cell template for "status" if needed
```

---

### Update Mobile View

```
Update mobile column positions in {{moduleName}} table.

Mobile position changes:
{{mobilePositionChanges}}

Hide on mobile:
{{hideOnMobile}}
```

**Example:**
```
Mobile positions:
- "image": mobile-position="image"
- "name": mobile-position="top-right"
- "sku": mobile-position="bottom-left"
- "status": mobile-position="status"

Hide on mobile: supplier, warehouse, createdDate
```

---

## Step 4: Customize Form

### Add/Remove Form Fields

```
Customize form fields in {{moduleName}} details blade.

Add fields:
{{fieldsToAdd}}

Remove fields:
{{fieldsToRemove}}

Update validation:
{{validationChanges}}

Update in: modules/{{module-name}}/pages/{{module-name}}-details.vue
Update interface: {{interfaceName}}
Update locales: modules/{{module-name}}/locales/en.json
```

**Example:**
```
Add fields:
- name: "supplier", component: "VcSelect", required: true, options: [...]
- name: "warehouse", component: "VcSelect", required: true, options: [...]
- name: "expiryDate", component: "VcInput", type: "date", required: false

Remove fields:
- "oldField1"
- "oldField2"

Validation:
- "supplier": required, custom validation for unique
- "expiryDate": min date = today
```

---

### Change Field Components

```
Change field component types in {{moduleName}} details blade.

Field changes:
{{fieldComponentChanges}}

Update props:
{{propsChanges}}
```

**Example:**
```
Field changes:
- "description": from VcInput to VcEditor (rich text)
- "category": from VcInput to VcSelect (dropdown with options)
- "active": from VcCheckbox to VcSwitch (toggle)

Update props:
- VcEditor: height="300px", enable: bold, italic, lists
- VcSelect: searchable, options from API, clearable
```

---

### Rearrange Form Layout

```
Rearrange form layout in {{moduleName}} details blade.

Layout type: {{layoutType}}
Sections:
{{formSections}}

Grouping:
{{fieldGrouping}}
```

**Example:**
```
Layout: two-column

Sections:
1. Basic Information (name, sku, category)
2. Inventory (quantity, warehouse, supplier)
3. Pricing (price, cost, currency)
4. Media (images, videos)

Left column: Basic Information, Inventory
Right column: Pricing
Full width: Media
```

---

## Step 5: Add Functionality

### Add Filters

```
Add filters to {{moduleName}} list blade.

Filters:
{{filtersList}}

Filter implementation:
{{filterImplementation}}

Update composable: use{{EntityName}}List.ts
Update API call with filter parameters
```

**Example:**
```
Filters:
- Status filter: select, options: [active, inactive, all], default: all
- Category filter: select, options: from API, multiple selection
- Date range: from/to dates, presets: today, last week, last month

Pass filters to API:
- status → ?status={{value}}
- category → ?categoryId={{value}}
- dateRange → ?from={{startDate}}&to={{endDate}}
```

---

### Add Bulk Operations

```
Add bulk operations to {{moduleName}} list blade.

Operations:
{{bulkOperations}}

Implementation:
{{operationImplementation}}

Update composable with bulk action functions
Add toolbar buttons for bulk actions
Add confirmation dialogs
```

**Example:**
```
Operations:
- Bulk delete: delete selected items, show confirmation
- Bulk status update: change status for selected items
- Bulk export: export selected items to CSV/Excel

Toolbar buttons:
- "Delete Selected": disabled when no selection, danger style
- "Change Status": show dropdown with status options
- "Export": show format selection (CSV/Excel)
```

---

### Add Widgets

```
Add widgets to {{moduleName}} details blade.

Widgets:
{{widgetsList}}

Widget implementation:
{{widgetImplementation}}

Create widget components in: modules/{{module-name}}/components/widgets/
Register widgets in details blade using useWidgets()
```

**Example:**
```
Widgets:
1. Related Items Widget
   - Shows: count of related items
   - Icon: material-link
   - Click: opens related items list blade

2. Activity Widget  
   - Shows: recent activity count
   - Icon: material-history
   - Click: opens activity log blade

3. Analytics Widget
   - Shows: views/sales count
   - Icon: material-insights
   - Click: opens analytics blade
```

---

### Add Custom Actions

```
Add custom actions to {{moduleName}}.

Actions:
{{customActions}}

Location: {{actionLocation}}
Implementation: {{actionImplementation}}
```

**Example:**
```
Actions:
1. Duplicate: creates a copy of the item
   - Location: toolbar in details blade
   - Behavior: copy all fields, add "(Copy)" to name, save as new

2. Archive: soft delete (set isArchived=true)
   - Location: row actions menu in list
   - Behavior: confirmation dialog, update status, hide from list

3. Publish: change status to published
   - Location: toolbar in details blade
   - Behavior: validate required fields, update status, show notification
```

---

## Step 6: Update Styling

### Change Colors and Branding

```
Update colors and branding in {{moduleName}}.

Color changes:
{{colorChanges}}

Icon changes:
{{iconChanges}}

Apply to:
{{applyLocations}}
```

**Example:**
```
Colors:
- Primary buttons: from blue to #00A651 (company green)
- Status "active": from default green to #00A651
- Danger buttons: keep default red

Icons:
- Module menu icon: from "material-inventory_2" to "material-store"
- Add button: from "material-add" to "material-add_circle"

Apply to:
- Module menu item in index.ts
- Toolbar buttons
- Status indicators
```

---

### Update Spacing and Layout

```
Update spacing and layout in {{moduleName}}.

Spacing changes:
{{spacingChanges}}

Layout changes:
{{layoutChanges}}
```

**Example:**
```
Spacing:
- Form field gap: from 16px to 24px
- Card padding: from 16px to 20px
- Table row height: from 48px to 56px

Layout:
- List blade width: from 50% to 60%
- Details blade width: from 50% to 70%
- Form max-width: 800px centered
```

---

### Add Custom Styles

```
Add custom CSS styles to {{moduleName}}.

Custom styles:
{{customStyles}}

Style location: {{styleLocation}}
Scope: {{styleScope}}
```

---

## Step 7: Update Localization

### Rename Module in UI

```
Update module name and labels in {{moduleName}}.

New names:
{{nameChanges}}

Update in locales:
{{localeChanges}}

Update menu item: {{menuItemChanges}}
```

**Example:**
```
New names:
- Module title: from "Products" to "Inventory Items"
- Menu item: from "Products" to "Inventory"
- List title: from "My Products" to "Inventory Management"

Update locales:
- {{MODULE_NAME}}.MENU.TITLE = "Inventory"
- {{MODULE_NAME}}.PAGES.LIST.TITLE = "Inventory Management"
- {{MODULE_NAME}}.PAGES.DETAILS.TITLE = "Item Details"

Menu item in index.ts:
- title: "INVENTORY.MENU.TITLE"
- icon: "material-inventory"
```

---

### Add Field Labels

```
Add/update field labels in {{moduleName}}.

Field label changes:
{{fieldLabelChanges}}

Update in: modules/{{module-name}}/locales/en.json
```

**Example:**
```
Field labels:
- "supplier": label = "Supplier Name", placeholder = "Select supplier"
- "warehouse": label = "Warehouse Location", placeholder = "Select warehouse"
- "expiryDate": label = "Expiration Date", placeholder = "Select date"

Locale structure:
FIELDS.SUPPLIER.TITLE = "Supplier Name"
FIELDS.SUPPLIER.PLACEHOLDER = "Select supplier"
FIELDS.WAREHOUSE.TITLE = "Warehouse Location"
...
```

---

### Add Additional Languages

```
Add {{language}} translation for {{moduleName}}.

Copy en.json structure to {{languageCode}}.json
Translate all keys
Register in locales/index.ts
```

---

## Complete Example: Adapting Products Module

### Scenario

You have VirtoCommerce Products module and want to adapt it for your inventory system with your own API.

### Step-by-Step

**1. Get the module:**
```bash
git clone https://github.com/VirtoCommerce/vc-shell temp
cp -r temp/apps/vendor-portal/src/modules/products src/modules/inventory
rm -rf temp
```

**2. Connect to your API:**

Update `src/modules/inventory/composables/useInventoryList.ts`:
```typescript
// Replace VirtoCommerce API client with your API
const loadItems = async () => {
  const response = await fetch(`${API_URL}/inventory?skip=${skip}&take=${take}`);
  const data = await response.json();
  
  // Map your API response to module structure
  return {
    results: data.items.map(item => ({
      id: item.inventory_id,
      name: item.item_name,
      sku: item.item_sku,
      imgSrc: item.image_url,
      quantity: item.stock_quantity,
      warehouse: item.warehouse_name,
      supplier: item.supplier_name,
      isActive: item.is_active,
      createdDate: item.created_at
    })),
    totalCount: data.total
  };
};
```

**3. Update table columns:**

In `src/modules/inventory/pages/inventory-list.vue`:
```typescript
const tableColumns = ref<ITableColumns[]>([
  // Keep existing: image, name, sku
  // Add new columns:
  {
    id: "quantity",
    title: computed(() => t("INVENTORY.PAGES.LIST.TABLE.HEADER.QUANTITY")),
    sortable: true,
  },
  {
    id: "warehouse",
    title: computed(() => t("INVENTORY.PAGES.LIST.TABLE.HEADER.WAREHOUSE")),
    sortable: true,
  },
  {
    id: "supplier",
    title: computed(() => t("INVENTORY.PAGES.LIST.TABLE.HEADER.SUPPLIER")),
    sortable: true,
  },
  // Keep: isActive, createdDate
]);
```

**4. Update form fields:**

In `src/modules/inventory/pages/inventory-details.vue`:
```vue
<!-- Keep existing: name, sku, description -->

<!-- Add new fields: -->
<Field name="quantity" rules="required|min_value:0">
  <VcInput
    v-model="item.quantity"
    type="number"
    :label="$t('INVENTORY.PAGES.DETAILS.FIELDS.QUANTITY.TITLE')"
    required
  />
</Field>

<Field name="warehouse" rules="required">
  <VcSelect
    v-model="item.warehouseId"
    :label="$t('INVENTORY.PAGES.DETAILS.FIELDS.WAREHOUSE.TITLE')"
    :options="warehouseOptions"
    required
  />
</Field>

<Field name="supplier" rules="required">
  <VcSelect
    v-model="item.supplierId"
    :label="$t('INVENTORY.PAGES.DETAILS.FIELDS.SUPPLIER.TITLE')"
    :options="supplierOptions"
    required
  />
</Field>
```

**5. Update locales:**

In `src/modules/inventory/locales/en.json`:
```json
{
  "INVENTORY": {
    "MENU": {
      "TITLE": "Inventory"
    },
    "PAGES": {
      "LIST": {
        "TITLE": "Inventory Management",
        "TABLE": {
          "HEADER": {
            "QUANTITY": "Quantity",
            "WAREHOUSE": "Warehouse",
            "SUPPLIER": "Supplier"
          }
        }
      },
      "DETAILS": {
        "FIELDS": {
          "QUANTITY": {
            "TITLE": "Quantity",
            "PLACEHOLDER": "Enter quantity"
          },
          "WAREHOUSE": {
            "TITLE": "Warehouse Location",
            "PLACEHOLDER": "Select warehouse"
          },
          "SUPPLIER": {
            "TITLE": "Supplier",
            "PLACEHOLDER": "Select supplier"
          }
        }
      }
    }
  }
}
```

**6. Register module:**

In `src/main.ts`:
```typescript
import inventoryModule from "./modules/inventory";

app.use(inventoryModule);
```

**7. Test and format:**
```bash
yarn serve
# Test all functionality
yarn lint --fix
yarn format
```

---

## Adaptation Checklist

Use this checklist to ensure you've adapted everything:

### Module Structure
- [ ] Module files copied to correct location
- [ ] Files/folders renamed if needed
- [ ] Module registered in main.ts
- [ ] Routes configured

### API Integration
- [ ] API client replaced or configured
- [ ] Endpoints updated in all composables
- [ ] API response mapped to module structure
- [ ] API request payload mapped from module data
- [ ] Error handling updated
- [ ] Authentication handled

### UI - List Blade
- [ ] Table columns added/removed
- [ ] Column types updated
- [ ] Column order adjusted
- [ ] Mobile column positions configured
- [ ] Sorting configured
- [ ] Empty/not found states updated

### UI - Details Blade
- [ ] Form fields added/removed
- [ ] Field components updated
- [ ] Validation rules updated
- [ ] Form layout adjusted
- [ ] Field grouping/sections added

### Functionality
- [ ] Filters added/updated
- [ ] Bulk operations implemented
- [ ] Widgets added
- [ ] Custom actions added
- [ ] Toolbar buttons updated

### Styling
- [ ] Colors updated
- [ ] Icons changed
- [ ] Spacing adjusted
- [ ] Custom styles added
- [ ] Mobile responsiveness checked

### Localization
- [ ] Module name updated
- [ ] All locale keys added
- [ ] Field labels updated
- [ ] Error messages updated
- [ ] Additional languages added (if needed)

### TypeScript
- [ ] Interfaces updated
- [ ] Types aligned with API
- [ ] No TypeScript errors
- [ ] Props/emits defined

### Testing
- [ ] List blade loads data
- [ ] Details blade opens/closes
- [ ] Create new item works
- [ ] Update item works
- [ ] Delete item works
- [ ] Validation works
- [ ] Search works
- [ ] Filters work
- [ ] Sorting works
- [ ] Pagination works

### Final Steps
- [ ] Code formatted (Prettier)
- [ ] Linter passed
- [ ] Type check passed
- [ ] Console has no errors
- [ ] Tested on mobile
- [ ] Documentation updated

---

## Common Patterns

### Pattern 1: Replace VirtoCommerce API with Custom REST API

```typescript
// Before (VirtoCommerce):
const { getApiClient } = useApiClient(ProductsClient);
const client = await getApiClient();
const result = await client.searchProducts(searchQuery);

// After (Custom REST API):
const response = await fetch(`${API_URL}/products?${new URLSearchParams(searchQuery)}`);
const result = await response.json();

// Map response:
return {
  results: result.data.map(item => ({
    id: item.product_id,
    name: item.product_name,
    // ... other fields
  })),
  totalCount: result.total
};
```

---

### Pattern 2: Add Custom Filter

```typescript
// 1. Add filter state
const selectedCategory = ref<string | null>(null);

// 2. Add to search query
const searchQuery = ref({
  skip: 0,
  take: 20,
  keyword: "",
  categoryId: null, // Add filter
});

// 3. Update load function
const loadItems = async () => {
  const params = {
    ...searchQuery.value,
    ...(selectedCategory.value && { categoryId: selectedCategory.value })
  };
  // ... API call with params
};

// 4. Add filter UI in template
<VcSelect
  v-model="selectedCategory"
  :options="categoryOptions"
  placeholder="Filter by category"
  clearable
  @update:model-value="loadItems"
/>
```

---

### Pattern 3: Add Widget

```typescript
// 1. Create widget component
// modules/{{module}}/components/widgets/my-widget/my-widget.vue

// 2. Register in details blade
import { useWidgets } from "@vc-shell/framework";
import MyWidget from "../components/widgets/my-widget/my-widget.vue";

const { registerWidget, unregisterWidget } = useWidgets();

onMounted(() => {
  registerWidget({
    id: "myWidget",
    component: markRaw(MyWidget),
    // ... widget config
  });
});

onBeforeUnmount(() => {
  unregisterWidget("myWidget");
});
```

---

## Troubleshooting

### Module Not Showing in Menu

**Problem:** Module copied but doesn't appear in navigation

**Solution:**
1. Check module is registered in `main.ts`
2. Check `defineOptions` in list blade has `isWorkspace: true`
3. Check `menuItem` configuration in `defineOptions`
4. Restart dev server

---

### API Calls Failing

**Problem:** API integration not working

**Solution:**
1. Check API URL and endpoints
2. Verify response structure matches expected
3. Check network tab in browser DevTools
4. Add console.log to see actual API response
5. Verify authentication/headers

---

### Missing Translations

**Problem:** UI shows locale keys instead of text

**Solution:**
1. Check locale file exists: `modules/{{module}}/locales/en.json`
2. Verify locale structure matches keys used in templates
3. Check module exports locales in `locales/index.ts`
4. Restart dev server after locale changes

---

### TypeScript Errors

**Problem:** TypeScript compilation errors

**Solution:**
1. Update interface definitions to match API
2. Add missing properties to interfaces
3. Use correct types for props/emits
4. Run `yarn type-check` to see all errors

---

## Need More Help?

- **Simple modifications**: See `simple-modifications.md`
- **Complete workflow**: See `guides/complete-workflow.md`
- **Troubleshooting**: See `guides/troubleshooting.md`
- **API client generation**: See `api-client-generation.md`
