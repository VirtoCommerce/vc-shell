import { type ComputedRef, type Ref, computed, inject, onBeforeUnmount, ref, watch } from "vue";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { registerBladeContext } from "@core/composables/bladeContext/registry";
import { useBlade } from "@core/composables/useBlade";
import { usePermissions } from "@core/composables/usePermissions";
import { useToolbar } from "@core/composables/useToolbar";
import { useResponsive } from "@framework/core/composables/useResponsive";
import type { BladeContext, IBladeToolbar } from "@core/types";
import { FALLBACK_BLADE_ID } from "@core/constants";
import type { IToolbarItem } from "@core/services/toolbar-service";
import { resolveVisibility, resolveReactiveBoolean } from "@ui/components/organisms/vc-blade/utils";
import { BladeContextKey } from "@framework/injection-keys";

const PROP_ITEM_ID_PREFIX = "prop_toolbar_item_";

/** A toolbar item with `disabled` and `clickHandler` bound to the blade context. */
export interface ResolvedToolbarItem extends Omit<IToolbarItem, "disabled" | "clickHandler"> {
  disabled: ComputedRef<boolean>;
  clickHandler?: () => void | Promise<void>;
}

/**
 * Manages the lifecycle of toolbar items:
 * - converts `IBladeToolbar[]` props to `IToolbarItem[]` for the ToolbarService
 * - registers/unregisters items as props or blade id change
 * - filters by permissions, visibility and disabled-on-mobile, sorts by priority
 * - resolves `disabled` and binds `clickHandler` to the blade context
 * - cleans up on unmount
 */
export function useToolbarRegistration(items: Ref<IBladeToolbar[]>) {
  const { hasAccess } = usePermissions();
  const { registerToolbarItem, unregisterToolbarItem, getToolbarItems, updateToolbarItem } = useToolbar({
    autoCleanup: false,
  });

  const { id: currentBladeId } = useBlade();
  const bladeId = computed(() => (currentBladeId.value ?? FALLBACK_BLADE_ID).toLowerCase());
  // Read the descriptor directly: useBlade().name throws outside a blade context.
  const descriptor = inject(BladeDescriptorKey, undefined);
  const bladeName = computed(() => descriptor?.value?.name);
  // What the blade exposed with defineBladeContext; buttons from other modules read it here
  const bladeContext = inject(BladeContextKey, undefined);
  const context = computed<BladeContext>(() => bladeContext?.value ?? {});

  const { isMobile } = useResponsive();

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

  // The desktop toolbar keeps a snapshot of the items and refreshes it only when the ids
  // change, so a bound item must stay live: `disabled` and the handler read the context
  // when used, not when bound.
  const boundItems = new WeakMap<IToolbarItem, ResolvedToolbarItem>();

  function bindContext(item: IToolbarItem): ResolvedToolbarItem {
    let bound = boundItems.get(item);
    if (!bound) {
      const { clickHandler } = item;
      bound = {
        ...item,
        disabled: computed(() => resolveReactiveBoolean(item.disabled, descriptor?.value, context.value)),
        // The handler may be async; return its promise so the button can show it is busy
        clickHandler: clickHandler
          ? () => clickHandler.call(item, descriptor?.value, context.value) as void | Promise<void>
          : undefined,
      };
      boundItems.set(item, bound);
    }
    return bound;
  }

  const visibleItems = computed(() => {
    const ctx = context.value;
    // getToolbarItems reads from reactive registry (blade-scoped + global "*"),
    // so Vue automatically tracks changes to toolbar items for this blade.
    return getToolbarItems(registrationBladeId.value, bladeName.value)
      .filter(
        (item) =>
          hasAccess(item.permissions) &&
          resolveVisibility(item.isVisible, descriptor?.value, ctx) &&
          (isMobile.value ? !resolveReactiveBoolean(item.disabled, descriptor?.value, ctx) : true),
      )
      .sort((a, b) => {
        const priorityA = a.priority ?? 0;
        const priorityB = b.priority ?? 0;
        return priorityB - priorityA;
      })
      .map(bindContext);
  });

  // Keyboard shortcuts run outside the blade's tree and look the context up by blade id
  let unregisterContext = bladeContext ? registerBladeContext(registrationBladeId.value, context) : undefined;

  watch(items, () => updateItems(), { deep: true, immediate: true });

  watch(bladeId, (newBladeId, oldBladeId) => {
    if (newBladeId === oldBladeId) return;
    clearToolbarItems(oldBladeId);
    registrationBladeId.value = newBladeId;
    updateItems();
    if (unregisterContext) {
      unregisterContext();
      unregisterContext = registerBladeContext(newBladeId, context);
    }
  });

  onBeforeUnmount(() => {
    clearToolbarItems();
    unregisterContext?.();
  });

  return { visibleItems };
}
