import { computed, inject, onMounted, watchEffect, Ref, ComputedRef } from "vue";
import { WidgetServiceKey, BladeInstance } from "../../injection-keys";
import { IWidget, IExternalWidgetRegistration } from "../../core/services/widget-service";

export interface UseExternalWidgetsOptions {
  bladeType: string;
  bladeData: Ref<Record<string, unknown>> | ComputedRef<Record<string, unknown>>;
  autoRegister?: boolean; // Automatic registration when mounted
  autoUpdateProps?: boolean; // Automatic update of props when data changes
}

export function useExternalWidgets(options: UseExternalWidgetsOptions) {
  const { bladeType, bladeData, autoRegister = true, autoUpdateProps = true } = options;

  const widgetService = inject(WidgetServiceKey);
  const blade = inject(BladeInstance);

  const registeredExternalWidgetIds = new Set<string>();

  const registerExternalWidgets = () => {
    if (!widgetService || !blade?.value.id) {
      console.warn("Widget service or blade ID not available");
      return;
    }

    const externalWidgets = widgetService.getExternalWidgetsForBlade(bladeType);

    externalWidgets.forEach((externalWidget) => {
      // Check if the widget is already registered
      if (registeredExternalWidgetIds.has(externalWidget.id)) {
        return;
      }

      const widget: IWidget = {
        id: externalWidget.id,
        component: externalWidget.component,
        config: externalWidget.config,
        isVisible: externalWidget.isVisible,
        title: externalWidget.title,
        updateFunctionName: externalWidget.updateFunctionName,
        // Initially allow props
        props: widgetService.resolveWidgetProps(
          { id: externalWidget.id, component: externalWidget.component, config: externalWidget.config },
          bladeData.value,
        ),
      };

      try {
        widgetService.registerWidget(widget, blade.value.id);
        registeredExternalWidgetIds.add(externalWidget.id);
      } catch (error) {
        console.error(`Failed to register external widget '${externalWidget.id}':`, error);
      }
    });
  };

  // Update widget props when blade data changes
  const updateWidgetProps = () => {
    if (!widgetService || !blade?.value.id) return;

    const widgets = widgetService.getWidgets(blade.value.id);

    widgets.forEach((widget) => {
      if (widget.config && registeredExternalWidgetIds.has(widget.id)) {
        try {
          const resolvedProps = widgetService.resolveWidgetProps(widget, bladeData.value);

          widgetService.updateWidget({
            id: widget.id,
            bladeId: blade.value.id,
            widget: { props: resolvedProps },
          });
        } catch (error) {
          console.error(`Failed to update props for widget '${widget.id}':`, error);
        }
      }
    });
  };

  // Unregister external widgets when unmounted
  const unregisterExternalWidgets = () => {
    if (!widgetService || !blade?.value.id) return;

    registeredExternalWidgetIds.forEach((widgetId) => {
      try {
        widgetService.unregisterWidget(widgetId, blade.value.id);
      } catch (error) {
        console.error(`Failed to unregister external widget '${widgetId}':`, error);
      }
    });

    registeredExternalWidgetIds.clear();
  };

  // Automatic registration when mounted
  if (autoRegister) {
    onMounted(registerExternalWidgets);
  }

  // Automatic update of props when blade data changes
  if (autoUpdateProps) {
    watchEffect(updateWidgetProps);
  }

  return {
    registerExternalWidgets,
    updateWidgetProps,
    unregisterExternalWidgets,
    registeredExternalWidgetIds: computed(() => Array.from(registeredExternalWidgetIds)),
  };
}
