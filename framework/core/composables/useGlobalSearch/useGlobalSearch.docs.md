# useGlobalSearch

Provides access to the global search service state: per-blade search visibility, search queries, and methods to toggle/close search. The service is scoped via Vue's provide/inject system.

Also exports `provideGlobalSearch()` for framework-level initialization.

## When to Use

- In blade toolbars or headers to toggle and read the search input visibility
- To programmatically set or read the search query for a specific blade
- When NOT to use: for table-level filtering within a blade, use VcDataTable's built-in search header

## Basic Usage

```typescript
import { useGlobalSearch } from '@vc-shell/framework';

const { isSearchVisible, searchQuery, toggleSearch, setSearchQuery, closeSearch } = useGlobalSearch();
```

## API

### Parameters

None.

### Returns (`GlobalSearchState`)

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `isSearchVisible` | `Ref<Record<string, boolean>>` | Map of blade IDs to search visibility state |
| `searchQuery` | `Ref<Record<string, string>>` | Map of blade IDs to current search query strings |
| `toggleSearch` | `(bladeId: string) => void` | Toggles search visibility for a blade |
| `setSearchQuery` | `(bladeId: string, query: string) => void` | Sets the search query for a blade |
| `closeSearch` | `(bladeId: string) => void` | Hides the search input for a blade |

### Additional Exports

| Export | Description |
|--------|-------------|
| `provideGlobalSearch()` | Creates and provides the global search service. Cleans up on scope dispose. |

## Common Patterns

### Blade with search toggle

```vue
<script setup lang="ts">
import { useGlobalSearch } from '@vc-shell/framework';
import { computed } from 'vue';

const props = defineProps<{ bladeId: string }>();
const { isSearchVisible, searchQuery, toggleSearch, closeSearch } = useGlobalSearch();

const isVisible = computed(() => isSearchVisible.value[props.bladeId] ?? false);
const query = computed(() => searchQuery.value[props.bladeId] ?? '');

function onToggle() {
  toggleSearch(props.bladeId);
}

function onClose() {
  closeSearch(props.bladeId);
}
</script>
```

## Related

- VcDataTable search header -- table-level filtering built into the data table
- [useToolbar](../useToolbar/) -- toolbar service for blade action buttons
