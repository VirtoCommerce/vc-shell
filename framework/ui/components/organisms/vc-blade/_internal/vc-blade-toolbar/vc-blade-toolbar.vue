<template>
  <div
    class="vc-blade-toolbar"
    :class="{
      'vc-blade-toolbar--mobile': $isMobile.value,
    }"
  >
    <div class="vc-blade-toolbar__content">
      <VcBladeToolbarButtons
        :items="visibleItems"
        :is-expanded="isExpanded"
      />

      <slot
        v-if="slots['widgets-container']"
        name="widgets-container"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ComputedRef, computed, inject, onBeforeMount, onBeforeUnmount, watch, useSlots } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { usePermissions, useToolbar } from "../../../../../../core/composables";
import { IBladeToolbar } from "../../../../../../core/types";
import VcBladeToolbarButtons from "./_internal/vc-blade-toolbar-buttons/vc-blade-toolbar-buttons.vue";
import { BladeInstance } from "../../../../../../injection-keys";
import { FALLBACK_BLADE_ID } from "../../../../../../core/constants";
import { IBladeInstance } from "../../../../../../shared/components/blade-navigation/types";
import { IToolbarItem } from "../../../../../../core/services/toolbar-service";

export interface Props {
  items: IBladeToolbar[];
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});

const slots = useSlots();
const isExpanded = useLocalStorage("VC_BLADE_TOOLBAR_IS_EXPANDED", true);
const { hasAccess } = usePermissions();
const { registerToolbarItem, unregisterToolbarItem, getToolbarItems, clearBladeToolbarItems } = useToolbar();

// Get the ID of the current blade
const blade = inject<ComputedRef<IBladeInstance>>(
  BladeInstance,
  computed(() => ({
    id: FALLBACK_BLADE_ID,
    expandable: false,
    maximized: false,
    error: undefined,
    navigation: undefined,
    breadcrumbs: undefined,
  })),
);

const bladeId = computed(() => blade.value?.id ?? FALLBACK_BLADE_ID);

// Prefix for prop items to avoid ID conflicts
const PROP_ITEM_ID_PREFIX = "prop_toolbar_item_";

// Generate IDs for items without them
function ensureItemHasId(item: IBladeToolbar, index: number): IToolbarItem {
  const itemCopy = { ...item } as IToolbarItem;
  if (!("id" in itemCopy) || !itemCopy.id) {
    itemCopy.id = `${PROP_ITEM_ID_PREFIX}${bladeId.value}_${index}`;
  }
  return itemCopy;
}

// Register prop items in the service
function registerPropItems() {
  // Unregister previous items first to avoid duplicates
  unregisterPropItems();

  // Register new items
  props.items.forEach((item, index) => {
    const toolbarItem = ensureItemHasId(item, index);
    registerToolbarItem(toolbarItem);
  });
}

// Unregister prop items from the service
function unregisterPropItems() {
  const itemsToRemove = getToolbarItems().filter((item) => item.id.startsWith(PROP_ITEM_ID_PREFIX + bladeId.value));

  itemsToRemove.forEach((item) => {
    unregisterToolbarItem(item.id);
  });
}

// Filter visible items from service
const visibleItems = computed(() => {
  return getToolbarItems()
    .filter((item) => hasAccess(item.permissions) && (item.isVisible === undefined || item.isVisible) && !item.disabled)
    .sort((a, b) => {
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;
      return priorityB - priorityA;
    });
});

// Watch for changes in props.items
watch(
  () => props.items,
  () => {
    registerPropItems();
  },
  { deep: true },
);

// Initial registration
onBeforeMount(() => {
  registerPropItems();
});

// Cleanup on unmount
onBeforeUnmount(() => {
  unregisterPropItems();
});
</script>

<style lang="scss">
:root {
  --blade-toolbar-height: 54px;
  --blade-toolbar-height-expanded: 54px;
  --blade-toolbar-background-color: var(--additional-50);
  --blade-toolbar-border-color: var(--neutrals-200);
  --blade-toolbar-icon-color: var(--neutrals-700);
  --blade-toolbar-icon-hover-color: var(--primary-600);
}

.vc-blade-toolbar {
  @apply tw-bg-[color:var(--blade-toolbar-background-color)] tw-border-b-[color:var(--blade-toolbar-border-color)] tw-border-solid tw-border-b tw-flex tw-box-border tw-w-full tw-content-center tw-items-stretch tw-shrink-0;

  &__content {
    @apply tw-flex tw-flex-row tw-w-full tw-relative tw-overflow-hidden tw-min-h-[var(--blade-toolbar-height)];
  }

  &--mobile {
    @apply tw-fixed tw-bottom-0 tw-right-0 tw-z-50 tw-p-4 tw-bg-transparent tw-border-0 tw-w-auto;
  }
}
</style>
