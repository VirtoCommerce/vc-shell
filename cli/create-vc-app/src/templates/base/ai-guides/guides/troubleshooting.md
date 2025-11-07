# Troubleshooting Guide

Solutions for common issues encountered during VC Shell development.

## Quick Diagnosis

**Before diving into specific issues:**

1. **Clear browser cache:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Restart dev server:** `Ctrl+C`, then `yarn serve`
3. **Check console:** `F12` → Console tab for errors
4. **Check Network tab:** Verify API calls succeed

---

## Module Issues

### Module Not Appearing in Navigation

**Symptom:** Generated module doesn't show in menu

**Possible Causes:**

**1. Module Not Registered**

**Check `src/main.ts`:**
```typescript
// Should have import
import ProductsModule from "./modules/products";

// Should have .use() BEFORE .use(router)
app.use(ProductsModule, { router });
app.use(router);
```

**Fix:**
```typescript
// Add manually if missing
import YourModule from "./modules/your-module";

app
  .use(VirtoShellFramework, { ... })
  .use(YourModule, { router })  // Add here
  .use(router);
```

**2. Module Export Issue**

**Check `src/modules/your-module/index.ts`:**
```typescript
// Should use createAppModule
import { createAppModule } from "@vc-shell/framework";
import * as pages from "./pages";
import * as locales from "./locales";

export default createAppModule(pages, locales);

```

**3. Pages Not Exported**

**Check `src/modules/your-module/pages/index.ts`:**
```typescript
// Must export all blade files
export { default as ProductsList } from "./products.vue";
export { default as ProductDetails } from "./product-details.vue";

// Make sure .vue extension is included
```

**4. Server Not Restarted**

**Solution:**
```bash
# Stop server (Ctrl+C)
# Start again
yarn serve
```

---

### Module Shows But Blade Doesn't Open

**Symptom:** Click menu item, nothing happens

**Check Browser Console:**

**Error: "Component not found"**
```
Fix: Check blade export in pages/index.ts
```

**Error: "Missing required prop"**
```
Fix: Add all 4 required blade props
```

**Solution: Verify Blade Props**
```vue
<template>
  <VcBlade
    :expanded="true"
    :closable="true"
    :param="undefined"
    :options="undefined"
    :title="$t('MODULE.PAGE.TITLE')"
  >
    <!-- content -->
  </VcBlade>
</template>

<script setup lang="ts">
const props = defineProps<{
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: unknown;
}>();
</script>
```

---

### Blade Opens But Shows Blank

**Symptom:** Blade opens but content is empty/white

**Possible Causes:**

**1. Template Error**

**Check Console:**
```
[Vue warn] Error in render
```

**Fix:** Check your template for syntax errors

**2. Data Not Loading**

**Check Network Tab:**
- Is API call made?
- Does it succeed (200)?
- Is response correct?

**Fix:**
```typescript
// Add console logs
const { action: load, loading, items } = useAsync(async () => {
  console.log('Loading data...');
  const response = await api.getItems();
  console.log('Response:', response);
  return response.data;
});

// Check items are assigned
console.log('Items:', items.value);
```

**3. Conditional Rendering**

**Check for v-if that's always false:**
```vue
<!-- BAD -->
<VcTable v-if="false" ... />

<!-- BAD -->
<VcTable v-if="items.length" ... />
<!-- Won't show while loading -->

<!-- GOOD -->
<VcTable v-if="!loading || items.length" ... />
```

---

## Build and Compilation Issues

### TypeScript Errors

**Error: "Property 'x' does not exist on type 'y'"**

**Solution 1: Add proper types**
```typescript
// BAD
const item = ref<any>({});

// GOOD
interface Product {
  id: string;
  name: string;
  price: number;
}

const item = ref<Product>({
  id: '',
  name: '',
  price: 0
});
```

**Solution 2: Optional chaining**
```typescript
// Instead of
item.value.name

// Use
item.value?.name
```

**Solution 3: Type assertion (last resort)**
```typescript
(item as Product).name
```

---

### Linter Errors

**Error: "'x' is defined but never used"**

**Solution:**
```typescript
// Remove unused imports/variables
// Or prefix with underscore
const _unused = something;
```

**Error: "Missing semicolon"**

**Solution:**
```bash
# Auto-fix most issues
yarn lint --fix
```

---

### Data Not Displaying

**Symptom:** API call succeeds but data doesn't show

**Diagnosis:**

**1. Check Response Structure**
```typescript
// Log the response
const response = await api.getProducts();
console.log('Response structure:', response);

// Maybe it's nested?
// response.data.results instead of response.results?
```

**2. Check Data Assignment**
```typescript
// Make sure you're returning the right part
return {
  results: response.data.results,  // Correct path
  totalCount: response.data.total
};
```

**3. Check Template Binding**
```vue
<!-- Verify the prop name matches -->
<VcTable :items="items" ... />

<!-- Check items has data -->
<div>Items count: {{ items?.length }}</div>
```

---

## UI and Styling Issues

### Styles Not Applied

**Symptom:** Component looks unstyled or broken

**Possible Causes:**

**1. Missing Tailwind Prefix**
```vue
<!-- BAD -->
<div class="p-4 bg-primary">

<!-- GOOD -->
<div class="tw-p-4 tw-bg-[var(--primary-500)]">
```

**2. CSS Variables Not Defined**
```scss
// Use framework variables
color: var(--primary-500);
background: var(--background-primary);

// Not custom ones that don't exist
color: var(--my-custom-color); // ❌
```

**3. Scoped Styles Conflict**
```vue
<!-- Scoped styles don't affect child components -->
<style scoped>
.child-component { /* Won't work */ }
</style>

<!-- Use ::v-deep or :deep() -->
<style scoped>
:deep(.child-component) { /* Works */ }
</style>
```

---

### Icons Not Showing

**Symptom:** Icon space is blank

**Possible Causes:**

**1. Wrong Icon Name**
```vue
<!-- Check icon exists -->
<VcIcon icon="fas fa-user" />  <!-- Font Awesome -->
<VcIcon icon="material-home" />  <!-- Material -->
<VcIcon icon="bi-cart" />  <!-- Bootstrap Icons -->
```

**2. Icon Library Not Loaded**
```typescript
// Check main.ts imports CSS
import "@vc-shell/framework/dist/index.css";
```

---

## Form and Validation Issues

### Validation Not Working

**Symptom:** Form submits even with invalid data

**Fix: Use Field Component**
```vue
<Field 
  name="email" 
  v-slot="{ errors, errorMessage, handleChange }"
  :rules="{ required: true, email: true }"
>
  <VcInput
    :model-value="item.email"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="(v) => { 
      item.email = v; 
      handleChange(v); 
    }"
  />
</Field>
```

---

### Form Not Saving

**Symptom:** Click save, nothing happens

**Diagnosis:**

**1. Check Save Function**
```typescript
const saveChanges = async () => {
  console.log('Save called');
  console.log('Item:', item.value);
  
  try {
    await api.save(item.value);
    console.log('Save successful');
    notification.success('Saved!');
  } catch (error) {
    console.error('Save failed:', error);
    notification.error('Save failed');
  }
};
```

**2. Check Button Binding**
```vue
<!-- Make sure button calls function -->
<VcButton @click="saveChanges">Save</VcButton>

<!-- Not just -->
<VcButton>Save</VcButton>
```

---

### Modification Tracker Not Working

**Symptom:** Blade always shows as modified

**Fix:**
```typescript
// Make sure to use modification tracker correctly
const item = ref({ /* initial data */ });
const { isModified, currentValue, resetModificationState } = useModificationTracker(item);

// Load data - assign to currentValue
const loadData = async (id: string) => {
  const data = await api.get(id);
  currentValue.value = data; // Use currentValue, not item
};

// Reset after save
const saveChanges = async () => {
  await api.save(currentValue.value); // Use currentValue
  resetModificationState(); // Reset after successful save
};
```

---

### Memory Leaks

**Symptom:** Application slows down over time

**Fix: Clean Up Listeners**
```typescript
import { onBeforeUnmount } from 'vue';

// Register listener
const handleEvent = () => { ... };
window.addEventListener('resize', handleEvent);

// Clean up
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleEvent);
});
```

**Fix: Unregister Widgets**
```typescript
import { useWidgets, onBeforeUnmount } from '@vc-shell/framework';

const { registerWidget, unregisterWidget } = useWidgets();

registerWidget({ id: 'myWidget', ... });

onBeforeUnmount(() => {
  unregisterWidget('myWidget');
});
```

---

## CLI Generator Issues

### Generator Fails

**Error:** `Module "xyz" not found`

**When:** Generating blade for non-existent module

**Solution:** 
In non-interactive mode, CLI automatically creates the module. Make sure you're in project directory.

---

### Form Fields Not Generated

**Error:** Invalid JSON

**Solution:** Check JSON syntax
```bash
# GOOD
--form-fields '[{"name":"title","type":"VcInput","props":"{\"required\":true}"}]'

# BAD
--form-fields '[{"name":"title","type":"VcInput","props":"{"required":true}"}]'
#                                                           ↑ not escaped
```

---

### Widget Not Registered

**Symptom:** Widget generated but doesn't show

**Check:** Blade should have:
```typescript
import { useWidgets, onBeforeUnmount } from '@vc-shell/framework';
import MyWidget from '../components/widgets/my-widget/my-widget-widget.vue';

const { registerWidget, unregisterWidget } = useWidgets();

registerWidget({
  id: 'myWidget',
  component: MyWidget
});

onBeforeUnmount(() => {
  unregisterWidget('myWidget');
});
```

---

## Still Having Issues?

1. **Search Documentation:** [VC Shell Docs](https://docs.virtocommerce.org/)
2. **Check GitHub Issues:** [VC Shell Repository](https://github.com/VirtoCommerce/vc-shell) 

---

## Prevention Tips

**To avoid common issues:**

1. **Always use TypeScript properly** - don't use `any`
2. **Handle errors** - wrap API calls in try-catch
3. **Test frequently** - don't write too much before testing
4. **Use browser DevTools** - check console and network
5. **Read error messages** - they usually explain the issue
6. **Keep dependencies updated** - `yarn upgrade`
7. **Follow framework conventions** - use provided patterns
8. **Clear cache regularly** - avoid stale data issues

