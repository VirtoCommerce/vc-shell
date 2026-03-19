// Transitional re-exports — these composables have moved to core/ and ui/
export * from "@core/composables/useMenuExpanded";
export * from "@core/composables/useModificationTracker";
export * from "@core/composables/useBladeWidgets";
export * from "@core/composables/useBladeContext";
export * from "@ui/composables/useTableSort";
export * from "@ui/composables/useTableSelection";

/** @deprecated Use `useBladeWidgets()` for blade-side registration or `useWidget()` inside widgets. */
export { useWidgets, provideWidgetService, registerWidget, registerExternalWidget } from "@core/composables/useWidgets";
export type { UseWidgetsReturn } from "@core/composables/useWidgets";
