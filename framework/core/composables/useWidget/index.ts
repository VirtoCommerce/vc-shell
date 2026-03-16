import { inject } from "vue";
import { WidgetIdKey, WidgetServiceKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@shared/components/blade-navigation/types";
import type { IWidgetTrigger } from "@core/services/widget-service";
import { InjectionError } from "@core/utilities";

export interface UseWidgetReturn {
  /** The widget's ID, auto-discovered from WidgetProvider */
  widgetId: string;
  /** Register trigger contract (badge, onRefresh, onClick) */
  setTrigger: (trigger: IWidgetTrigger) => void;
}

/**
 * Widget-side composable — auto-discovers widget identity from WidgetProvider
 * and provides `setTrigger()` to register refresh/badge contracts.
 *
 * Must be called inside a component wrapped by WidgetProvider (inside a blade).
 *
 * @example
 * ```ts
 * const { setTrigger } = useWidget();
 * setTrigger({ badge: count, onRefresh: fetchData });
 * ```
 */
export function useWidget(): UseWidgetReturn {
  const widgetId = inject(WidgetIdKey);
  if (!widgetId) {
    throw new InjectionError("WidgetIdKey");
  }

  const widgetService = inject(WidgetServiceKey);
  if (!widgetService) {
    throw new InjectionError("WidgetService");
  }

  // Widget is always rendered inside a blade — get bladeId for updateWidget
  const descriptor = inject(BladeDescriptorKey, undefined);
  const bladeId = descriptor?.value.id ?? "";

  function setTrigger(trigger: IWidgetTrigger): void {
    widgetService!.updateWidget({
      id: widgetId!,
      bladeId,
      widget: { trigger },
    });
  }

  return { widgetId, setTrigger };
}
