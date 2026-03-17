import { type ComputedRef, type Ref, onMounted, onUnmounted, inject } from "vue";
import { WidgetServiceKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@shared/components/blade-navigation/types";
import type { IWidget, IHeadlessWidgetFields } from "@core/services/widget-service";
import { createLogger, InjectionError } from "@core/utilities";

const logger = createLogger("use-blade-widgets");

export interface HeadlessWidgetDeclaration {
  id: string;
  icon: string;
  title: string;
  badge?: Ref<number | string> | ComputedRef<number | string>;
  loading?: Ref<boolean> | ComputedRef<boolean>;
  disabled?: Ref<boolean> | ComputedRef<boolean> | boolean;
  isVisible?: ComputedRef<boolean> | Ref<boolean> | boolean;
  onClick?: () => void;
  onRefresh?: () => void | Promise<void>;
}

export interface UseBladeWidgetsReturn {
  /** Call trigger.onRefresh on a specific widget */
  refresh: (widgetId: string) => void;
  /** Call trigger.onRefresh on all blade widgets that have a trigger */
  refreshAll: () => void;
}

/**
 * Declarative headless widget registration for blades.
 * Automatically registers on mount, unregisters on unmount.
 * Gets bladeId from blade context (BladeDescriptorKey).
 *
 * @example
 * ```ts
 * const { refreshAll } = useBladeWidgets([
 *   { id: "OffersWidget", icon: "lucide-tag", title: "OFFERS.TITLE",
 *     badge: count, onClick: () => openBlade({ name: "Offers" }) },
 * ]);
 * ```
 */
export function useBladeWidgets(widgets: HeadlessWidgetDeclaration[]): UseBladeWidgetsReturn {
  const _service = inject(WidgetServiceKey);
  if (!_service) {
    throw new InjectionError("WidgetService");
  }
  const widgetService = _service;

  const descriptor = inject(BladeDescriptorKey, undefined);
  if (!descriptor) {
    throw new Error(
      "[vc-shell] useBladeWidgets() requires blade context (BladeDescriptorKey). " +
      "It must be called inside a blade component rendered by VcBladeSlot.",
    );
  }

  const bladeId = descriptor.value.id;

  onMounted(() => {
    for (const decl of widgets) {
      widgetService.registerWidget(buildWidget(decl), bladeId);
    }
  });

  onUnmounted(() => {
    for (const decl of widgets) {
      widgetService.unregisterWidget(decl.id, bladeId);
    }
  });

  function refresh(widgetId: string): void {
    const registered = widgetService.getWidgets(bladeId);
    const widget = registered.find((w) => w.id === widgetId);
    if (widget?.trigger?.onRefresh) {
      widget.trigger.onRefresh();
    } else {
      logger.warn(`Widget '${widgetId}' has no trigger.onRefresh registered.`);
    }
  }

  function refreshAll(): void {
    const registered = widgetService.getWidgets(bladeId);
    for (const widget of registered) {
      if (widget.trigger?.onRefresh) {
        widget.trigger.onRefresh();
      }
    }
  }

  return { refresh, refreshAll };
}

// ── Internal ─────────────────────────────────────────────────────────────────

function buildWidget(decl: HeadlessWidgetDeclaration): IWidget {
  const headless: IHeadlessWidgetFields = {
    icon: decl.icon,
    badge: decl.badge,
    loading: decl.loading,
    disabled: decl.disabled,
    onClick: decl.onClick,
    onRefresh: decl.onRefresh,
  };

  return {
    id: decl.id,
    title: decl.title,
    isVisible: decl.isVisible,
    headless,
    trigger: decl.onRefresh ? { onRefresh: decl.onRefresh } : undefined,
  };
}
