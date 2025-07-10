import { Component, reactive, ref, ComponentInternalInstance, ComputedRef, Ref, getCurrentInstance } from "vue";
import { IBladeInstance } from "../../shared/components/blade-navigation/types";
import { cloneDeep } from "lodash-es";

export type WidgetEventHandler = (...args: unknown[]) => void;

export interface IWidgetEvents {
  [key: string]: Set<WidgetEventHandler>;
}
export interface IExposedWidget {
  id?: string;
  [key: string]: unknown;
}

export interface IWidgetConfig {
  // Required data that the widget MUST receive
  requiredData?: string[];
  // Optional data that the widget can use if available
  optionalData?: string[];
  // Function to transform blade data into widget props
  propsResolver?: (bladeData: Record<string, unknown>) => Record<string, unknown>;
  // Field mapping (if names in blade and widget differ)
  fieldMapping?: Record<string, string>;
}

export interface IWidget {
  id: string;
  title?: string;
  component: Component;
  props?: Record<string, unknown>;
  config?: IWidgetConfig;
  events?: Record<string, unknown>;
  isVisible?: boolean | ComputedRef<boolean> | Ref<boolean> | ((blade?: IBladeInstance) => boolean);
  updateFunctionName?: string;
}

export interface IWidgetRegistration {
  bladeId: string;
  widget: IWidget;
}

// Interface for global registration of external widgets
export interface IExternalWidgetRegistration {
  id: string;
  component: Component;
  config: IWidgetConfig;
  targetBlades?: string[]; // For which blades is the widget intended
  isVisible?: boolean | ComputedRef<boolean> | Ref<boolean> | ((blade?: IBladeInstance) => boolean);
  title?: string;
  updateFunctionName?: string;
}

export interface IWidgetService {
  registerWidget: (widget: IWidget, bladeId: string) => void;
  unregisterWidget: (widgetId: string, bladeId: string) => void;
  getWidgets: (bladeId: string) => IWidget[];
  clearBladeWidgets: (bladeId: string) => void;
  registeredWidgets: IWidgetRegistration[];
  isActiveWidget: (id: string) => boolean;
  setActiveWidget: ({ exposed, widgetId }: { exposed: ComponentInternalInstance["exposed"]; widgetId: string }) => void;
  updateActiveWidget: () => void;
  isWidgetRegistered: (id: string) => boolean;
  updateWidget: ({ id, bladeId, widget }: { id: string; bladeId: string; widget: Partial<IWidget> }) => void;
  resolveWidgetProps: (widget: IWidget, bladeData: Record<string, unknown>) => Record<string, unknown>;
  getExternalWidgetsForBlade: (bladeId: string) => IExternalWidgetRegistration[];
  getAllExternalWidgets: () => IExternalWidgetRegistration[];
  cloneWidget: <T extends IWidget | IExternalWidgetRegistration>(widget: T) => T;
}

// Global state for pre-registering widgets
const preregisteredWidgets: IWidgetRegistration[] = [];
const preregisteredIds = new Set<string>();

// Global state for external widgets
const externalWidgets: IExternalWidgetRegistration[] = [];

/**
 * Registers a widget before the service is initialized
 */
export function registerWidget(widget: IWidget, bladeId: string): void {
  const normalizedBladeId = bladeId.toLowerCase();
  preregisteredWidgets.push({ bladeId: normalizedBladeId, widget });
  preregisteredIds.add(widget.id);
}

/**
 * Registers an external widget for use across different blades
 */
export function registerExternalWidget(widget: IExternalWidgetRegistration): void {
  externalWidgets.push(widget);
}

/**
 * Gets list of external widgets for a specific blade type
 */
export function getExternalWidgetsForBlade(bladeId: string): IExternalWidgetRegistration[] {
  return externalWidgets.filter((widget) => !widget.targetBlades || widget.targetBlades.includes(bladeId));
}

/**
 * Gets all external widgets
 */
export function getAllExternalWidgets(): IExternalWidgetRegistration[] {
  return externalWidgets;
}

/**
 * Deep clones a widget to avoid modifying the original registered widget
 * For now, this is a structured clone, but we can make it more robust if needed
 */
export function cloneWidget<T extends IWidget | IExternalWidgetRegistration>(widget: T): T {
  // Using structuredClone for a deep copy
  return cloneDeep(widget);
}

export function createWidgetService(): IWidgetService {
  const widgetRegistry = reactive<Record<string, IWidget[]>>({});
  const registeredWidgets = reactive<IWidgetRegistration[]>([]);
  const activeWidget = ref<{ exposed: ComponentInternalInstance["exposed"]; widgetId: string } | undefined>();
  const registeredIds = reactive(new Set<string>());

  const registerWidget = (widget: IWidget, bladeId: string): void => {
    const normalizedBladeId = bladeId.toLowerCase();

    if (!widgetRegistry[normalizedBladeId]) {
      widgetRegistry[normalizedBladeId] = [];
    }

    const existingIndex = widgetRegistry[normalizedBladeId].findIndex((w) => w.id === widget.id);
    if (existingIndex === -1) {
      widgetRegistry[normalizedBladeId].push(reactive(widget));
      registeredWidgets.push({ bladeId: normalizedBladeId, widget: reactive(widget) });
      registeredIds.add(widget.id);
    }
  };

  // Add method to resolve props
  const resolveWidgetProps = (widget: IWidget, bladeData: Record<string, unknown>): Record<string, unknown> => {
    // If no configuration, return existing props or empty object
    if (!widget.config) {
      return widget.props || {};
    }

    let resolvedProps: Record<string, unknown> = {};

    // If there is a custom resolver
    if (widget.config.propsResolver) {
      try {
        const customProps = widget.config.propsResolver(bladeData);
        resolvedProps = { ...widget.props, ...customProps };
      } catch (error) {
        console.error(`Error in propsResolver for widget '${widget.id}':`, error);
        // Fallback to existing props if resolver fails
        resolvedProps = { ...widget.props };
      }
    } else {
      // Start with existing props as base
      resolvedProps = { ...widget.props };

      // Standard logic for resolving props
      const { requiredData = [], optionalData = [], fieldMapping = {} } = widget.config;

      // Add required data
      requiredData.forEach((key) => {
        const bladeKey = fieldMapping[key] || key;
        if (bladeData[bladeKey] !== undefined) {
          resolvedProps[key] = bladeData[bladeKey];
        } else {
          console.warn(`Required data '${key}' not found in blade data for widget '${widget.id}'`);
        }
      });

      // Add optional data
      optionalData.forEach((key) => {
        const bladeKey = fieldMapping[key] || key;
        if (bladeData[bladeKey] !== undefined) {
          resolvedProps[key] = bladeData[bladeKey];
        }
      });
    }

    return resolvedProps;
  };

  const updateWidget = ({ id, bladeId, widget }: { id: string; bladeId: string; widget: Partial<IWidget> }): void => {
    const normalizedBladeId = bladeId.toLowerCase();

    if (widgetRegistry[normalizedBladeId]) {
      const index = widgetRegistry[normalizedBladeId].findIndex((w) => w.id === id);
      if (index !== -1) {
        // Preserve reactivity by updating properties instead of replacing the entire object
        const existingWidget = widgetRegistry[normalizedBladeId][index];

        // Update properties using Object.assign to maintain reactivity
        Object.assign(existingWidget, widget);
      }
    }
  };

  const unregisterWidget = (widgetId: string, bladeId: string): void => {
    const normalizedBladeId = bladeId.toLowerCase();

    if (widgetRegistry[normalizedBladeId]) {
      const index = widgetRegistry[normalizedBladeId].findIndex((w) => w.id === widgetId);
      if (index !== -1) {
        widgetRegistry[normalizedBladeId].splice(index, 1);
        registeredIds.delete(widgetId);
      }
    }

    const regIndex = registeredWidgets.findIndex((w) => w.bladeId === normalizedBladeId && w.widget.id === widgetId);
    if (regIndex !== -1) {
      registeredWidgets.splice(regIndex, 1);
    }
  };

  const getWidgets = (bladeId: string): IWidget[] => {
    const normalizedBladeId = bladeId ? bladeId.toLowerCase() : "";
    return widgetRegistry[normalizedBladeId] || [];
  };

  const clearBladeWidgets = (bladeId: string): void => {
    const normalizedBladeId = bladeId.toLowerCase();

    if (widgetRegistry[normalizedBladeId]) {
      widgetRegistry[normalizedBladeId].forEach((widget) => {
        registeredIds.delete(widget.id);
      });
      delete widgetRegistry[normalizedBladeId];
    }

    const indices = registeredWidgets
      .map((w, i) => (w.bladeId === normalizedBladeId ? i : -1))
      .filter((i) => i !== -1)
      .reverse();

    indices.forEach((index) => {
      registeredWidgets.splice(index, 1);
    });
  };

  const setActiveWidget = ({
    exposed,
    widgetId,
  }: {
    exposed: ComponentInternalInstance["exposed"];
    widgetId: string;
  }): void => {
    activeWidget.value = undefined;

    activeWidget.value = {
      exposed,
      widgetId,
    };
  };

  const updateActiveWidget = (): void => {
    const activeExposed = activeWidget.value?.exposed as IExposedWidget | undefined;

    if (!activeExposed) {
      return;
    }

    const widgetId = activeWidget.value?.widgetId;

    if (widgetId) {
      const registration = registeredWidgets.find((reg) => reg.widget.id === widgetId);
      const functionNameToCall = registration?.widget?.updateFunctionName;

      if (functionNameToCall && typeof activeExposed[functionNameToCall] === "function") {
        activeExposed[functionNameToCall]();
      } else {
        console.warn(`Widget '${widgetId}' does not have an exposed function named '${functionNameToCall}'.`);
      }
    }
  };

  const isWidgetRegistered = (id: string): boolean => {
    return registeredIds.has(id);
  };

  const isActiveWidget = (id: string): boolean => {
    return activeWidget.value?.widgetId === id;
  };

  const getExternalWidgetsForBladeLocal = (bladeId: string): IExternalWidgetRegistration[] => {
    return getExternalWidgetsForBlade(bladeId.toLowerCase());
  };

  preregisteredWidgets.forEach((widget) => {
    try {
      registerWidget(widget.widget, widget.bladeId);
    } catch (e) {
      console.warn(`Failed to register preregistered widget ${widget.widget.id}:`, e);
    }
  });

  return {
    registerWidget,
    unregisterWidget,
    getWidgets,
    clearBladeWidgets,
    registeredWidgets,
    isActiveWidget,
    setActiveWidget,
    updateActiveWidget,
    isWidgetRegistered,
    updateWidget,
    resolveWidgetProps,
    getExternalWidgetsForBlade: getExternalWidgetsForBladeLocal,
    getAllExternalWidgets,
    cloneWidget,
  };
}
