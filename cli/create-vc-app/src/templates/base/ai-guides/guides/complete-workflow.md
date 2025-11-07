# Complete Development Workflow

End-to-end guide for creating a VC Shell application from scratch to deployment.

## Overview

This guide walks you through the complete process:
1. Create application
2. Generate modules
3. Connect API
4. Test functionality
5. Customize and extend
6. Build for production
7. Deploy

---

## Phase 1: Project Creation (5 minutes)

### Step 1.1: Create New Application

**Command:**
```bash
npx create-vc-app my-shop
```

**Interactive Prompts:**
```
✔ Project name: … my-shop
✔ Base path: … /apps/my-shop/

📦 Scaffolding app...
✅ Created 60 files

🏗️  Creating module...
✔ Module name: … products
✔ Entity name: … Product
✔ Create both blades: … yes
✔ Workspace blade: › Grid blade
✔ Customize form: … yes
```

**What You Get:**
```
my-shop/
├── src/
│   ├── main.ts
│   ├── router/
│   ├── locales/
│   ├── modules/
│   │   └── products/     ← Your first module
│   ├── pages/
│   ├── styles/
│   └── api_client/       ← Placeholder for API
├── package.json
├── vite.config.mts
├── .prettierrc
├── .eslintrc.js
└── ai-guides/            ← This documentation
```

### Step 1.2: Install Dependencies

```bash
cd my-shop
yarn install
```

**Time:** ~2 minutes (depending on internet speed)

### Step 1.3: Verify Installation

```bash
yarn serve
```

**Expected Output:**
```
VITE v6.x.x  ready in 1234 ms

➜  Local:   http://localhost:8080/apps/my-shop/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Open Browser:**
```
http://localhost:8080/apps/my-shop/
```

**You Should See:**
- Login screen or dashboard
- Products module in navigation menu
- Products list blade (empty, no data yet)

✅ **Phase 1 Complete!** You have a working application.

---

## Phase 2: Module Generation (10 minutes)

### Step 2.1: Add More Modules

**Generate Orders Module:**
```bash
npx create-vc-app blade
```

**Prompts:**
```
? What would you like to generate? › Module (with blades)
? Module name: › orders
? Entity name: › Order
? Create both blades: › yes
? Workspace blade: › Grid blade
? Customize form: › yes

Add form fields:
? Field name: › orderNumber
? Field type: › Text
? Is required: › yes

? Field name: › customer
? Field type: › Text
? Is required: › yes

? Field name: › total
? Field type: › Currency
? Is required: › yes

? Field name: › status
? Field type: › Select (Dropdown)
? Options: › pending,processing,shipped,delivered
? Is required: › yes

? Field name: › (press Enter to finish)
```

**Result:**
```
✅ Module generated successfully!

Created:
- src/modules/orders/
- Module registered in main.ts
```

### Step 2.2: Add Categories Module

**Non-Interactive Mode (faster):**
```bash
npx create-vc-app blade \
  --module categories \
  --type grid \
  --name categories \
  --composable \
  --locales \
  --is-workspace

npx create-vc-app blade \
  --module categories \
  --type details \
  --name category-details \
  --composable \
  --locales \
  --form-fields '[
    {"name":"name","label":"Category Name","type":"VcInput","props":"{\"required\":true}"},
    {"name":"description","label":"Description","type":"VcEditor","props":"{}"},
    {"name":"active","label":"Active","type":"VcSwitch","props":"{}"}
  ]'
```

### Step 2.3: Verify Modules

**Restart dev server** (Ctrl+C, then `yarn serve`)

**Check in Browser:**
```
http://localhost:8080/apps/my-shop/
```

**You Should See:**
- Three modules in menu: Products, Orders, Categories
- Each module opens its list blade
- Clicking table rows opens details blade

✅ **Phase 2 Complete!** You have multiple modules.

---

## Phase 3: API Integration (15 minutes)

### Step 3.1: Choose API Integration Method

**Option A: VirtoCommerce Platform**

If you have VirtoCommerce Platform:

1. **Create `.env.local`:**
```env
APP_PLATFORM_URL=https://your-platform.com
APP_PLATFORM_MODULES=[Virtocommerce.Catalog, Virtocommerce.Orders]
```

2. **Generate API Client:**
```bash
yarn generate-api-client
```

3. **Update Composables:**
```typescript
// src/modules/products/composables/useProductsList.ts
import { useApiClient } from '@vc-shell/framework';
import { Catalog } from '../../../api_client/virtocommerce.catalog';

const { getApiClient } = useApiClient(Catalog);

const { action: loadProducts, loading, items } = useAsync(async () => {
  const client = await getApiClient();
  const response = await client.searchProducts({
    skip: (currentPage.value - 1) * pageSize.value,
    take: pageSize.value
  });
  
  return {
    results: response.data.results || [],
    totalCount: response.data.totalCount || 0
  };
});
```

**Option B: Custom REST API**

If you have custom REST API:

1. **Create `.env.local`:**
```env
VITE_API_URL=https://api.myshop.com
```

2. **Create API Client:**
```typescript
// src/api_client/custom-api.ts
const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  products: {
    async list(params: { skip: number; take: number; search?: string }) {
      const query = new URLSearchParams({
        skip: params.skip.toString(),
        take: params.take.toString(),
        ...(params.search && { search: params.search })
      });

      const response = await fetch(`${API_URL}/products?${query}`);
      return response.json();
    },

    async get(id: string) {
      const response = await fetch(`${API_URL}/products/${id}`);
      return response.json();
    },

    async create(product: any) {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      return response.json();
    },

    async update(id: string, product: any) {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      return response.json();
    },

    async delete(id: string) {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    }
  }
};
```

3. **Update Composables:**
```typescript
// src/modules/products/composables/useProductsList.ts
import { api } from '../../../api_client/custom-api';

const { action: loadProducts, loading, items } = useAsync(async () => {
  const response = await api.products.list({
    skip: (currentPage.value - 1) * pageSize.value,
    take: pageSize.value,
    search: searchQuery.value
  });
  
  return {
    results: response.data || [],
    totalCount: response.total || 0
  };
});
```

**Option C: Mock Data (for development)**

Keep using generated placeholders:
```typescript
// src/modules/products/composables/useProductsList.ts
const { action: loadProducts, loading, items } = useAsync(async () => {
  // Mock data for development
  return {
    results: [
      { id: '1', name: 'Product 1', price: 100 },
      { id: '2', name: 'Product 2', price: 200 },
      { id: '3', name: 'Product 3', price: 300 }
    ],
    totalCount: 3
  };
});
```

### Step 3.2: Test API Integration

1. **Restart Server:**
```bash
# Ctrl+C, then
yarn serve
```

2. **Open Application:**
```
http://localhost:8080/apps/my-shop/
```

3. **Test Operations:**
   - ✅ List loads with data
   - ✅ Clicking item opens details
   - ✅ Saving works (create/update)
   - ✅ Delete works
   - ✅ Search works
   - ✅ Pagination works

4. **Check Console:**
   - No errors in browser console
   - API calls show in Network tab
   - Responses are correct

✅ **Phase 3 Complete!** Your modules are connected to API.

---

## Phase 4: Testing & Validation (10 minutes)

### Step 4.1: Manual Testing Checklist

**For Each Module:**

**List Blade (Grid):**
- [ ] Table displays data
- [ ] Columns are correct
- [ ] Search works
- [ ] Filters work
- [ ] Pagination works
- [ ] Sorting works
- [ ] Clicking row opens details
- [ ] Toolbar buttons work (Add, Refresh, Delete)
- [ ] Empty state shows when no data
- [ ] Loading state shows during API call

**Details Blade (Form):**
- [ ] Form loads with data (edit mode)
- [ ] Form is empty (create mode)
- [ ] All fields display correctly
- [ ] Required validation works
- [ ] Save button works
- [ ] Cancel button closes blade
- [ ] Delete button works (with confirmation)
- [ ] Modified indicator shows when changed
- [ ] Unsaved changes warning works
- [ ] Success notification on save
- [ ] Error notification on failure

### Step 4.2: Browser DevTools Checks

**Console Tab:**
```
✅ No errors
✅ No warnings (except TODO comments)
```

**Network Tab:**
```
✅ API calls succeed (status 200)
✅ Response data is correct
✅ Request payloads are correct
```

**Vue DevTools:**
```
✅ Component tree looks correct
✅ Props are passed correctly
✅ Events are emitted
✅ State updates properly
```

### Step 4.3: Run Linter

```bash
yarn lint
```

**Fix any issues:**
```bash
yarn lint --fix
```

### Step 4.4: Type Check

```bash
yarn type-check
```

**Fix TypeScript errors** if any.

✅ **Phase 4 Complete!** Application is tested and validated.

---

## Phase 5: Customization & Extension (variable time)

### Step 5.1: Customize Themes and Colors

**Add or Modify Color Palette:**

VC Shell uses a theme system based on CSS custom properties. You can customize colors by modifying existing themes or creating new ones.

**Option 1: Override Existing Theme Colors**

Modify the default `light` theme in your `src/styles/custom.scss`:

```scss
// src/styles/custom.scss

/* Override specific variables for the 'light' theme */
:root[data-theme="light"] {
  --primary-500: #D946EF; /* Change primary color to Fuchsia */
  --success-500: #10B981; /* Change success color */
  /* Override any other variables as needed */
}
```

**Option 2: Create a New Theme Variation**

1. **Register the theme in your app:**
```typescript
// src/main.ts or App.vue
import { useTheme, type ThemeDefinition } from '@vc-shell/framework';

const { register } = useTheme();

const customTheme: ThemeDefinition = {
  key: 'light-customized',
  localizationKey: 'THEMES.LIGHT_CUSTOMIZED'
};

register(customTheme);
```

2. **Define CSS variables for the new theme:**
```scss
// src/styles/custom.scss

/* Copy all variables from light theme, then override specific ones */
:root[data-theme="light-customized"] {
  /* Copy all variables from :root[data-theme="light"] */
  --primary-50: #EFF7FC;
  --primary-100: #DAEDF7;
  /* ... all other variables ... */
  
  /* Then override only what you want to change */
  --primary-500: #FF6347; /* Tomato Red */
  --accent-500: #4ECDC4; /* Teal */
}
```

**Option 3: Create a Completely New Theme**

1. **Register the theme:**
```typescript
const oceanTheme: ThemeDefinition = {
  key: 'ocean-wave',
  localizationKey: 'THEMES.OCEAN_WAVE'
};

register(oceanTheme);
```

2. **Define all CSS variables:**
```scss
:root[data-theme="ocean-wave"] {
  --primary-50: #E0F7FA;  /* Light cyan */
  --primary-500: #0077B6;  /* Main blue */
  --primary-950: #023047; /* Dark blue */
  
  /* Define all other necessary variables:
     --secondary-..., --accent-..., --neutrals-...,
     --warning-..., --danger-..., --success-..., --info-...
  */
}
```

**Reference:**
- See [Managing Themes with useTheme](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/Usage-Guides/managing-themes-with-usetheme) for complete guide
- Default color palette is available in framework's `colors.scss`
- Use CSS custom properties (variables) for all theming

### Step 5.2: Add Widgets

**Generate Widget:**
```bash
npx create-vc-app blade --widget
```

**Prompts:**
```
? Select module: › products
? Select blade: › product-details
? Widget name: › product-stats
```

**Widget Structure:**

Widgets use only the `VcWidget` component with its props. No custom content inside:

```vue
<!-- src/modules/products/components/widgets/product-stats/product-stats-widget.vue -->
<template>
  <VcWidget
    :value="count"
    :title="$t('PRODUCTS.WIDGETS.PRODUCT_STATS.TITLE')"
    icon="material-shoppingmode"
    @click="clickHandler"
  >
  </VcWidget>
</template>

<script setup lang="ts">
import { VcWidget, useBladeNavigation } from "@vc-shell/framework";
import { ref } from "vue";

const props = defineProps<{
  item: any; // Your entity type
}>();

const { openBlade, resolveBladeByName } = useBladeNavigation();
const widgetOpened = ref(false);
const count = ref(0);

function clickHandler() {
  if (!widgetOpened.value) {
    openBlade({
      blade: resolveBladeByName("ProductStatsList"),
      options: {
        productId: props.item?.id,
      },
      onOpen() {
        widgetOpened.value = true;
      },
      onClose() {
        widgetOpened.value = false;
      },
    });
  }
}

// Load count data
// ... your data loading logic
</script>
```

**Important:** Widgets only use `VcWidget` component props (`value`, `title`, `icon`, `loading`, etc.). Do not add custom HTML content inside `VcWidget`.

### Step 5.3: Add Validation Rules

**Custom Validators:**
```typescript
// src/modules/products/composables/useProductDetails.ts
import { useForm } from 'vee-validate';

const validationSchema = {
  name: { required: true, min: 3, max: 100 },
  sku: { required: true, regex: /^[A-Z0-9-]+$/ },
  price: { required: true, min_value: 0 },
  email: { required: true, email: true }
};

const { validate, errors } = useForm({ validationSchema });
```

### Step 5.4: Add Business Logic

**Example: Auto-calculate totals**
```typescript
// src/modules/orders/composables/useOrderDetails.ts
const subtotal = computed(() => {
  return item.value.items?.reduce((sum, i) => 
    sum + (i.quantity * i.price), 0
  ) || 0;
});

const tax = computed(() => subtotal.value * 0.1); // 10% tax

const total = computed(() => 
  subtotal.value + tax.value + (item.value.shipping || 0)
);

// Update item when totals change
watch([subtotal, tax], () => {
  item.value.subtotal = subtotal.value;
  item.value.tax = tax.value;
  item.value.total = total.value;
});
```

### Step 5.5: Add Permissions

**Restrict Access:**
```typescript
// src/modules/products/pages/products.vue
import { usePermissions } from '@vc-shell/framework';

const { checkPermission } = usePermissions();
const canEdit = checkPermission('products:edit');
const canDelete = checkPermission('products:delete');

const toolbarItems = computed(() => [
  {
    id: 'add',
    title: 'Add Product',
    icon: 'plus',
    onClick: handleAdd,
    disabled: !canEdit.value
  },
  {
    id: 'delete',
    title: 'Delete',
    icon: 'delete',
    onClick: handleDelete,
    disabled: !canDelete.value || !selectedItems.value.length
  }
]);
```

✅ **Phase 5 Complete!** Application is customized.

---

## Phase 6: Build for Production (5 minutes)

### Step 6.1: Update Environment

**Create `.env.production`:**
```env
VITE_API_URL=https://api.production.com
APP_PLATFORM_URL=https://platform.production.com
APP_BASE_PATH=/apps/my-shop/
```

### Step 6.2: Build Application

```bash
yarn build
```

**Expected Output:**
```
vite v6.x.x building for production...
✓ 1234 modules transformed.
dist/index.html                   1.23 kB
dist/assets/index-abc123.js     234.56 kB │ gzip: 78.90 kB
dist/assets/index-def456.css     12.34 kB │ gzip: 5.67 kB
✓ built in 12.34s
```

### Step 6.3: Test Production Build

```bash
yarn preview
```

**Or use a simple HTTP server:**
```bash
npx serve dist
```

**Open:**
```
http://localhost:4173/apps/my-shop/
```

**Verify:**
- [ ] Application loads
- [ ] Modules work
- [ ] API calls work
- [ ] No console errors

✅ **Phase 6 Complete!** Production build is ready.

---

## Troubleshooting

### Issue: Module Not Showing

**Problem:** Generated module doesn't appear in navigation

**Solution:**
1. Check `src/main.ts` - module must be registered
2. Restart dev server
3. Clear browser cache

### Issue: API Calls Fail

**Problem:** CORS errors or 404s

**Solution:**
1. Check API URL in `.env.local`
2. Verify API endpoint exists
3. Check CORS configuration on backend
4. Use Vite proxy for development (see `vite.config.mts`)

### Issue: Build Fails

**Problem:** TypeScript or build errors

**Solution:**
1. Run `yarn type-check` to see all errors
2. Fix TypeScript errors
3. Replace `@ts-expect-error` with proper types
4. Run `yarn lint --fix`

---

## Next Steps

- [Blade Patterns](./blade-patterns.md) - Blade development patterns
- [Troubleshooting Guide](./troubleshooting.md) - Common issues
- [API Integration Guide](../prompts/api-client-generation.md) - Advanced API patterns
- [CLI Usage](../prompts/cli-usage.md) - All CLI commands

---

## Success Checklist

**Development:**
- [ ] Application created and running
- [ ] Modules generated
- [ ] API connected
- [ ] Manual testing complete
- [ ] Customizations added
- [ ] No linter errors
- [ ] No TypeScript errors

**Production:**
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Application deployed
- [ ] Production testing complete
- [ ] Monitoring configured
- [ ] Backup strategy in place

**Documentation:**
- [ ] README updated
- [ ] API endpoints documented
- [ ] Deployment instructions written
- [ ] Known issues documented

