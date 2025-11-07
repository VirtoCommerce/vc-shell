# Composables Reference

Quick reference for all core composables in VC-Shell framework.

## useAsync

### Purpose
Handles async operations with loading states and error handling.

### API
```typescript
const { action, loading, error } = useAsync(async () => {
  return await someAsyncOperation();
});
```

### Properties
- `action`: Function to execute the async operation
- `loading`: Ref<boolean> - Loading state
- `error`: Ref<Error | null> - Error state

### Example
```typescript
const { action: loadData, loading, error } = useAsync(async () => {
  const response = await apiClient.getItems();
  items.value = response.data;
  return response;
});

// Execute
loadData();

// Use in template
:loading="loading"
```

### Pattern
- Always wrap API calls in useAsync
- Use loading state for UI feedback
- Handle errors appropriately
- Return data from async function

## useBladeNavigation

### Purpose
Manages blade navigation - opening, closing, and communication.

### API
```typescript
const { openBlade, closeBlade } = useBladeNavigation();
```

### Methods

#### openBlade
```typescript
openBlade({
  blade: Component,
  param?: string,
  options?: unknown
});
```

#### closeBlade
```typescript
closeBlade();
```

### Example
```typescript
const { openBlade } = useBladeNavigation();

// Open details blade
function handleItemClick(item: any) {
  openBlade({
    blade: DetailsComponent,
    param: item.id
  });
}

// Open with options
openBlade({
  blade: DetailsComponent,
  param: item.id,
  options: { mode: 'edit', readonly: true }
});
```

### Pattern
- Use for all blade navigation
- Pass param for entity ID
- Use options for additional data
- Close blades when done

## useModificationTracker

### Purpose
Tracks form changes to detect "dirty" state.

### API
```typescript
const { isModified, currentValue, pristineValue, resetModificationState } = useModificationTracker(formData);
```

### Properties
- `isModified`: Computed<boolean> - Whether form has been modified
- `currentValue`: Ref<T> - Current form data (use this instead of original ref)
- `pristineValue`: Ref<T> - Original/pristine form data
- `resetModificationState`: Function - Reset modification state

### Example
```typescript
const item = ref({
  name: '',
  email: ''
});

const { isModified, currentValue, pristineValue, resetModificationState } = useModificationTracker(item);

// Load data - assign to currentValue
async function loadItem(id: string) {
  const data = await api.getItem(id);
  currentValue.value = data; // Use currentValue, not item
}

// Save data - use currentValue
async function save() {
  await api.saveItem(currentValue.value);
  resetModificationState(); // Clear dirty state after save
}

// Use in template
:modified="isModified"

// Access form data
// Use currentValue.value instead of item.value
```

### Pattern
- Track reactive form data
- Reset after successful save
- Show indicator when modified
- Warn before leaving if modified

## useApiClient

### Purpose
Provides API client with authentication and error handling.

### API
```typescript
const { getApiClient } = useApiClient(GeneratedClient);
const client = getApiClient();
```

### Setup
1. Generate API client: `yarn generate-api-client`
2. Configure `.env.local`: `APP_PLATFORM_URL=https://platform-url/`
3. Import generated client
4. Use in composable

### Example
```typescript
import { GeneratedClient } from '@/api_client';
import { useApiClient } from '@vc-shell/framework';

const { getApiClient } = useApiClient(GeneratedClient);

async function loadItems() {
  const client = getApiClient();
  const response = await client.items.getItems();
  return response.data;
}
```

### Pattern
- Generate client from Swagger/OpenAPI
- Use getApiClient() for each call
- Handle authentication automatically
- Use TypeScript types from client

## useMenuService

### Purpose
Registers menu items in the application navigation.

### API
```typescript
useMenuService().addMenuItem({
  id: string,
  title: string,
  url: string,
  icon?: string,
  priority?: number
});
```

### Example
```typescript
import { useMenuService } from '@vc-shell/framework';

useMenuService().addMenuItem({
  id: 'my-module',
  title: 'My Module',
  url: '/my-module',
  icon: 'inventory',
  priority: 100
});
```

### Pattern
- Register in module index.ts
- Use unique IDs
- Set appropriate priority
- Use Material Icons for icons

## usePermissions

### Purpose
Handles access control and permission checking.

### API
```typescript
const { checkPermission } = usePermissions();
const canEdit = checkPermission('my-module:edit');
```

### Example
```typescript
import { usePermissions } from '@vc-shell/framework';

const { checkPermission } = usePermissions();

const canEdit = checkPermission('my-module:edit');
const canDelete = checkPermission('my-module:delete');

// Use in template
:disabled="!canEdit"
v-if="canDelete"
```

### Pattern
- Check permissions before actions
- Hide UI elements based on permissions
- Use permission format: `module:action`
- Handle permission errors gracefully

## Common Patterns

### Combining Composables
```typescript
const { action: loadData, loading } = useAsync(async () => {
  const client = getApiClient();
  const response = await client.items.getItems();
  items.value = response.data;
});

const { openBlade } = useBladeNavigation();

function handleItemClick(item: any) {
  openBlade({
    blade: DetailsComponent,
    param: item.id
  });
}
```

### Error Handling Pattern
```typescript
const item = ref({ /* form data */ });
const { currentValue, resetModificationState } = useModificationTracker(item);

const { action: saveData, loading, error } = useAsync(async () => {
  try {
    const client = getApiClient();
    await client.items.saveItem(currentValue.value); // Use currentValue
    notification.success('Saved successfully');
    resetModificationState(); // Reset after successful save
  } catch (err) {
    notification.error('Failed to save');
    throw err;
  }
});
```

### Loading Pattern
```typescript
const { action: loadData, loading } = useAsync(async () => {
  // Load data
});

// Load on mount
onMounted(() => {
  loadData();
});

// Use in template
:loading="loading"
```

### Modification Tracking Pattern
```typescript
const item = ref({ /* form data */ });
const { isModified, currentValue, resetModificationState } = useModificationTracker(item);

// Load data
async function loadData(id: string) {
  const data = await api.get(id);
  currentValue.value = data; // Assign to currentValue
}

// After save
async function save() {
  await api.save(currentValue.value); // Use currentValue
  resetModificationState(); // Reset after successful save
}

// Before navigation
watch(() => route.path, () => {
  if (isModified.value) {
    // Warn user about unsaved changes
  }
});
```

## Best Practices

1. **Always use useAsync** for API calls
2. **Track modifications** for forms with useModificationTracker - use `currentValue` for data, `resetModificationState()` after save
3. **Use navigation** via useBladeNavigation
4. **Check permissions** before actions
5. **Handle errors** appropriately
6. **Show loading states** for better UX
7. **Reset modification** after successful save
8. **Use TypeScript** types for all composables
9. **Keep composables focused** on single responsibility
10. **Test composables** with proper mocking

