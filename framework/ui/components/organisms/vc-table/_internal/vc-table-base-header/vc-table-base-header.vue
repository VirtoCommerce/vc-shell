<template>
  <div
    class="vc-table-base-header"
    :class="{
      'vc-table-base-header--mobile': $isMobile.value,
      'vc-table-base-header--desktop': $isDesktop.value,
    }"
  >
    <div
      v-if="$isMobile.value && $slots['filters']"
      class="vc-table-base-header__filter-mobile"
    >
      <VcTableFilter
        :counter="activeFilterCount"
        :disabled="disableFilter"
      >
        <template #default="{ closePanel }">
          <slot
            name="filters"
            :close-panel="closePanel"
          ></slot>
        </template>
      </VcTableFilter>
    </div>

    <VcInput
      ref="searchInput"
      class="vc-table-base-header__search-input"
      :placeholder="searchPlaceholder || $t('COMPONENTS.ORGANISMS.VC_TABLE.SEARCH')"
      clearable
      name="table_search"
      :model-value="searchValue"
      @update:model-value="$emit('search:change', $event as string)"
    >
      <template #prepend-inner="{ focus }">
        <VcIcon
          icon="fas fa-search"
          class="vc-table-base-header__search-icon"
          @click="focus?.()"
        ></VcIcon>
      </template>
    </VcInput>

    <div
      v-if="$isDesktop.value && $slots['filters']"
      class="vc-table-base-header__filter-desktop"
    >
      <VcTableFilter
        :title="$t('COMPONENTS.ORGANISMS.VC_TABLE.ALL_FILTERS')"
        :counter="activeFilterCount"
        :parent-expanded="expanded"
        :disabled="disableFilter"
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
import { inject, ref, watch, computed } from "vue";
import { useGlobalSearch } from "../../../../../../core/composables/useGlobalSearch";
import { useBladeNavigation } from "../../../../../../shared";

export interface Props {
  searchValue?: string;
  searchPlaceholder?: string;
  activeFilterCount?: number;
  expanded?: boolean;
  disableFilter?: boolean;
}

export interface Emits {
  (event: "search:change", value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<style lang="scss">
:root {
  --table-base-header-border-color: var(--base-border-color, var(--neutrals-200));
  --table-base-header-input-icon-color: var(--neutrals-300);
  --table-base-header-padding: 18px;
  --table-base-header-mobile-padding: 30px;
}

.vc-table-base-header {
  @apply tw-shrink-0 tw-flex tw-items-center tw-justify-between tw-box-border;

  &--mobile {
    @apply tw-px-[var(--table-base-header-mobile-padding)] tw-border-b tw-border-solid tw-py-2;
    border-color: var(--table-base-header-border-color);
  }

  &--desktop {
    @apply tw-p-[var(--table-base-header-padding)];
  }

  &__filter-mobile {
    @apply tw-mr-3;
  }

  &__filter-desktop {
    @apply tw-ml-3;
  }

  &__search-input {
    @apply tw-grow tw-basis-0;
  }

  &__search-icon {
    @apply tw-text-[color:var(--table-base-header-input-icon-color)];
  }
}
</style>
