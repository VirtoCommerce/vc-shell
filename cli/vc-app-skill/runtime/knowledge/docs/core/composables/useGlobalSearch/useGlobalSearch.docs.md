# useGlobalSearch

Provides access to the global search service state: per-blade search visibility, search queries, and methods to toggle/close search. The service maintains a map of blade IDs to search state, allowing each blade in the stack to have its own independent search input. The state is shared through Vue's provide/inject system and automatically cleaned up when the scope is disposed.

Also exports `provideGlobalSearch()` for framework-level initialization.

## When to Use

- In blade toolbars or headers to toggle and read the search input visibility for a specific blade
- To programmatically set or read the search query for a specific blade (e.g., from a URL parameter or external trigger)
- To integrate search with the blade toolbar's search icon button
- When NOT to use: for table-level filtering within a blade, use VcDataTable's built-in search header. Global search is for blade-level search that affects the entire blade's content.

## Quick Start

```vue
<script setup lang="ts">
import { useGlobalSearch } from '@vc-shell/framework';
import { computed, watch } from 'vue';

const props = defineProps<{ bladeId: string }>();
const { isSearchVisible, searchQuery, toggleSearch, setSearchQuery, closeSearch } = useGlobalSearch();

// Reactive accessors scoped to this blade
const isVisible = computed(() => isSearchVisible.value[props.bladeId] ?? false);
const query = computed(() => searchQuery.value[props.bladeId] ?? '');

// React to search query changes
watch(query, (newQuery) => {
  if (newQuery.length >= 2) {
    fetchResults(newQuery);
  }
});

function onSearchToggle() {
  toggleSearch(props.bladeId);
}

function onSearchClose() {
  closeSearch(props.bladeId);
}
</script>

<template>
  <div>
    <VcButton icon="fas fa-search" @click="onSearchToggle" />
    <VcInput
      v-if="isVisible"
      :model-value="query"
      placeholder="Search..."
      @update:model-value="(val) => setSearchQuery(bladeId, val)"
      @keydown.escape="onSearchClose"
    />
  </div>
</template>
```

## API

### Parameters

None.

### Returns (`GlobalSearchState`)

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `isSearchVisible` | `Ref<Record<string, boolean>>` | Map of blade IDs to search visibility state. Access via `isSearchVisible.value[bladeId]`. |
| `searchQuery` | `Ref<Record<string, string>>` | Map of blade IDs to current search query strings. Access via `searchQuery.value[bladeId]`. |
| `toggleSearch` | `(bladeId: string) => void` | Toggles search visibility for a blade. If visible, hides it (and clears the query). If hidden, shows it. |
| `setSearchQuery` | `(bladeId: string, query: string) => void` | Sets the search query for a blade. Does not affect visibility. |
| `closeSearch` | `(bladeId: string) => void` | Hides the search input for a blade and clears the query. |

### Additional Exports

| Export | Description |
|--------|-------------|
| `provideGlobalSearch()` | Creates and provides the global search service. Idempotent -- returns existing service if already provided. Cleans up all state on scope disposal. |

## How It Works

The service is a simple reactive state container with two `Ref<Record<string, ...>>` maps. Each blade ID is a key in these maps. This design means:

1. **Blades are isolated**: Each blade has its own search visibility and query. Opening search in one blade does not affect others in the stack.
2. **Lazy initialization**: A blade's entry in the map is created on first `toggleSearch` or `setSearchQuery` call. Reading a non-existent key returns `undefined`, which the consumer treats as `false`/empty.
3. **Cleanup**: When `provideGlobalSearch()` scope is disposed (e.g., app unmount), both maps are cleared.

## Recipe: Toolbar Search Button with Badge Indicator

```vue
<script setup lang="ts">
import { useGlobalSearch } from '@vc-shell/framework';
import { computed } from 'vue';

const props = defineProps<{ bladeId: string }>();
const { isSearchVisible, searchQuery, toggleSearch } = useGlobalSearch();

const hasActiveSearch = computed(() => {
  const query = searchQuery.value[props.bladeId];
  return query != null && query.length > 0;
});
</script>

<template>
  <VcButton
    :icon="hasActiveSearch ? 'fas fa-search-plus' : 'fas fa-search'"
    :variant="hasActiveSearch ? 'primary' : 'ghost'"
    @click="toggleSearch(bladeId)"
  />
</template>
```

## Recipe: Pre-Populating Search from URL Query Parameter

```vue
<script setup lang="ts">
import { useGlobalSearch } from '@vc-shell/framework';
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';

const props = defineProps<{ bladeId: string }>();
const route = useRoute();
const { setSearchQuery, toggleSearch } = useGlobalSearch();

onMounted(() => {
  const urlQuery = route.query.search as string | undefined;
  if (urlQuery) {
    setSearchQuery(props.bladeId, urlQuery);
    toggleSearch(props.bladeId); // make the search input visible
  }
});
</script>
```

## Tips

- **`toggleSearch` clears the query when hiding.** This is by design -- when the user closes the search, the query is reset. If you need to preserve the query across toggle cycles, store it separately.
- **Use blade ID, not component instance ID.** The blade ID comes from the blade descriptor and is stable across re-renders. Using a component's `uid` would break if the component is recreated.
- **State is not persisted.** Unlike sidebar state, search state is in-memory only. Refreshing the page clears all search queries. Use URL query parameters if you need persistence.
- **Calling outside VcApp throws.** Like all provide/inject composables in the framework, `useGlobalSearch()` throws an `InjectionError` if the service has not been provided.

## Related

- VcDataTable search header -- table-level filtering built into the data table (different from global search)
- [useToolbar](../useToolbar/) -- toolbar service for blade action buttons (often includes a search toggle button)
- `framework/core/services/global-search-service.ts` -- underlying service implementation
