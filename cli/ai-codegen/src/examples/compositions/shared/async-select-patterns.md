# Async Select Patterns

Dynamic VcSelect with async data loading and search.

## Description
Provides:
- Async options loading
- Search/filtering
- Infinite scroll
- Dependent selects

## Usage
Use for dropdowns with large datasets or API-backed options.

## Code

```typescript
import { ref, watch } from "vue";
import { VcSelect } from "@vc-shell/framework";

// Simple async select
const categoryOptions = ref<Array<{ value: string; label: string }>>([]);
const categoryLoading = ref(false);

async function loadCategoryOptions() {
  categoryLoading.value = true;
  try {
    const categories = await fetchCategories();
    categoryOptions.value = categories.map(cat => ({
      value: cat.id,
      label: cat.name,
    }));
  } finally {
    categoryLoading.value = false;
  }
}

// Load on mount
onMounted(() => {
  loadCategoryOptions();
});
```

```vue
<VcSelect
  v-model="entity.categoryId"
  :label="$t('CATEGORY')"
  :placeholder="$t('CATEGORY_PLACEHOLDER')"
  :options="categoryOptions"
  :loading="categoryLoading"
  @update:model-value="onModified"
/>
```

```typescript
// Async select with search
const searchQuery = ref("");
const searchResults = ref<Array<{ value: string; label: string }>>([]);
const searchLoading = ref(false);

// Debounced search
const debouncedSearch = useDebounceFn(async (query: string) => {
  if (!query || query.length < 2) {
    searchResults.value = [];
    return;
  }

  searchLoading.value = true;
  try {
    const results = await searchEntities(query);
    searchResults.value = results.map(item => ({
      value: item.id,
      label: item.name,
    }));
  } finally {
    searchLoading.value = false;
  }
}, 300);

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});
```

```vue
<VcSelect
  v-model="entity.relatedItemId"
  :label="$t('RELATED_ITEM')"
  :placeholder="$t('SEARCH_PLACEHOLDER')"
  :options="searchResults"
  :loading="searchLoading"
  searchable
  @search="searchQuery = $event"
/>
```

```typescript
// Dependent selects (country → state → city)
const countryId = ref<string>();
const stateId = ref<string>();
const cityId = ref<string>();

const countryOptions = ref([]);
const stateOptions = ref([]);
const cityOptions = ref([]);

// Load states when country changes
watch(countryId, async (newCountryId) => {
  stateId.value = undefined; // Reset dependent field
  cityId.value = undefined;

  if (!newCountryId) {
    stateOptions.value = [];
    cityOptions.value = [];
    return;
  }

  try {
    const states = await fetchStates(newCountryId);
    stateOptions.value = states.map(s => ({
      value: s.id,
      label: s.name,
    }));
  } catch (error) {
    console.error("Failed to load states:", error);
  }
});

// Load cities when state changes
watch(stateId, async (newStateId) => {
  cityId.value = undefined; // Reset dependent field

  if (!newStateId) {
    cityOptions.value = [];
    return;
  }

  try {
    const cities = await fetchCities(newStateId);
    cityOptions.value = cities.map(c => ({
      value: c.id,
      label: c.name,
    }));
  } catch (error) {
    console.error("Failed to load cities:", error);
  }
});
```

```vue
<VcSelect
  v-model="countryId"
  :label="$t('COUNTRY')"
  :options="countryOptions"
/>

<VcSelect
  v-model="stateId"
  :label="$t('STATE')"
  :options="stateOptions"
  :disabled="!countryId"
/>

<VcSelect
  v-model="cityId"
  :label="$t('CITY')"
  :options="cityOptions"
  :disabled="!stateId"
/>
```

```typescript
// Infinite scroll select
const page = ref(1);
const hasMore = ref(true);
const allOptions = ref<Array<{ value: string; label: string }>>([]);

async function loadMoreOptions() {
  if (!hasMore.value) return;

  try {
    const result = await fetchPaginated({ page: page.value, pageSize: 20 });

    allOptions.value.push(
      ...result.items.map(item => ({
        value: item.id,
        label: item.name,
      }))
    );

    hasMore.value = result.items.length === 20;
    page.value++;
  } catch (error) {
    console.error("Failed to load more options:", error);
  }
}

// Load first page on mount
onMounted(() => {
  loadMoreOptions();
});
```

```vue
<VcSelect
  v-model="entity.optionId"
  :label="$t('OPTION')"
  :options="allOptions"
  @scroll-end="loadMoreOptions"
/>
```
