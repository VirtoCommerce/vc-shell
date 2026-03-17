export * from "@shared/composables/useMenuExpanded";
export * from "@shared/composables/useModificationTracker";
export * from "@shared/composables/useTableSort";
export * from "@shared/composables/useTableSelection";
export * from "@shared/composables/useBladeWidgets";

/** @deprecated Use `useBladeWidgets()` for blade-side registration or `useWidget()` inside widgets. */
export { useWidgets, provideWidgetService, registerWidget, registerExternalWidget } from "@core/composables/useWidgets";
export type { UseWidgetsReturn } from "@core/composables/useWidgets";
