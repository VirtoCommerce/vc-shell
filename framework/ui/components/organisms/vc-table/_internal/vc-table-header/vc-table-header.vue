<template>
  <Transition name="table-header">
    <div
      v-show="
        shouldShowSearch &&
        (hasHeaderSlot || header) &&
        (!columnsInit || searchValue || searchValue === '' || activeFilterCount)
      "
      class="vc-table-header"
    >
      <slot
        name="header"
        :header="headerComponent"
      >
        <component :is="headerComponent" />
      </slot>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { VNode, computed, inject, Ref, h, useSlots } from "vue";
import { useGlobalSearch } from "../../../../../../core/composables/useGlobalSearch";
import { BladeInstance } from "../../../../../../injection-keys";
import VcTableBaseHeader from "../vc-table-base-header/vc-table-base-header.vue";
import { IBladeInstance } from "../../../../../../shared";

const props = defineProps<{
  hasHeaderSlot: boolean;
  header: boolean;
  columnsInit: boolean;
  searchValue?: string;
  activeFilterCount?: number;
  searchPlaceholder?: string;
  disableFilter?: boolean;
  expanded?: boolean;
}>();

const emit = defineEmits<{
  "search:change": [string];
}>();

defineSlots<{
  filters: (props: { closePanel: () => void }) => VNode;
  header: (props: { header: VNode }) => VNode;
}>();

const blade = inject(
  BladeInstance,
  computed(
    (): Partial<IBladeInstance> => ({
      navigation: {
        idx: 0,
        instance: null,
      },
    }),
  ),
);
const globalSearch = useGlobalSearch();
const isMobile = inject("isMobile") as Ref<boolean>;
const slots = useSlots();

const currentBladeId = computed(() => {
  return blade?.value.navigation?.idx || 0;
});

const shouldShowSearch = computed(() => {
  if (!isMobile.value) return true;

  if (blade?.value.navigation?.idx === 0) {
    return globalSearch.isSearchVisible.value[currentBladeId.value];
  }

  return true;
});

const headerComponent = () =>
  h(
    VcTableBaseHeader,
    {
      searchValue: props.searchValue,
      searchPlaceholder: props.searchPlaceholder,
      activeFilterCount: props.activeFilterCount,
      expanded: props.expanded,
      "onSearch:change": (value: string) => emit("search:change", value),
      disableFilter: props.disableFilter,
    },
    slots.filters
      ? {
          filters: () => {
            return slots.filters?.({ closePanel: () => {} });
          },
        }
      : undefined,
  );
</script>

<style lang="scss">
.vc-table-header {
  // @apply tw-relative;
}

.table-header-enter-active,
.table-header-leave-active {
  @apply tw-transition-all tw-duration-200 tw-ease-in-out;
}

.table-header-enter-from,
.table-header-leave-to {
  @apply tw-opacity-0 tw-transform tw-translate-y-[-30px];
}

.table-header-enter-to,
.table-header-leave-from {
  @apply tw-opacity-100 tw-transform tw-translate-y-0;
}
</style>
