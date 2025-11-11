# Blade Naming Rules

## File Naming

### List Blade
```
File: vendors-list.vue          (plural-list.vue)
Component: VendorList           (Singular + List)
URL: /vendors                   (plural)
```

### Details Blade
```
File: vendor-details.vue        (singular-details.vue)
Component: VendorDetails        (Singular + Details)
URL: /vendor                    (singular, NO :id)
```

## Examples

| Entity | List File | Details File | List Component | Details Component |
|--------|-----------|--------------|----------------|-------------------|
| vendors | vendors-list.vue | vendor-details.vue | VendorList | VendorDetails |
| orders | orders-list.vue | order-details.vue | OrderList | OrderDetails |
| products | products-list.vue | product-details.vue | ProductList | ProductDetails |
| categories | categories-list.vue | category-details.vue | CategoryList | CategoryDetails |

## Imports

**In list blade:**
```typescript
// ✅ CORRECT
import VendorDetails from "./vendor-details.vue";  // Singular file name
import { VendorList } from "../pages";

// ❌ WRONG
import VendorsDetails from "./vendors-details.vue";  // Plural
```

**In pages/index.ts:**
```typescript
export { default as VendorList } from "./vendors-list.vue";
export { default as VendorDetails } from "./vendor-details.vue";
```

## defineOptions

### List Blade
```typescript
defineOptions({
  name: "VendorList",      // ✅ Singular + List
  url: "/vendors",         // ✅ Plural
  isWorkspace: true,       // ✅ Required!
  menuItem: {              // ✅ Required!
    title: "VENDORS.MENU.TITLE",
    icon: "material-people",
    priority: 1,
  },
});
```

### Details Blade
```typescript
defineOptions({
  name: "VendorDetails",  // ✅ Singular + Details
  url: "/vendor",         // ✅ Singular, no :id
  // isWorkspace: false (default, omit)
  // NO menuItem
});
```

## URL Rules

### List Blade URL
- Format: `/{plural}` 
- Examples: `/vendors`, `/orders`, `/products`
- Accessible via menu (isWorkspace: true)

### Details Blade URL
- Format: `/{singular}`
- Examples: `/vendor`, `/order`, `/product`
- NO `:id` or `:id?` in URL!
- NOT in menu (isWorkspace: false)

### ID Passing

ID passed via `openBlade`, NOT URL:

```typescript
// In list blade
openBlade({
  blade: markRaw(VendorDetails),
  param: vendor.id,  // ← ID here, NOT in URL
});

// Details blade receives
props.param  // The vendor ID
```

## Composable Naming

```typescript
// List composable
useVendorList()   // Singular + List

// Details composable  
useVendorDetails() // Singular + Details
```

## Type Naming

```typescript
// Entity type
interface Vendor { ... }       // Singular
type VendorList = Vendor[];    // Plural

// Not: interface Vendors
```

## Common Mistakes

❌ **Wrong:** `vendors-details.vue` (plural in details)
✅ **Correct:** `vendor-details.vue` (singular in details)

❌ **Wrong:** `import VendorsDetails`
✅ **Correct:** `import VendorDetails`

❌ **Wrong:** `url: "/vendors/:id?"`
✅ **Correct:** `url: "/vendor"` (no :id)

❌ **Wrong:** Details blade with `menuItem`
✅ **Correct:** Details blade WITHOUT `menuItem`

❌ **Wrong:** List blade with `isWorkspace: false`
✅ **Correct:** List blade with `isWorkspace: true`

