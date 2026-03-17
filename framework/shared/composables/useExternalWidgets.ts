import { computed, inject, onMounted, onUnmounted, watch, toValue, Ref, ComputedRef } from "vue";
import { WidgetServiceKey } from "@framework/injection-keys";
import { IWidget } from "@core/services/widget-service";
import { useBlade } from "@core/composables/useBlade";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-external-widgets");

export interface UseExternalWidgetsOptions {
  bladeId: Ref<string> | string;
  bladeData: Ref<Record<string, unknown>> | ComputedRef<Record<string, unknown>>;
}

export interface UseExternalWidgetsReturn {
  registeredExternalWidgetIds: ComputedRef<string[]>;
}

export function useExternalWidgets(options: UseExternalWidgetsOptions): UseExternalWidgetsReturn {
  const { bladeId, bladeData } = options;

  const widgetService = inject(WidgetServiceKey);
  const { id: currentBladeId } = useBlade();

  // Normalize bladeId to lowercase for consistency
  const normalizedBladeId = computed(() => currentBladeId.value?.toLowerCase() ?? "");

  const registeredExternalWidgetIds = new Set<string>();

  const registerExternalWidgets = () => {
    if (!widgetService || !currentBladeId.value) {
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
        id: widgetClone.id,
        kind: "component",
        component: widgetClone.component,
        config: widgetClone.config,
        isVisible: widgetClone.isVisible,
        title: widgetClone.title,
        updateFunctionName: widgetClone.updateFunctionName,
        props: widgetService.resolveWidgetProps(
          { ...widgetClone, kind: "component" } as IWidget,
          toValue(bladeData),
        ),
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
    if (!widgetService || !currentBladeId.value) return;

    registeredExternalWidgetIds.forEach((widgetId) => {
      const widget = widgetService.getWidgets(normalizedBladeId.value).find((w) => w.id === widgetId);

      if (widget) {
        try {
          const resolvedProps = widgetService.resolveWidgetProps(widget, toValue(bladeData));
          widgetService.updateWidget({
            id: widget.id,
            bladeId: currentBladeId.value,
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
