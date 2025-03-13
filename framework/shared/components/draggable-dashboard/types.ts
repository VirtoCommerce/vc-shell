import type { Component } from "vue";

/**
 * Position type for a widget on the dashboard grid
 */
export interface DashboardWidgetPosition {
  /**
   * X coordinate (left to right)
   * @minimum 0
   */
  x: number;

  /**
   * Y coordinate (top to bottom)
   * @minimum 0
   */
  y: number;
}

/**
 * Widget size type
 */
export interface DashboardWidgetSize {
  /**
   * Width in grid cells
   * @minimum 1
   * @maximum 12
   */
  width: number;

  /**
   * Height in grid cells
   * @minimum 1
   */
  height: number;
}

/**
 * Dashboard widget type
 */
export interface IDashboardWidget {
  /**
   * Unique widget identifier
   */
  id: string;

  /**
   * Widget title
   */
  name?: string;

  /**
   * Rendering component
   */
  component: Component;

  /**
   * Component properties
   */
  props?: Record<string, unknown>;

  /**
   * Widget size
   */
  size: DashboardWidgetSize;

  /**
   * Built-in widget position (optional)
   */
  position?: DashboardWidgetPosition;
}

/**
 * Drag event type
 */
export interface DashboardDragEvent {
  widget: IDashboardWidget;
  position: DashboardWidgetPosition;
}

/**
 * Grid configuration
 */
export interface DashboardGridConfig {
  /**
   * Number of columns in the grid
   * @default 12
   */
  columns: number;

  /**
   * Cell height in pixels
   * @default 80
   */
  cellHeight: number;
}
