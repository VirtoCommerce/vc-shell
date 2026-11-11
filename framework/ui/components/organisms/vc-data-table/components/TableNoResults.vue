<template>
  <TableEmpty
    class="vc-data-table__no-results"
    :icon="appliedFields.length ? 'lucide-funnel-x' : 'lucide-search-x'"
  >
    <div class="vc-table-composition__empty-title">{{ title }}</div>
    <div class="vc-table-composition__empty-description">{{ hint }}</div>
    <ul
      v-if="appliedFields.length"
      class="vc-data-table__no-results-tags"
    >
      <li
        v-for="tag in appliedFields"
        :key="tag.id"
        class="vc-data-table__no-results-tag"
      >
        <span>{{ tag.text }}</span>
        <button
          type="button"
          class="vc-data-table__no-results-tag-x"
          :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.REMOVE_FILTER', { label: tag.label })"
          @click="emit('remove', tag.id)"
        >
          <VcIcon
            icon="lucide-x"
            size="xs"
          />
        </button>
      </li>
    </ul>
    <template #action>
      <VcButton
        v-if="search"
        variant="outline"
        size="sm"
        @click="emit('clear-search')"
      >
        {{ $t(`${K}.CLEAR_SEARCH`) }}
      </VcButton>
      <VcButton
        v-if="appliedFields.length"
        variant="outline"
        size="sm"
        @click="emit('clear-filters')"
      >
        {{ $t(`${K}.CLEAR_FILTERS`) }}
      </VcButton>
    </template>
  </TableEmpty>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { VcIcon, VcButton } from "@ui/components/atoms";
import TableEmpty from "@ui/components/organisms/vc-data-table/components/TableEmpty.vue";
import type { SearchBarAppliedField } from "@ui/components/organisms/vc-search-bar/composables/useSearchBarController";

const props = defineProps<{
  /** The bar's search text */
  search: string;
  /** The bar's fields with a value */
  appliedFields: SearchBarAppliedField[];
}>();

const emit = defineEmits<{
  /** Remove one field's filter */
  remove: [id: string];
  "clear-search": [];
  "clear-filters": [];
}>();

const K = "COMPONENTS.ORGANISMS.VC_DATA_TABLE.NO_RESULTS";
const { t } = useI18n({ useScope: "global" });

const title = computed(() => {
  const n = props.appliedFields.length;
  if (props.search && n) return t(`${K}.TITLE_SEARCH_FILTERS`, { query: props.search, count: n }, n);
  if (props.search) return t(`${K}.TITLE_SEARCH`, { query: props.search });
  return t(`${K}.TITLE_FILTERS`, { count: n }, n);
});

const hint = computed(() => t(props.appliedFields.length ? `${K}.HINT_FILTERS` : `${K}.HINT_SEARCH`));
</script>

<style lang="scss">
.vc-data-table {
  &__no-results-tags {
    @apply tw-flex tw-flex-wrap tw-justify-center tw-gap-1.5 tw-mt-3 tw-p-0 tw-list-none;
  }

  &__no-results-tag {
    @apply tw-inline-flex tw-items-center tw-whitespace-nowrap;
    height: 28px;
    max-width: 260px;
    padding-inline-start: 8px;
    border: 1px solid var(--primary-200);
    border-radius: 6px;
    background: var(--primary-50);
    color: var(--primary-700);
    font-size: 12.5px;

    > span {
      @apply tw-truncate;
    }
  }

  &__no-results-tag-x {
    @apply tw-inline-flex tw-items-center tw-justify-center tw-h-full tw-shrink-0;
    width: 24px;
    color: var(--primary-700);
    border-radius: 0 6px 6px 0;

    &:hover {
      background: var(--primary-100);
    }

    &:focus-visible {
      outline: 2px solid var(--primary-300);
      outline-offset: -2px;
    }
  }

  &__no-results .vc-table-composition__empty-action {
    @apply tw-flex tw-gap-2;
  }
}
</style>
