import { type Component, type ComputedRef, type Ref, onMounted, onUnmounted, inject } from "vue";
import { WidgetServiceKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@shared/components/blade-navigation/types";
import type { IWidget } from "@core/services/widget-service";
import { createLogger, InjectionError } from "@core/utilities";

const logger = createLogger("use-blade-widgets");

export interface WidgetDeclaration {
  id: string;
  component: Component;
  props?: Record<string, unknown>;
  events?: Record<string, unknown>;
  isVisible?: ComputedRef<boolean> | Ref<boolean> | boolean;
  /** @deprecated Use useWidget().setTrigger() inside the widget instead */
  updateFunctionName?: string;
}

export interface UseBladeWidgetsReturn {
  /** Call trigger.onRefresh on a specific widget */
  refresh: (widgetId: string) => void;
  /** Call trigger.onRefresh on all blade widgets that have a trigger */
  refreshAll: () => void;
}

/**
 * Declarative widget registration for blades.
 * Automatically registers on mount, unregisters on unmount.
 * Gets bladeId from blade context (BladeDescriptorKey).
 *
 * @example
 * ```ts
 * const { refreshAll } = useBladeWidgets([
 *   { id: "OffersWidget", component: OffersWidget, props: { item } },
 *   { id: "VideosWidget", component: VideosWidget, props: { item, disabled } },
 * ]);
 *
 * async function reload() {
 *   await fetchProduct();
 *   refreshAll();
 * }
 * ```
 */
export function useBladeWidgets(widgets: WidgetDeclaration[]): UseBladeWidgetsReturn {
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
      const widget: IWidget = {
        id: decl.id,
        component: decl.component,
        props: decl.props,
        events: decl.events,
        isVisible: decl.isVisible,
        updateFunctionName: decl.updateFunctionName,
      };
      widgetService.registerWidget(widget, bladeId);
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
