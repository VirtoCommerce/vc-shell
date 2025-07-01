<template>
  <Transition name="table-header">
    <div
      v-if="showHeader && shouldShowSearch"
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
import { VNode, computed, inject, Ref, h, useSlots, onBeforeUnmount, watch, onMounted, ref } from "vue";
import { useGlobalSearch } from "../../../../../../core/composables/useGlobalSearch";
import { BladeInstance } from "../../../../../../injection-keys";
import VcTableBaseHeader from "../vc-table-base-header/vc-table-base-header.vue";
import { IBladeInstance } from "../../../../../../shared";
import { useAppBarMobileButtons } from "../../../../../../core/composables/useAppBarMobileButtons";
import { FALLBACK_BLADE_ID } from "../../../../../../core/constants";

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
const { register: registerMobileButton, unregister: unregisterMobileButton } = useAppBarMobileButtons();

const currentBladeId = computed(() => {
  return blade?.value?.id || 0;
});

const shouldShowSearch = computed(() => {
  if (!isMobile.value) return true;

  if (blade?.value.navigation?.idx === 0) {
    return globalSearch.isSearchVisible.value[currentBladeId.value];
  }

  return true;
});

const showHeader = computed(() => {
  return (
    ((!!props.hasHeaderSlot || !!props.header) &&
      (!props.columnsInit || !!props.searchValue || props.searchValue === "" || !!props.activeFilterCount)) ||
    false
  );
});

const bladeId = computed(() => {
  return blade.value?.id || FALLBACK_BLADE_ID;
});

const searchButtonConfig = ref({
  id: "global-search",
  icon: "lucide-search",
  onClick: () => {
    globalSearch.toggleSearch(bladeId.value);
  },
  onClose: () => {
    globalSearch.closeSearch(bladeId.value);
  },
  // Button is visible only if:
  // 1. We are in the root blade (idx === 0)
  // 2. Header is available for display
  isVisible: computed(() => Boolean(blade.value?.navigation?.idx === 0 && showHeader.value)),
  order: 5,
});

// Register search button when mounted, if there is a search functionality
onMounted(() => {
  if (props.hasHeaderSlot || props.header) {
    registerMobileButton(searchButtonConfig.value);
  }
});

// When unmounted, close the search and unregister the button
onBeforeUnmount(() => {
  if (globalSearch.isSearchVisible.value[bladeId.value]) {
    globalSearch.closeSearch(bladeId.value);
  }
  unregisterMobileButton("global-search");
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
