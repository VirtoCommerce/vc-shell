import { computed, inject, onMounted, watchEffect, Ref, ComputedRef } from "vue";
import { WidgetServiceKey, BladeInstance } from "../../injection-keys";
import { IWidget } from "../../core/services/widget-service";

/**
 * Deep comparison function to check if props have changed
 */
function isPropsChanged(oldProps: Record<string, unknown>, newProps: Record<string, unknown>): boolean {
  const oldKeys = Object.keys(oldProps);
  const newKeys = Object.keys(newProps);

  // Quick check for key count difference
  if (oldKeys.length !== newKeys.length) {
    return true;
  }

  // Check each key for changes
  return newKeys.some((key) => {
    const oldValue = oldProps[key];
    const newValue = newProps[key];

    // For objects and arrays, do a shallow comparison
    if (typeof oldValue === "object" && typeof newValue === "object") {
      if (oldValue === null || newValue === null) {
        return oldValue !== newValue;
      }
      // For now, consider objects as changed if they're different references
      // In future, we might want to implement deep comparison
      return oldValue !== newValue;
    }

    return oldValue !== newValue;
  });
}

export interface UseExternalWidgetsOptions {
  bladeId: string;
  bladeData: Ref<Record<string, unknown>> | ComputedRef<Record<string, unknown>>;
  autoRegister?: boolean; // Automatic registration when mounted
  autoUpdateProps?: boolean; // Automatic update of props when data changes
}

export function useExternalWidgets(options: UseExternalWidgetsOptions) {
  const { bladeId, bladeData, autoRegister = true, autoUpdateProps = true } = options;

  const widgetService = inject(WidgetServiceKey);
  const blade = inject(BladeInstance);

  // Normalize bladeId to lowercase for consistency
  const normalizedBladeId = computed(() => bladeId.toLowerCase());

  const registeredExternalWidgetIds = new Set<string>();

  const registerExternalWidgets = () => {
    if (!widgetService || !normalizedBladeId.value) {
      console.warn("Widget service or blade ID not available");
      return;
    }

    const externalWidgets = widgetService.getExternalWidgetsForBlade(normalizedBladeId.value);

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
        widgetService.registerWidget(widget, normalizedBladeId.value);
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

          // Only update if props have actually changed to avoid unnecessary re-renders
          const currentProps = widget.props || {};
          const hasChanged = isPropsChanged(currentProps, resolvedProps);

          if (hasChanged) {
            widgetService.updateWidget({
              id: widget.id,
              bladeId: normalizedBladeId.value,
              widget: { props: resolvedProps },
            });
          }
        } catch (error) {
          console.error(`Failed to update props for widget '${widget.id}':`, error);
        }
      }
    });
  };

  // Unregister external widgets when unmounted
  const unregisterExternalWidgets = () => {
    if (!widgetService || !normalizedBladeId.value) return;

    registeredExternalWidgetIds.forEach((widgetId) => {
      try {
        widgetService.unregisterWidget(widgetId, normalizedBladeId.value);
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
