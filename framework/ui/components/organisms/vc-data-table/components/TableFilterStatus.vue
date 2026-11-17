<template>
  <span class="vc-data-table__filter-status">
    <template v-if="unfilteredCount !== undefined && !narrow">
      <span>{{ $t("COMPONENTS.ORGANISMS.VC_DATA_TABLE.STATUS.FILTERED_FROM", { count: unfilteredCount }) }}</span>
      <span aria-hidden="true">·</span>
    </template>
    <span>{{ reason }}</span>
    <span aria-hidden="true">·</span>
    <VcButton
      class="vc-data-table__filter-status-clear"
      variant="link"
      @click="emit('clear-all')"
    >
      {{ $t("COMPONENTS.ORGANISMS.VC_DATA_TABLE.STATUS.CLEAR_ALL") }}
    </VcButton>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { VcButton } from "@ui/components/atoms/vc-button";

const props = defineProps<{
  /** Bar fields with a value */
  filterCount: number;
  /** The bar has search text */
  search: boolean;
  /** Rows without the bar's filters and search */
  unfilteredCount?: number;
  /** Narrow footer: only the reason and Clear all */
  narrow?: boolean;
}>();

const emit = defineEmits<{ "clear-all": [] }>();

const { t } = useI18n({ useScope: "global" });

const reason = computed(() => {
  const key = "COMPONENTS.ORGANISMS.VC_DATA_TABLE.STATUS";
  if (!props.filterCount) return t(`${key}.SEARCH`);
  const n = props.filterCount;
  return props.search ? t(`${key}.FILTERS_AND_SEARCH`, { count: n }, n) : t(`${key}.FILTERS`, { count: n }, n);
});
</script>

<style lang="scss">
.vc-data-table {
  &__filter-status {
    @apply tw-inline-flex tw-items-center tw-gap-1.5 tw-text-sm tw-whitespace-nowrap;
    color: var(--neutrals-500);
  }
}
</style>
