import { Component, ComputedRef, Ref } from "vue";
import type { BladeDescriptor } from "@core/blade-navigation/types";
import { cloneDeep } from "lodash-es";
import { createBladeScopedRegistry, createPreregistrationBus } from "@core/services/_internal";

export type WidgetEventHandler = (...args: unknown[]) => void;

export interface IWidgetEvents {
  [key: string]: Set<WidgetEventHandler>;
}

export interface IExposedWidget {
  id?: string;
  [key: string]: unknown;
}

export interface IWidgetScope {
  /** Register trigger contract (onRefresh, onClick, badge) */
  setTrigger: (trigger: IWidgetTrigger) => void;
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
  /** Handler called to refresh widget data */
  onRefresh?: () => void | Promise<void>;
  /** Disabled state — static or reactive */
  disabled?: Ref<boolean> | ComputedRef<boolean> | boolean;
}

/** Fields present only on headless widgets (when `headless` is set on IWidget) */
export interface IHeadlessWidgetFields {
  icon: string;
  badge?: Ref<number | string> | ComputedRef<number | string>;
  loading?: Ref<boolean> | ComputedRef<boolean>;
  disabled?: Ref<boolean> | ComputedRef<boolean> | boolean;
  onClick?: () => void;
  onRefresh?: () => void | Promise<void>;
}

export interface IWidget {
  id: string;
  title?: string;
  /** @deprecated Use headless widgets via `useBladeWidgets()` or external widgets via `registerExternalWidget()` */
  component?: Component;
  /** @deprecated External widgets inject data via `injectBladeContext()` */
  props?: Record<string, unknown>;
  /** @deprecated External widgets inject data via `injectBladeContext()` */
  events?: Record<string, unknown>;
  isVisible?: boolean | ComputedRef<boolean> | Ref<boolean> | ((blade?: BladeDescriptor) => boolean);
  /** @deprecated Use headless widgets via `useBladeWidgets()` instead */
  updateFunctionName?: string;
  trigger?: IWidgetTrigger;
  /** When set, framework renders VcWidget from these fields instead of component */
  headless?: IHeadlessWidgetFields;
}

export interface IWidgetRegistration {
  bladeId: string;
  widget: IWidget;
}

export interface IExternalWidgetRegistration {
  id: string;
  component: Component;
  targetBlades?: string[];
  isVisible?: boolean | ComputedRef<boolean> | Ref<boolean> | ((blade?: BladeDescriptor) => boolean);
  title?: string;
  /** @deprecated Use headless widgets via `useBladeWidgets()` instead */
  updateFunctionName?: string;
}

export interface IWidgetService {
  registerWidget: (widget: IWidget, bladeId: string) => void;
  unregisterWidget: (widgetId: string, bladeId: string) => void;
  getWidgets: (bladeId: string) => IWidget[];
  updateWidget: ({ id, bladeId, widget }: { id: string; bladeId: string; widget: Partial<IWidget> }) => void;
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

  const getExternalWidgetsForBladeLocal = (bladeId: string): IExternalWidgetRegistration[] => {
    return getExternalWidgetsForBlade(bladeId.toLowerCase());
  };

  const service: IWidgetService = {
    registerWidget: (widget, bladeId) => bladeRegistry.register(widget, bladeId),
    unregisterWidget: (widgetId, bladeId) => bladeRegistry.unregister(widgetId, bladeId),
    getWidgets: (bladeId) => bladeRegistry.get(bladeId),
    updateWidget: ({ id, bladeId, widget }) => bladeRegistry.update(id, bladeId, widget),
    getExternalWidgetsForBlade: getExternalWidgetsForBladeLocal,
    getAllExternalWidgets,
    cloneWidget,
  };

  widgetBus.replayInto(service);

  return service;
}
