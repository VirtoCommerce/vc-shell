import { Component, reactive, ref, ComponentInternalInstance, ComputedRef, Ref, getCurrentInstance } from "vue";
import { IBladeInstance } from "../../shared/components/blade-navigation/types";

export type WidgetEventHandler = (...args: unknown[]) => void;

export interface IWidgetEvents {
  [key: string]: Set<WidgetEventHandler>;
}

export interface IWidget {
  id: string;
  title?: string;
  component: Component;
  props?: Record<string, unknown>;
  events?: Record<string, unknown>;
  isVisible?: boolean | ComputedRef<boolean> | Ref<boolean> | ((blade?: IBladeInstance) => boolean);
  onOpen?: (blade: { id: string }) => void;
  onClose?: (blade: { id: string }) => void;
}

export interface IWidgetRegistration {
  bladeId: string;
  widget: IWidget;
}

export interface IWidgetService {
  registerWidget: (widget: IWidget, bladeId: string) => void;
  unregisterWidget: (widgetId: string, bladeId: string) => void;
  getWidgets: (bladeId: string) => IWidget[];
  clearBladeWidgets: (bladeId: string) => void;
  registeredWidgets: IWidgetRegistration[];
  isActiveWidget: (id: string) => boolean;
  setActiveWidget: (ref: ComponentInternalInstance["exposed"]) => void;
  updateActiveWidget: () => void;
  isWidgetRegistered: (id: string) => boolean;
  updateWidget: ({ id, bladeId, widget }: { id: string; bladeId: string; widget: Partial<IWidget> }) => void;
}

// Global state for pre-registering widgets
const preregisteredWidgets: IWidgetRegistration[] = [];
const preregisteredIds = new Set<string>();

/**
 * Registers a widget before the service is initialized
 */
export function registerWidget(widget: IWidget, bladeId: string): void {
  const normalizedBladeId = bladeId.toLowerCase();
  preregisteredWidgets.push({ bladeId: normalizedBladeId, widget });
  preregisteredIds.add(widget.id);
}

export function createWidgetService(): IWidgetService {
  const widgetRegistry = reactive<Record<string, IWidget[]>>({});
  const registeredWidgets = reactive<IWidgetRegistration[]>([]);
  const activeWidgetRef = ref();
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

  const updateWidget = ({ id, bladeId, widget }: { id: string; bladeId: string; widget: Partial<IWidget> }): void => {
    const normalizedBladeId = bladeId.toLowerCase();

    if (widgetRegistry[normalizedBladeId]) {
      const index = widgetRegistry[normalizedBladeId].findIndex((w) => w.id === id);
      if (index !== -1) {
        widgetRegistry[normalizedBladeId][index] = { ...widgetRegistry[normalizedBladeId][index], ...widget };
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

  const setActiveWidget = (ref: ComponentInternalInstance["exposed"]): void => {
    activeWidgetRef.value = undefined;

    activeWidgetRef.value = ref;
  };

  const updateActiveWidget = (): void => {
    if (!activeWidgetRef.value) {
      return;
    }

    if (activeWidgetRef.value?.updateActiveWidgetCount) {
      activeWidgetRef.value.updateActiveWidgetCount();
    }
  };

  const isWidgetRegistered = (id: string): boolean => {
    return registeredIds.has(id);
  };

  const isActiveWidget = (id: string): boolean => {
    return activeWidgetRef.value?.id === id;
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
  };
}
