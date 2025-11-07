# Blade Patterns

Complete reference for List and Details blade patterns in VC-Shell.

## List Blade Pattern

### Structure
List blades display data in a table format using `VcTable` component.

### Required Props
Always include these 4 props:
```typescript
interface BladeProps {
  expanded?: boolean;    // Expansion state
  closable?: boolean;   // Can be closed
  param?: string;       // Entity ID (usually undefined for list)
  options?: unknown;    // Additional data
}
```

### Basic Template
```vue
<template>
  <VcBlade 
    :expanded="true" 
    :closable="true" 
    :param="undefined" 
    :options="undefined"
    :title="$t('module.list.title')"
  >
    <VcTable 
      :items="items" 
      :columns="columns" 
      :loading="loading"
      :total-count="totalCount"
      :pages="pages"
      :current-page="currentPage"
      @item-click="handleItemClick"
      @page-changed="handlePageChange"
    />
  </VcBlade>
</template>

<script lang="ts" setup>
import { useAsync } from '@vc-shell/framework';
import { useBladeNavigation } from '@vc-shell/framework';
import { useListComposable } from '../composables';

const props = defineProps<{
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: unknown;
}>();

const { openBlade } = useBladeNavigation();
const { items, columns, loading, totalCount, pages, currentPage, loadItems } = useListComposable();

const { action: loadData } = useAsync(async () => {
  await loadItems();
});

loadData();

function handleItemClick(item: any) {
  openBlade({
    blade: DetailsComponent,
    param: item.id
  });
}

function handlePageChange(page: number) {
  loadItems({ page });
}
</script>
```

### Key Components
- **VcBlade**: Container with toolbar and actions
- **VcTable**: Data table with sorting, pagination, selection

### Toolbar Configuration
```typescript
const toolbarItems: IBladeToolbar[] = [
  {
    id: 'add',
    title: 'Add New',
    icon: 'add',
    onClick: () => openBlade({ blade: DetailsComponent })
  },
  {
    id: 'refresh',
    title: 'Refresh',
    icon: 'refresh',
    onClick: () => loadData()
  }
];
```

### Table Columns
```typescript
const columns: ITableColumn[] = [
  {
    id: 'name',
    title: 'Name',
    field: 'name',
    sortable: true,
    width: 200
  },
  {
    id: 'status',
    title: 'Status',
    field: 'status',
    type: 'badge',
    sortable: true
  }
];
```

## Details Blade Pattern

### Structure
Details blades display forms using `VcForm` and `VeeValidate` for validation.

### Required Props
Always include these 4 props:
```typescript
interface BladeProps {
  expanded?: boolean;    // Expansion state
  closable?: boolean;   // Can be closed
  param?: string;       // Entity ID (required for details)
  options?: unknown;    // Additional data
}
```

### Basic Template
```vue
<template>
  <VcBlade 
    :expanded="true" 
    :closable="true" 
    :param="param" 
    :options="options"
    :title="$t('module.details.title')"
    :modified="isModified"
    :toolbar-items="toolbarItems"
  >
    <VcForm @submit="handleSubmit">
      <Field 
        name="name" 
        v-slot="{ errors, errorMessage, handleChange }" 
        :rules="{ required: true }"
      >
        <VcInput 
          :model-value="data.name" 
          :error-message="errorMessage"
          :error="!!errors.length"
          @update:model-value="(v) => { data.name = v; handleChange(v); }"
        />
      </Field>
      
      <Field 
        name="email" 
        v-slot="{ errors, errorMessage, handleChange }" 
        :rules="{ required: true, email: true }"
      >
        <VcInput 
          :model-value="data.email" 
          type="email"
          :error-message="errorMessage"
          :error="!!errors.length"
          @update:model-value="(v) => { data.email = v; handleChange(v); }"
        />
      </Field>
    </VcForm>
  </VcBlade>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Field, useForm } from 'vee-validate';
import { useAsync } from '@vc-shell/framework';
import { useModificationTracker } from '@vc-shell/framework';
import { useDetailsComposable } from '../composables';

const props = defineProps<{
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: unknown;
}>();

const item = ref({
  name: '',
  email: ''
});

const { isModified, currentValue, resetModificationState } = useModificationTracker(item);
const { loadItem, saveItem } = useDetailsComposable();

const { handleSubmit } = useForm();

const { action: loadData } = useAsync(async () => {
  if (props.param) {
    const data = await loadItem(props.param);
    currentValue.value = data; // Assign to currentValue
    resetModificationState();
  }
});

watch(() => props.param, () => {
  if (props.param) {
    loadData();
  }
}, { immediate: true });

const toolbarItems = [
  {
    id: 'save',
    title: 'Save',
    icon: 'save',
    onClick: () => handleSubmit(onSubmit)()
  }
];

async function onSubmit() {
  await saveItem(currentValue.value); // Use currentValue
  resetModificationState();
}
</script>
```

### Form Validation Pattern
Always use VeeValidate `Field` component with:
- `v-slot="{ errors, errorMessage, handleChange }"`
- `:rules` prop for validation rules
- `handleChange` for tracking changes
- `errorMessage` and `error` props on inputs

### Modification Tracking
```typescript
const item = ref({ /* form data */ });
const { isModified, currentValue, resetModificationState } = useModificationTracker(item);

// Load data
currentValue.value = await loadItem(id);

// After successful save
await saveItem(currentValue.value);
resetModificationState();

// Pass to blade for modified indicator
:modified="isModified"
```

## Navigation Patterns

### Opening Blades
```typescript
const { openBlade } = useBladeNavigation();

// Open details blade
openBlade({
  blade: DetailsComponent,
  param: itemId
});

// Open with options
openBlade({
  blade: DetailsComponent,
  param: itemId,
  options: { mode: 'edit' }
});
```

### Closing Blades
```typescript
const emit = defineEmits<{
  'close:blade': [];
}>();

// Close current blade
emit('close:blade');

// Or use composable
const { closeBlade } = useBladeNavigation();
closeBlade();
```

### Parent Communication
```typescript
const emit = defineEmits<{
  'parent:call': [method: string, ...args: any[]];
}>();

// Call parent method
emit('parent:call', 'refreshList');
```

## State Management

### Loading States
```typescript
const { action, loading, error } = useAsync(async () => {
  return await apiCall();
});

// Use loading in template
:loading="loading"
```

### Error Handling
```typescript
const { action, loading, error } = useAsync(async () => {
  try {
    return await apiCall();
  } catch (err) {
    notification.error('Failed to load data');
    throw err;
  }
});
```

### Data Refresh
```typescript
// Refresh list after save
emit('parent:call', 'refresh');

// Or reload directly
loadData();
```

## Best Practices

1. **Always use 4 required props** on VcBlade
2. **Use VeeValidate Field** for all form inputs
3. **Track modifications** with useModificationTracker
4. **Handle loading states** with useAsync
5. **Use proper TypeScript types** for props and data
6. **Implement error handling** for all API calls
7. **Use localization** for all user-facing text
8. **Follow naming conventions** (Vc prefix, use prefix)
9. **Keep composables focused** on single responsibility
10. **Test navigation flows** between blades

## Common Patterns

### Conditional Field Display
```vue
<Field 
  v-if="data.type === 'physical'"
  name="weight"
  v-slot="{ errors, errorMessage, handleChange }"
>
  <!-- field content -->
</Field>
```

### Dynamic Columns
```typescript
const columns = computed(() => {
  const baseColumns = [...];
  if (showExtraColumns.value) {
    baseColumns.push(...extraColumns);
  }
  return baseColumns;
});
```

### Toolbar Actions
```typescript
const toolbarItems = computed(() => {
  const items: IBladeToolbar[] = [
    { id: 'save', title: 'Save', icon: 'save', onClick: handleSave }
  ];
  
  if (props.param) {
    items.push({ id: 'delete', title: 'Delete', icon: 'delete', onClick: handleDelete });
  }
  
  return items;
});
```

