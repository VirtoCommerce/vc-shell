# Async Select Patterns

**Pattern:** VcSelect with async options and custom templates

**Based on:** offers-details.vue

```vue
<Field v-slot="{ errorMessage, errors }" name="parent" rules="required">
  <VcSelect
    v-model="entity.parentId"
    :label="$t('FORM.PARENT')"
    required
    searchable
    :loading="fetchParentsLoading"
    :options="fetchParents"
    option-value="id"
    option-label="name"
    :error="!!errors.length"
    :error-message="errorMessage"
  >
    <!-- Custom selected item template -->
    <template #selected-item="{ opt }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <span class="tw-font-medium">{{ opt.name }}</span>
        <span class="tw-text-gray-500">{{ opt.category }}</span>
      </div>
    </template>

    <!-- Custom option template -->
    <template #option="{ opt }">
      <div class="tw-flex tw-flex-col">
        <span>{{ opt.name }}</span>
        <span class="tw-text-sm tw-text-gray-500">{{ opt.description }}</span>
      </div>
    </template>
  </VcSelect>
</Field>

<script setup>
const fetchParentsLoading = ref(false);

// Async function for options
async function fetchParents(query: string, skip: number, ids?: string[]) {
  fetchParentsLoading.value = true;
  try {
    const response = await api.searchParents({ query, skip, take: 20, ids });
    return { results: response.items, totalCount: response.totalCount };
  } finally {
    fetchParentsLoading.value = false;
  }
}
</script>
```

**Components:** VcSelect

**Features:**
- Async options loading
- Searchable
- Custom templates
- Loading state

**Lines:** ~40

