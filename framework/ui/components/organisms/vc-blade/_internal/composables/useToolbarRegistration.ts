import { type ComputedRef, type Ref, computed, inject, onBeforeUnmount, ref, watch } from "vue";
import { useBlade, usePermissions, useToolbar } from "@core/composables";
import type { IBladeToolbar } from "@core/types";
import { FALLBACK_BLADE_ID } from "@core/constants";
import type { IToolbarItem } from "@core/services";
import { resolveVisibility, resolveReactiveBoolean } from "@ui/components/organisms/vc-blade/utils";

const PROP_ITEM_ID_PREFIX = "prop_toolbar_item_";

/**
 * Manages the lifecycle of toolbar items:
 * - Converts `IBladeToolbar[]` props to `IToolbarItem[]` for the ToolbarService
 * - Registers/unregisters items as props or blade ID change
 * - Filters by permissions, visibility, and disabled-on-mobile
 * - Sorts by priority
 * - Cleans up on unmount
 */
export function useToolbarRegistration(items: Ref<IBladeToolbar[]>) {
  const { hasAccess } = usePermissions();
  const {
    registerToolbarItem,
    unregisterToolbarItem,
    getToolbarItems,
    updateToolbarItem,
  } = useToolbar({ autoCleanup: false });

  const blade = useBlade();
  const bladeId = computed(() => (blade.value?.id ?? FALLBACK_BLADE_ID).toLowerCase());

  const isMobile = inject<ComputedRef<boolean>>(
    "isMobile",
    computed(() => false),
  );

  const registeredItemIds = new Set<string>();
  const registrationBladeId = ref(bladeId.value);

  function convertToToolbarItem(item: IBladeToolbar, index: number): IToolbarItem {
    const activeBladeId = registrationBladeId.value;
    const id = item.id || `${PROP_ITEM_ID_PREFIX}${activeBladeId}_${index}`;

    return {
      ...item,
      id,
      bladeId: activeBladeId,
      priority: index * -1,
    } as IToolbarItem;
  }

  function updateItems(): void {
    const activeBladeId = registrationBladeId.value;
    const nextRegisteredIds = new Set<string>();

    items.value.forEach((item, index) => {
      const toolbarItem = convertToToolbarItem(item, index);
      const id = toolbarItem.id;
      nextRegisteredIds.add(id);

      if (registeredItemIds.has(id)) {
        updateToolbarItem(id, toolbarItem, activeBladeId);
      } else {
        registerToolbarItem(toolbarItem, activeBladeId);
      }
    });

    for (const id of registeredItemIds) {
      if (!nextRegisteredIds.has(id)) {
        unregisterToolbarItem(id, activeBladeId);
      }
    }

    registeredItemIds.clear();
    nextRegisteredIds.forEach((id) => registeredItemIds.add(id));
  }

  function clearToolbarItems(targetBladeId = registrationBladeId.value): void {
    for (const id of registeredItemIds) {
      unregisterToolbarItem(id, targetBladeId);
    }
    registeredItemIds.clear();
  }

  const visibleItems = computed(() => {
    // getToolbarItems reads from reactive registry (blade-scoped + global "*"),
    // so Vue automatically tracks changes to toolbar items for this blade.
    return getToolbarItems(registrationBladeId.value)
      .filter(
        (item) =>
          hasAccess(item.permissions) &&
          resolveVisibility(item.isVisible, blade.value) &&
          (isMobile.value ? !resolveReactiveBoolean(item.disabled) : true),
      )
      .sort((a, b) => {
        const priorityA = a.priority ?? 0;
        const priorityB = b.priority ?? 0;
        return priorityB - priorityA;
      });
  });

  watch(items, () => updateItems(), { deep: true, immediate: true });

  watch(bladeId, (newBladeId, oldBladeId) => {
    if (newBladeId === oldBladeId) return;
    clearToolbarItems(oldBladeId);
    registrationBladeId.value = newBladeId;
    updateItems();
  });

  onBeforeUnmount(() => {
    clearToolbarItems();
  });

  return { visibleItems };
}
