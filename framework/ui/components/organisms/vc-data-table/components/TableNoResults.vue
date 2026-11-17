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
      >
        <!-- the bar's chip, without its editor: the text in a tonal frame, and its × -->
        <VcButtonGroup
          class="vc-data-table__no-results-tag"
          role="presentation"
          size="2xs"
          attached
        >
          <span class="vc-data-table__no-results-tag-text">{{ tag.text }}</span>
          <VcButton
            class="vc-data-table__no-results-tag-x"
            variant="tonal"
            icon="lucide-x"
            icon-size="xs"
            :aria-label="$t('COMPONENTS.ORGANISMS.VC_SEARCH_BAR.REMOVE_FILTER', { label: tag.label })"
            @click="emit('remove', tag.id)"
          />
        </VcButtonGroup>
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
import { VcButton, VcButtonGroup } from "@ui/components/atoms";
import TableEmpty from "@ui/components/organisms/vc-data-table/components/TableEmpty.vue";
import type { SearchBarAppliedField } from "@ui/components/organisms/vc-data-table/types";

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
    max-width: 260px;
  }

  // the text in the frame of a 2xs tonal button, the × attached to it (as the bar's toggle chip)
  &__no-results-tag-text {
    @apply tw-block tw-min-w-0 tw-text-xs tw-box-border tw-border tw-border-solid tw-rounded-s-[var(--button-border-radius)]
      tw-whitespace-nowrap;
    height: var(--button-2xs-height);
    line-height: calc(var(--button-2xs-height) - 2px);
    padding-inline: var(--button-2xs-padding-hor);
    overflow: hidden;
    text-overflow: ellipsis;
    border-color: var(--button-tonal-border-color);
    background: var(--button-tonal-background-color);
    color: var(--button-tonal-text-color);
  }

  &__no-results .vc-table-composition__empty-action {
    @apply tw-flex tw-gap-2;
  }
}
</style>
