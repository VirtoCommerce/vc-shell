import { reactive, Component } from "vue";
import { createPreregistrationBus } from "@core/services/_internal";

export interface DashboardWidgetSize {
  width: number;
  height: number;
}

export interface DashboardWidgetPosition {
  x: number;
  y: number;
}

export interface DashboardWidget {
  id: string;
  name: string;
  component: Component;
  size: DashboardWidgetSize;
  position?: DashboardWidgetPosition;
  permissions?: string[];
  props?: Record<string, unknown>;
}

export interface IDashboardService {
  registerWidget: (widget: DashboardWidget) => void;
  getWidgets: () => DashboardWidget[];
  updateWidgetPosition: (widgetId: string, position: DashboardWidgetPosition) => void;
  getLayout: () => ReadonlyMap<string, DashboardWidgetPosition>;
}

export interface CreateDashboardServiceOptions {
  hasAccess?: (permissions: string[] | undefined) => boolean;
}

export const dashboardBus = createPreregistrationBus<DashboardWidget, IDashboardService>({
  name: "dashboard-service",
  getKey: (widget) => widget.id,
  registerIntoService: (service, widget) => service.registerWidget(widget),
});

/**
 * Registers a widget before the service is initialized.
 */
export function registerDashboardWidget(widget: DashboardWidget): void {
  dashboardBus.preregister(widget);
}

const createState = () => ({
  widgets: reactive<Map<string, DashboardWidget>>(new Map()),
  layout: reactive<Map<string, DashboardWidgetPosition>>(new Map()),
});

/**
 * Creates a service for managing dashboard widgets.
 */
export function createDashboardService(options: CreateDashboardServiceOptions = {}): IDashboardService {
  const state = createState();
  const hasAccess = options.hasAccess ?? (() => true);

  const registerWidget = (widget: DashboardWidget): void => {
    if (state.widgets.has(widget.id)) {
      throw new Error(`Widget with id ${widget.id} already registered`);
    }

    state.widgets.set(widget.id, {
      ...widget,
      permissions: widget.permissions ? [...widget.permissions] : undefined,
      position: widget.position ? { ...widget.position } : undefined,
      props: widget.props ? { ...widget.props } : undefined,
    });

    if (widget.position) {
      state.layout.set(widget.id, { ...widget.position });
    }
  };

  const getWidgets = (): DashboardWidget[] => {
    return Array.from(state.widgets.values())
      .filter((widget) => !widget.permissions || widget.permissions.length === 0 || hasAccess(widget.permissions))
      .map((widget) => ({
        ...widget,
        permissions: widget.permissions ? [...widget.permissions] : undefined,
        position: widget.position ? { ...widget.position } : undefined,
        props: widget.props ? { ...widget.props } : undefined,
      }));
  };

  const updateWidgetPosition = (widgetId: string, position: DashboardWidgetPosition): void => {
    if (!state.widgets.has(widgetId)) {
      throw new Error(`Widget with id ${widgetId} not found`);
    }

    state.layout.set(widgetId, { ...position });
  };

  const getLayout = (): ReadonlyMap<string, DashboardWidgetPosition> => {
    return new Map(state.layout);
  };

  const service: IDashboardService = {
    registerWidget,
    getWidgets,
    updateWidgetPosition,
    getLayout,
  };

  dashboardBus.replayInto(service);

  return service;
}
