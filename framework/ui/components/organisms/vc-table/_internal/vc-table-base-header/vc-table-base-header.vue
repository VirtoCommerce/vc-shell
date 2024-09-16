<template>
  <div
    class="tw-shrink-0 tw-flex tw-items-center tw-justify-between tw-box-border"
    :class="{
      'tw-px-4 tw-py-2 tw-border-[color:var(--table-header-border-color)] tw-border-solid tw-border-b': $isMobile.value,
      'tw-p-4': $isDesktop.value,
    }"
  >
    <!-- Table filter mobile button -->
    <div
      v-if="$isMobile.value && $slots['filters']"
      class="tw-mr-3"
    >
      <VcTableFilter :counter="activeFilterCount">
        <template #default="{ closePanel }">
          <slot
            name="filters"
            :close-panel="closePanel"
          ></slot>
        </template>
      </VcTableFilter>
    </div>

    <!-- Table search input -->
    <VcInput
      ref="searchInput"
      class="tw-grow tw-basis-0"
      :placeholder="searchPlaceholder || $t('COMPONENTS.ORGANISMS.VC_TABLE.SEARCH')"
      clearable
      name="table_search"
      :model-value="searchValue"
      @update:model-value="$emit('search:change', $event as string)"
    >
      <template #prepend-inner="{ focus }">
        <VcIcon
          icon="fas fa-search"
          class="tw-text-[color:var(--table-header-input-icon-color)]"
          @click="focus?.()"
        ></VcIcon>
      </template>
    </VcInput>

    <!-- Table filter desktop button -->
    <div
      v-if="$isDesktop.value && $slots['filters']"
      class="tw-ml-3"
    >
      <VcTableFilter
        :title="$t('COMPONENTS.ORGANISMS.VC_TABLE.ALL_FILTERS')"
        :counter="activeFilterCount"
        :parent-expanded="expanded"
      >
        <template #default="{ closePanel }">
          <slot
            name="filters"
            :close-panel="closePanel"
          ></slot>
        </template>
      </VcTableFilter>
    </div>
  </div>
</template>

<script lang="ts" setup>
import VcTableFilter from "./../vc-table-filter/vc-table-filter.vue";
import { VcInput } from "./../../../../molecules";
export interface Props {
  searchValue?: string;
  searchPlaceholder?: string;
  activeFilterCount?: number;
  expanded?: boolean;
}

export interface Emits {
  (event: "search:change", value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<style lang="scss">
:root {
  --table-header-border-color: var(--neutral-200);
  --table-header-input-icon-color: var(--neutral-300);
}
</style>
