// Public API — factories NOT exported (internal framework use only via direct file import)
export { useBladeStack } from "@core/blade-navigation/useBladeStack";
export { useBladeMessaging } from "@core/blade-navigation/useBladeMessaging";
export * from "@core/blade-navigation/types";
export { __registerBladeConfig, getBladeConfig, getAllBladeConfigs } from "@core/blade-navigation/bladeConfigRegistry";
// Table query-state: page-facing pull-accessor only. The TableQueryStateKey service
// and createBladeQueryState factory stay internal (consumed directly by VcDataTable
// and the blade rendering layer).
export { useTableQueryState } from "@core/blade-navigation/table-query-state";
export type { UseTableQueryStateReturn, TableQueryPatch } from "@core/blade-navigation/table-query-state";
