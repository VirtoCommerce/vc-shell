import { ConcreteComponent, reactive, ref, ComponentInternalInstance } from "vue";

export type WidgetEventHandler = (...args: unknown[]) => void;

export interface IWidgetEvents {
  [key: string]: Set<WidgetEventHandler>;
}

export interface IWidget {
  id: string;
  title?: string;
  component: ConcreteComponent;
  props?: Record<string, unknown>;
  events?: Record<string, unknown>;
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
  setActiveWidget: (ref: ComponentInternalInstance["exposed"]) => void;
  updateActiveWidget: () => void;
  isWidgetRegistered: (id: string) => boolean;
}

export interface IWidgetContainer {
  registerWidget: (widget: IWidget, bladeId: string) => void;
  isWidgetRegistered: (id: string) => boolean;
  setActiveWidget: (ref: ComponentInternalInstance["exposed"]) => void;
}

export function createWidgetService(): IWidgetService {
  const widgetRegistry = reactive<Record<string, IWidget[]>>({});
  const registeredWidgets = reactive<IWidgetRegistration[]>([]);
  const activeWidgetRef = ref();
  const registeredIds = reactive(new Set<string>());

  const registerWidget = (widget: IWidget, bladeId: string): void => {
    if (!widgetRegistry[bladeId]) {
      widgetRegistry[bladeId] = [];
    }

    const existingIndex = widgetRegistry[bladeId].findIndex((w) => w.id === widget.id);
    if (existingIndex === -1) {
      widgetRegistry[bladeId].push(widget);
      registeredWidgets.push({ bladeId, widget });
      registeredIds.add(widget.id);
    }
  };

  const unregisterWidget = (widgetId: string, bladeId: string): void => {
    if (widgetRegistry[bladeId]) {
      const index = widgetRegistry[bladeId].findIndex((w) => w.id === widgetId);
      if (index !== -1) {
        widgetRegistry[bladeId].splice(index, 1);
        registeredIds.delete(widgetId);
      }
    }

    const regIndex = registeredWidgets.findIndex((w) => w.bladeId === bladeId && w.widget.id === widgetId);
    if (regIndex !== -1) {
      registeredWidgets.splice(regIndex, 1);
    }
  };

  const getWidgets = (bladeId: string): IWidget[] => {
    return widgetRegistry[bladeId] || [];
  };

  const clearBladeWidgets = (bladeId: string): void => {
    if (widgetRegistry[bladeId]) {
      widgetRegistry[bladeId].forEach((widget) => {
        registeredIds.delete(widget.id);
      });
      delete widgetRegistry[bladeId];
    }

    const indices = registeredWidgets
      .map((w, i) => (w.bladeId === bladeId ? i : -1))
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

  return {
    registerWidget,
    unregisterWidget,
    getWidgets,
    clearBladeWidgets,
    registeredWidgets,
    setActiveWidget,
    updateActiveWidget,
    isWidgetRegistered,
  };
}
