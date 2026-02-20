import { computed, inject, onMounted, onUnmounted, watch, toValue, Ref, ComputedRef } from "vue";
import { WidgetServiceKey, BladeInstance } from "@framework/injection-keys";
import { IWidget } from "@core/services";
import { useBlade } from "@core/composables";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-external-widgets");

export interface UseExternalWidgetsOptions {
  bladeId: Ref<string> | string;
  bladeData: Ref<Record<string, unknown>> | ComputedRef<Record<string, unknown>>;
}

export function useExternalWidgets(options: UseExternalWidgetsOptions) {
  const { bladeId, bladeData } = options;

  const widgetService = inject(WidgetServiceKey);
  const blade = useBlade();

  // Normalize bladeId to lowercase for consistency
  const normalizedBladeId = computed(() => blade?.value.id?.toLowerCase() ?? "");

  const registeredExternalWidgetIds = new Set<string>();

  const registerExternalWidgets = () => {
    if (!widgetService || !blade?.value.id) {
      logger.warn("Widget service or blade instance not available");
      return;
    }

    const allExternalWidgets = widgetService.getAllExternalWidgets();
    const targetBladeId = toValue(bladeId);

    const filteredWidgets = allExternalWidgets.filter(
      (widget) => widget.targetBlades?.includes(targetBladeId) ?? false,
    );

    filteredWidgets.forEach((externalWidget) => {
      if (registeredExternalWidgetIds.has(externalWidget.id)) {
        return;
      }

      const widgetClone = widgetService.cloneWidget(externalWidget);

      const newWidget: IWidget = {
        ...widgetClone,
        props: widgetService.resolveWidgetProps(widgetClone, toValue(bladeData)),
      };

      try {
        widgetService.registerWidget(newWidget, normalizedBladeId.value);
        registeredExternalWidgetIds.add(externalWidget.id);
      } catch (error) {
        logger.error(`Failed to register external widget '${externalWidget.id}':`, error);
      }
    });
  };

  const updateWidgetProps = () => {
    if (!widgetService || !blade?.value.id) return;

    registeredExternalWidgetIds.forEach((widgetId) => {
      const widget = widgetService.getWidgets(normalizedBladeId.value).find((w) => w.id === widgetId);

      if (widget) {
        try {
          const resolvedProps = widgetService.resolveWidgetProps(widget, toValue(bladeData));
          widgetService.updateWidget({
            id: widget.id,
            bladeId: blade.value.id,
            widget: { props: resolvedProps },
          });
        } catch (error) {
          logger.error(`Failed to update props for widget '${widget.id}':`, error);
        }
      }
    });
  };

  const unregisterExternalWidgets = () => {
    if (!widgetService || !normalizedBladeId.value) return;

    registeredExternalWidgetIds.forEach((widgetId) => {
      try {
        widgetService.unregisterWidget(widgetId, normalizedBladeId.value);
      } catch (error) {
        logger.error(`Failed to unregister external widget '${widgetId}':`, error);
      }
    });
    registeredExternalWidgetIds.clear();
  };

  onMounted(registerExternalWidgets);
  onUnmounted(unregisterExternalWidgets);

  watch(
    () => toValue(bladeData),
    () => {
      updateWidgetProps();
    },
    { deep: true },
  );

  return {
    registeredExternalWidgetIds: computed(() => Array.from(registeredExternalWidgetIds)),
  };
}
