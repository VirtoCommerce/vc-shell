/**
 * Blade Logic Types
 *
 * These types define the structure of blade logic, handlers, toolbar, and state.
 * Used across the codebase for type safety in blade generation.
 */

export interface ToolbarAction {
  id: string;
  icon: string;
  title?: string;
  action: string;
  condition?: string;
}

export interface StateDefinition {
  source: "composable" | "local" | "prop";
  reactive: boolean;
  default?: unknown;
  description?: string;
}

export interface BladeLogic {
  handlers: Record<string, string>;
  toolbar: ToolbarAction[];
  state: Record<string, StateDefinition>;
}

export interface ComposableDefinition {
  name: string;
  methods: string[];
  mockData?: boolean;
}
