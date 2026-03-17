import { type Component, type ComputedRef, type Ref, onMounted, onUnmounted, inject } from "vue";
import { WidgetServiceKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@shared/components/blade-navigation/types";
import type { IWidget, IHeadlessWidgetFields } from "@core/services/widget-service";
import { createLogger, InjectionError } from "@core/utilities";

const logger = createLogger("use-blade-widgets");

// ── Headless widget declaration (Stage 2) ────────────────────────────────────

export interface HeadlessWidgetDeclaration {
  id: string;
  icon: string;
  title: string;
  badge?: Ref<number | string> | ComputedRef<number | string>;
  loading?: Ref<boolean> | ComputedRef<boolean>;
  isVisible?: ComputedRef<boolean> | Ref<boolean> | boolean;
  onClick?: () => void;
  onRefresh?: () => void | Promise<void>;
}

// ── Component widget declaration (Stage 1, for backwards compat) ─────────────

export interface ComponentWidgetDeclaration {
  id: string;
  component: Component;
  props?: Record<string, unknown>;
  events?: Record<string, unknown>;
  isVisible?: ComputedRef<boolean> | Ref<boolean> | boolean;
  /** @deprecated Use useWidget().setTrigger() inside the widget instead */
  updateFunctionName?: string;
}

/** @deprecated Use `HeadlessWidgetDeclaration` for new widgets */
export type WidgetDeclaration = ComponentWidgetDeclaration;

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
 * Accepts headless declarations (icon/title/badge/onClick — no .vue file)
 * or component declarations (component + props — SFC widgets).
 *
 * @example
 * ```ts
 * // Headless (Stage 2 — preferred for blade-local widgets)
 * const { refreshAll } = useBladeWidgets([
 *   { id: "OffersWidget", icon: "lucide-tag", title: "Offers", badge: count,
 *     onClick: () => openBlade({ name: "Offers" }) },
 * ]);
 *
 * // Component-based (Stage 1 — for backwards compat)
 * const { refreshAll } = useBladeWidgets([
 *   { id: "OffersWidget", component: OffersWidget, props: { item } },
 * ]);
 * ```
 */
export function useBladeWidgets(widgets: HeadlessWidgetDeclaration[]): UseBladeWidgetsReturn;
export function useBladeWidgets(widgets: ComponentWidgetDeclaration[]): UseBladeWidgetsReturn;
export function useBladeWidgets(
  widgets: HeadlessWidgetDeclaration[] | ComponentWidgetDeclaration[],
): UseBladeWidgetsReturn {
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
      const widget = isHeadlessDeclaration(decl)
        ? buildHeadlessWidget(decl)
        : buildComponentWidget(decl);
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

// ── Internal helpers ─────────────────────────────────────────────────────────

function isHeadlessDeclaration(
  decl: HeadlessWidgetDeclaration | ComponentWidgetDeclaration,
): decl is HeadlessWidgetDeclaration {
  return "icon" in decl && !("component" in decl);
}

function buildHeadlessWidget(decl: HeadlessWidgetDeclaration): IWidget {
  const headless: IHeadlessWidgetFields = {
    icon: decl.icon,
    badge: decl.badge,
    loading: decl.loading,
    onClick: decl.onClick,
    onRefresh: decl.onRefresh,
  };

  return {
    id: decl.id,
    kind: "headless",
    title: decl.title,
    isVisible: decl.isVisible,
    headless,
    trigger: decl.onRefresh ? { onRefresh: decl.onRefresh } : undefined,
  };
}

function buildComponentWidget(decl: ComponentWidgetDeclaration): IWidget {
  return {
    id: decl.id,
    kind: "component",
    component: decl.component,
    props: decl.props,
    events: decl.events,
    isVisible: decl.isVisible,
    updateFunctionName: decl.updateFunctionName,
  };
}
