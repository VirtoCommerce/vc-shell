import { reactive, Component } from "vue";
import { DashboardServiceKey } from "../../injection-keys";
import { usePermissions } from "../composables/usePermissions";

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
  getLayout: () => Map<string, DashboardWidgetPosition>;
}

// Global state for pre-registering widgets
const preregisteredWidgets: DashboardWidget[] = [];

/**
 * Registers a widget before the service is initialized
 */
export function registerDashboardWidget(widget: DashboardWidget): void {
  const existingWidget = preregisteredWidgets.find((w) => w.id === widget.id);
  if (!existingWidget) {
    preregisteredWidgets.push(widget);
  }
}

const createState = () => ({
  widgets: reactive<Map<string, DashboardWidget>>(new Map()),
  layout: reactive<Map<string, DashboardWidgetPosition>>(new Map()),
});

/**
 * Creates a service for managing dashboard widgets
 */
export function createDashboardService(): IDashboardService {
  const state = createState();
  const { hasAccess } = usePermissions();

  const registerWidget = (widget: DashboardWidget): void => {
    if (state.widgets.has(widget.id)) {
      throw new Error(`Widget with id ${widget.id} already registered`);
    }

    state.widgets.set(widget.id, widget);

    // If the position is not specified, we don't set it here
    // The DraggableDashboard component will handle finding a free position
    if (widget.position) {
      state.layout.set(widget.id, widget.position);
    }
    // If no position is specified, the widget will be placed by the dashboard component
    // to avoid collisions with existing widgets
  };

  /**
   * Returns a list of widgets with access rights
   */
  const getWidgets = (): DashboardWidget[] => {
    return Array.from(state.widgets.values()).filter((widget) => {
      // If the widget has no permissions requirements, show it to everyone
      if (!widget.permissions || widget.permissions.length === 0) {
        return true;
      }

      // Check if the user has the necessary permissions
      return hasAccess(widget.permissions);
    });
  };

  const updateWidgetPosition = (widgetId: string, position: DashboardWidgetPosition): void => {
    if (!state.widgets.has(widgetId)) {
      throw new Error(`Widget with id ${widgetId} not found`);
    }

    state.layout.set(widgetId, position);
  };

  const getLayout = (): Map<string, DashboardWidgetPosition> => {
    return state.layout;
  };

  // Register pre-registered widgets
  preregisteredWidgets.forEach((widget) => {
    try {
      registerWidget(widget);
    } catch (e) {
      console.warn(`Failed to register preregistered widget ${widget.id}:`, e);
    }
  });

  return {
    registerWidget,
    getWidgets,
    updateWidgetPosition,
    getLayout,
  };
}
