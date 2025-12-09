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
import { ComputedRef, computed, inject, onBeforeMount, onBeforeUnmount, watch, useSlots, reactive } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { usePermissions, useToolbar } from "../../../../../../core/composables";
import { IBladeToolbar } from "../../../../../../core/types";
import VcBladeToolbarButtons from "./_internal/vc-blade-toolbar-buttons/vc-blade-toolbar-buttons.vue";
import { FALLBACK_BLADE_ID } from "../../../../../../core/constants";
import { IBladeInstance } from "../../../../../../shared/components/blade-navigation/types";
import { IToolbarItem } from "../../../../../../core/services";
import { useBlade } from "../../../../../../core/composables";

export interface Props {
  items: IBladeToolbar[];
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});

const slots = useSlots();
const isExpanded = useLocalStorage("VC_BLADE_TOOLBAR_IS_EXPANDED", true);
const { hasAccess } = usePermissions();
const { registerToolbarItem, unregisterToolbarItem, getToolbarItems, clearBladeToolbarItems, updateToolbarItem } =
  useToolbar();

// Get the ID of the current blade
const blade = useBlade();

const bladeId = computed(() => (blade.value?.id ?? FALLBACK_BLADE_ID).toLowerCase());

const isMobile = inject<ComputedRef<boolean>>(
  "isMobile",
  computed(() => false),
);

// Prefix for prop items to avoid ID conflicts
const PROP_ITEM_ID_PREFIX = "prop_toolbar_item_";

// Create map to track registered item IDs
const registeredItemIds = reactive(new Map<number, string>());

// Convert IBladeToolbar to IToolbarItem
function convertToToolbarItem(item: IBladeToolbar, index: number): IToolbarItem {
  const id = item.id || `${PROP_ITEM_ID_PREFIX}${bladeId.value}_${index}`;

  return {
    ...item,
    id,
    bladeId: bladeId.value,
    priority: index * -1,
  } as unknown as IToolbarItem;
}

// Update all items from props
function updateItems(): void {
  // Register new items or update existing ones
  props.items.forEach((item, index) => {
    const id = registeredItemIds.get(index);

    if (id) {
      // Item already registered, update it
      const toolbarItem = convertToToolbarItem(item, index);
      updateToolbarItem(id, toolbarItem);
    } else {
      // New item, register it
      const toolbarItem = convertToToolbarItem(item, index);
      registerToolbarItem(toolbarItem);
      registeredItemIds.set(index, toolbarItem.id);
    }
  });

  // Remove items that no longer exist in props.items
  const indices = [...registeredItemIds.keys()];
  indices.forEach((index) => {
    if (index >= props.items.length) {
      const id = registeredItemIds.get(index);
      if (id) {
        unregisterToolbarItem(id);
        registeredItemIds.delete(index);
      }
    }
  });
}

// Unregister all toolbar items
function clearToolbarItems(): void {
  // Clear all previously registered items
  for (const id of registeredItemIds.values()) {
    unregisterToolbarItem(id);
  }

  // Clear the map
  registeredItemIds.clear();
}

// Filter visible items from service
const visibleItems = computed(() => {
  return getToolbarItems()
    .filter(
      (item) =>
        hasAccess(item.permissions) &&
        (typeof item.isVisible === "function"
          ? item.isVisible(blade.value)
          : item.isVisible === undefined || item.isVisible) &&
        (isMobile.value ? !item.disabled : true),
    )
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
    updateItems();
  },
  { deep: true, immediate: true },
);

// Cleanup on unmount
onBeforeUnmount(() => {
  clearToolbarItems();
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
