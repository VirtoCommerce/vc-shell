# VC Shell Conventions

Code conventions and best practices for VC Shell applications.

## Naming Conventions

### Module Names
**Format:** kebab-case  
**Examples:** `products`, `vendor-management`, `order-processing`

### Entity Names
**Format:** PascalCase (singular)  
**Examples:** `Product`, `VendorProfile`, `OrderItem`

### File Names

**Blade files:** kebab-case
- Grid blade: `{entity-plural}.vue` (e.g., `products.vue`)
- Details blade: `{entity}-details.vue` (e.g., `product-details.vue`)

**Composables:** camelCase with `use` prefix
- Grid: `use{Entity}List.ts` (e.g., `useProductList.ts`)
- Details: `use{Entity}Details.ts` (e.g., `useProductDetails.ts`)

**Locale files:** lowercase
- `en.json`, `de.json`, `fr.json`

### Component Names
**Format:** PascalCase  
**Examples:** `ProductList`, `VendorDetails`, `OrderSummary`

### I18n Keys
**Format:** UPPER_SNAKE_CASE  
**Structure:** `{MODULE}.{SECTION}.{SUBSECTION}.{KEY}`

**Examples:**
- `PRODUCTS.PAGES.LIST.TITLE`
- `VENDORS.PAGES.DETAILS.FORM.INFO.NAME`
- `ORDERS.PAGES.ALERTS.DELETE_CONFIRMATION`

## Directory Structure

```
src/
└── modules/
    └── {module-name}/
        ├── index.ts                  # Module entry point
        ├── pages/
        │   ├── index.ts              # Export all blades
        │   ├── {entity-plural}.vue   # Grid blade
        │   └── {entity}-details.vue  # Details blade
        ├── composables/
        │   ├── index.ts              # Export all composables
        │   ├── use{Entity}List.ts    # Grid composable
        │   └── use{Entity}Details.ts # Details composable
        ├── locales/
        │   ├── index.ts
        │   └── en.json               # English translations
        └── components/
            └── widgets/              # Module-specific widgets
```

## Blade Conventions

### Grid Blade (List View)

**File:** `{entity-plural}.vue`  
**Purpose:** Display list of items with table, search, filters

**Required:**
- VcTable component
- Toolbar with refresh/add actions
- Search functionality
- Empty state
- Not found state

**Optional:**
- Filters
- Multi-select
- Export functionality

**Example:**
```vue
<script setup>
defineOptions({
  name: "ProductList",
  url: "/products",
  isWorkspace: true,
  menuItem: {
    id: "products",
    title: "PRODUCTS.MENU.TITLE",
    icon: "material-list",
    priority: 1,
  },
});
</script>
```

### Details Blade (Form View)

**File:** `{entity}-details.vue`  
**Purpose:** Create/edit single item with form

**Required:**
- VcForm component with fields
- Save/Delete toolbar actions
- Validation (vee-validate)
- Modified state tracking
- Close confirmation

**Optional:**
- Multi-step wizard
- File uploads
- Image gallery

**Example:**
```vue
<script setup>
defineOptions({
  name: "ProductDetails",
  url: "/products/:id?",
  isWorkspace: false,
});
</script>
```

## Composable Conventions

### Grid Composable

**File:** `use{Entity}List.ts`  
**Purpose:** Manage list data, pagination, search, filters

**Returns:**
- `items: Ref<T[]>` - Array of items
- `loading: Ref<boolean>` - Loading state
- `totalCount: Ref<number>` - Total items count
- `pages: ComputedRef<number>` - Total pages
- `currentPage: Ref<number>` - Current page
- `searchValue: Ref<string>` - Search keyword
- `sortExpression: Ref<string>` - Sort expression
- `load{Entity}List()` - Load items
- `remove{Entity}()` - Delete item
- `reload()` - Reload list

### Details Composable

**File:** `use{Entity}Details.ts`  
**Purpose:** Manage single item data, save, delete

**Returns:**
- `item: Ref<T>` - Item data
- `loading: Ref<boolean>` - Loading state
- `isModified: Ref<boolean>` - Modification tracking
- `load{Entity}()` - Load item by ID
- `save{Entity}()` - Save item
- `delete{Entity}()` - Delete item
- `resetModificationState()` - Reset modification flag

## Localization Conventions

### Structure

```json
{
  "MODULE_NAME": {
    "MENU": {
      "TITLE": "Module Title"
    },
    "PAGES": {
      "LIST": {
        "TITLE": "Items List",
        "SEARCH": { "PLACEHOLDER": "Search..." },
        "TOOLBAR": { "REFRESH": "Refresh", "ADD": "Add Item" },
        "TABLE": {
          "HEADER": { "NAME": "Name", "DATE": "Date" },
          "TOTALS": "{count} items"
        },
        "EMPTY": { "NO_ITEMS": "No items yet" },
        "NOT_FOUND": { "EMPTY": "No items found" }
      },
      "DETAILS": {
        "TITLE": "New Item",
        "TOOLBAR": { "SAVE": "Save", "DELETE": "Delete" },
        "FORM": {
          "INFO": {
            "NAME": "Name",
            "NAME_PLACEHOLDER": "Enter name"
          }
        }
      },
      "ALERTS": {
        "DELETE": "Are you sure you want to delete this item?",
        "CLOSE_CONFIRMATION": "You have unsaved changes. Close anyway?",
        "NOT_VALID": "Please fill all required fields."
      }
    }
  }
}
```

## Route Conventions

### Grid Routes
**Pattern:** `/{module-name}`  
**Example:** `/products`

### Details Routes
**Pattern:** `/{module-name}/:id?`  
**Example:** `/products/:id?`  
**Note:** `?` makes ID optional (for create mode)

## Permission Conventions

**Format:** `{resource}:{action}`

**Common Actions:**
- `read` - View resource
- `create` - Create new resource
- `update` - Edit existing resource
- `delete` - Delete resource

**Examples:**
- `product:read`
- `product:create`
- `vendor:update`
- `order:delete`

**Special:**
- `admin:*` - Admin all permissions
- `{module}:manage` - Full module access

## API Client Conventions

### Directory
`src/api_client/{module-name}/`

### Client Class
```typescript
export class {Entity}Client {
  async get(id: string): Promise<I{Entity}> {}
  async search(params: SearchParams): Promise<SearchResult<I{Entity}>> {}
  async create(item: I{Entity}): Promise<I{Entity}> {}
  async update(item: I{Entity}): Promise<I{Entity}> {}
  async delete(ids: string[]): Promise<void> {}
}
```

## Type Conventions

### Interfaces
**Format:** `I{Entity}`  
**Example:** `IProduct`, `IVendorProfile`

### Location
- API types: `src/api_client/{module}/types.ts`
- Module types: `src/modules/{module}/types.ts`

## Validation Rules

### Common Rules (vee-validate)
- `required` - Field is required
- `email` - Valid email format
- `url` - Valid URL format
- `min:<n>` - Minimum length
- `max:<n>` - Maximum length
- `numeric` - Numeric value only
- `alpha` - Alphabetic characters only
- `alphaNum` - Alphanumeric characters only

### Custom Validation
```typescript
import { defineRule } from 'vee-validate';

defineRule('custom', (value, params) => {
  // Validation logic
  return true || 'Error message';
});
```

## Toolbar Actions

### Standard Actions
- `refresh` - Reload data
- `add` - Add new item
- `edit` - Edit selected item
- `delete` - Delete selected item(s)
- `save` - Save changes
- `cancel` - Cancel operation

### Icon Convention
Use Material Symbols icons: `material-{name}`  
**Examples:** `material-refresh`, `material-add`, `material-delete`

## State Management

### Composable State
- Use `ref()` for reactive primitive values
- Use `reactive()` for complex objects
- Use `computed()` for derived values
- Watch for changes when needed

### Modification Tracking
```typescript
const originalItem = ref(null);
const isModified = computed(() => 
  JSON.stringify(item.value) !== JSON.stringify(originalItem.value)
);
```

## Error Handling

### Notifications
```typescript
import { notification } from '@vc-shell/framework';

// Success
notification.success(t('NOTIFICATIONS.SAVED'));

// Error
notification.error(t('NOTIFICATIONS.ERROR'));

// Warning
notification.warning(t('NOTIFICATIONS.WARNING'));
```

### Try-Catch Pattern
```typescript
try {
  loading.value = true;
  await apiCall();
  notification.success('Success');
} catch (error) {
  console.error('[Context]', error);
  notification.error('Error');
  throw error;
} finally {
  loading.value = false;
}
```

## Best Practices

1. **Always use composables** for data management
2. **Never hardcode strings** - use i18n
3. **Track modifications** in details blades
4. **Show loading states** during async operations
5. **Handle errors gracefully** with try-catch
6. **Add TODO comments** for API integration points
7. **Use TypeScript** for type safety
8. **Follow naming conventions** consistently
9. **Validate user input** before submission
10. **Test your blades** in both desktop and mobile views

