import { Component, ref, ComponentInternalInstance, ComputedRef, Ref } from "vue";
import { IBladeInstance } from "@shared/components/blade-navigation/types";
import { cloneDeep } from "lodash-es";
import { createBladeScopedRegistry, createPreregistrationBus } from "@core/services/_internal";
import { createLogger } from "@core/utilities";

const logger = createLogger("widget-service");

export type WidgetEventHandler = (...args: unknown[]) => void;

export interface IWidgetEvents {
  [key: string]: Set<WidgetEventHandler>;
}

export interface IExposedWidget {
  id?: string;
  [key: string]: unknown;
}

export interface IWidgetConfig {
  requiredData?: string[];
  optionalData?: string[];
  propsResolver?: (bladeData: Record<string, unknown>) => Record<string, unknown>;
  fieldMapping?: Record<string, string>;
}

export interface IWidgetTrigger {
  /** Lucide icon name for dropdown rendering */
  icon?: string;
  /** Display title (fallback: IWidget.title) */
  title?: string;
  /** Reactive badge value */
  badge?: Ref<number | string> | ComputedRef<number | string>;
  /** Handler called when the widget is clicked in dropdown */
  onClick?: () => void;
  /** Handler called by updateActiveWidget to refresh data */
  onRefresh?: () => void | Promise<void>;
  /** Disabled state — static or reactive */
  disabled?: Ref<boolean> | ComputedRef<boolean> | boolean;
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
  /** Optional trigger contract for lightweight overflow rendering */
  trigger?: IWidgetTrigger;
}

export interface IWidgetRegistration {
  bladeId: string;
  widget: IWidget;
}

export interface IExternalWidgetRegistration {
  id: string;
  component: Component;
  config: IWidgetConfig;
  targetBlades?: string[];
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
  setActiveWidget: (args: { widgetId: string; exposed?: ComponentInternalInstance["exposed"] }) => void;
  updateActiveWidget: () => void;
  isWidgetRegistered: (id: string) => boolean;
  updateWidget: ({ id, bladeId, widget }: { id: string; bladeId: string; widget: Partial<IWidget> }) => void;
  resolveWidgetProps: (widget: IWidget, bladeData: Record<string, unknown>) => Record<string, unknown>;
  getExternalWidgetsForBlade: (bladeId: string) => IExternalWidgetRegistration[];
  getAllExternalWidgets: () => IExternalWidgetRegistration[];
  cloneWidget: <T extends IWidget | IExternalWidgetRegistration>(widget: T) => T;
}

// --- External widgets (module-level, independent of service instances) ---

const externalWidgets = new Map<string, IExternalWidgetRegistration>();

function normalizeTargetBlades(targetBlades?: string[]): string[] | undefined {
  return targetBlades?.map((bladeId) => bladeId.toLowerCase());
}

/**
 * Registers an external widget for use across different blades.
 */
export function registerExternalWidget(widget: IExternalWidgetRegistration): void {
  externalWidgets.set(widget.id, {
    ...widget,
    targetBlades: normalizeTargetBlades(widget.targetBlades),
  });
}

/**
 * Gets list of external widgets for a specific blade type.
 */
export function getExternalWidgetsForBlade(bladeId: string): IExternalWidgetRegistration[] {
  const normalizedBladeId = bladeId.toLowerCase();

  return Array.from(externalWidgets.values())
    .filter((widget) => !widget.targetBlades || widget.targetBlades.includes(normalizedBladeId))
    .map((widget) => ({ ...widget, targetBlades: widget.targetBlades ? [...widget.targetBlades] : undefined }));
}

/**
 * Gets all external widgets.
 */
export function getAllExternalWidgets(): IExternalWidgetRegistration[] {
  return Array.from(externalWidgets.values()).map((widget) => ({
    ...widget,
    targetBlades: widget.targetBlades ? [...widget.targetBlades] : undefined,
  }));
}

/**
 * Deep clones a widget definition to avoid accidental shared mutations.
 */
export function cloneWidget<T extends IWidget | IExternalWidgetRegistration>(widget: T): T {
  return cloneDeep(widget);
}

// --- Preregistration bus ---

export const widgetBus = createPreregistrationBus<IWidgetRegistration, IWidgetService>({
  name: "widget-service",
  getKey: (reg) => `${reg.bladeId.toLowerCase()}::${reg.widget.id}`,
  registerIntoService: (service, reg) => service.registerWidget(reg.widget, reg.bladeId),
});

/**
 * Registers a widget before the service is initialized.
 */
export function registerWidget(widget: IWidget, bladeId: string): void {
  const normalizedBladeId = bladeId.toLowerCase();
  widgetBus.preregister({
    bladeId: normalizedBladeId,
    widget,
  });
}

// --- Service factory ---

export function createWidgetService(): IWidgetService {
  const bladeRegistry = createBladeScopedRegistry<IWidget, IWidgetRegistration>({
    createRegistration: (bladeId, item) => ({ bladeId, widget: item }),
    getRegistrationBladeId: (r) => r.bladeId,
    getRegistrationItemId: (r) => r.widget.id,
  });

  const activeWidget = ref<{ exposed?: ComponentInternalInstance["exposed"]; widgetId: string } | undefined>();

  const resolveWidgetProps = (widget: IWidget, bladeData: Record<string, unknown>): Record<string, unknown> => {
    if (!widget.config) {
      return widget.props || {};
    }

    let resolvedProps: Record<string, unknown> = {};

    if (widget.config.propsResolver) {
      try {
        const customProps = widget.config.propsResolver(bladeData);
        resolvedProps = { ...widget.props, ...customProps };
      } catch (error) {
        logger.error(`Error in propsResolver for widget '${widget.id}':`, error);
        resolvedProps = { ...widget.props };
      }
    } else {
      resolvedProps = { ...widget.props };

      const { requiredData = [], optionalData = [], fieldMapping = {} } = widget.config;

      requiredData.forEach((key) => {
        const bladeKey = fieldMapping[key] || key;
        if (bladeData[bladeKey] !== undefined) {
          resolvedProps[key] = bladeData[bladeKey];
        } else {
          logger.warn(`Required data '${key}' not found in blade data for widget '${widget.id}'`);
          logger.warn(`Required data '${key}' not found in blade data for widget '${widget.id}'`);
        }
      });

      optionalData.forEach((key) => {
        const bladeKey = fieldMapping[key] || key;
        if (bladeData[bladeKey] !== undefined) {
          resolvedProps[key] = bladeData[bladeKey];
        }
      });
    }

    return resolvedProps;
  };

  const setActiveWidget = ({
    exposed,
    widgetId,
  }: {
    widgetId: string;
    exposed?: ComponentInternalInstance["exposed"];
  }): void => {
    activeWidget.value = { exposed, widgetId };
  };

  const updateActiveWidget = (): void => {
    const widgetId = activeWidget.value?.widgetId;
    if (!widgetId) return;

    const registration = bladeRegistry.registrations.find((r) => r.widget.id === widgetId);

    // Priority 1: trigger.onRefresh
    if (registration?.widget.trigger?.onRefresh) {
      registration.widget.trigger.onRefresh();
      return;
    }

    // Priority 2: legacy exposed[updateFunctionName]
    const activeExposed = activeWidget.value?.exposed as IExposedWidget | undefined;
    const functionNameToCall = registration?.widget.updateFunctionName;

    if (activeExposed && functionNameToCall && typeof activeExposed[functionNameToCall] === "function") {
      activeExposed[functionNameToCall]();
      return;
    }

    logger.warn(`Widget '${widgetId}' has no trigger.onRefresh and no exposed function '${functionNameToCall}'.`);
  };

  const getExternalWidgetsForBladeLocal = (bladeId: string): IExternalWidgetRegistration[] => {
    return getExternalWidgetsForBlade(bladeId.toLowerCase());
  };

  const service: IWidgetService = {
    registerWidget: (widget, bladeId) => bladeRegistry.register(widget, bladeId),
    unregisterWidget: (widgetId, bladeId) => bladeRegistry.unregister(widgetId, bladeId),
    getWidgets: (bladeId) => bladeRegistry.get(bladeId),
    clearBladeWidgets: (bladeId) => bladeRegistry.clear(bladeId),
    registeredWidgets: bladeRegistry.registrations,
    isActiveWidget: (id) => activeWidget.value?.widgetId === id,
    setActiveWidget,
    updateActiveWidget,
    isWidgetRegistered: (id) => bladeRegistry.isRegistered(id),
    updateWidget: ({ id, bladeId, widget }) => bladeRegistry.update(id, bladeId, widget),
    resolveWidgetProps,
    getExternalWidgetsForBlade: getExternalWidgetsForBladeLocal,
    getAllExternalWidgets,
    cloneWidget,
  };

  widgetBus.replayInto(service);

  return service;
}
