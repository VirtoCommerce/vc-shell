import { computed } from "vue";
import { FALLBACK_BLADE_ID } from "../../../../core/constants";
import type { IBladeInstance } from "../../../../shared/components/blade-navigation/types";

/**
 * Default fallback for `inject(BladeInstance)` when no blade context is provided.
 * Used in vc-blade.vue, BladeHeader, and WidgetContainer so all three share a
 * single canonical shape instead of divergent inline fallbacks.
 */
export const DEFAULT_BLADE_INSTANCE = computed<IBladeInstance>(() => ({
  id: FALLBACK_BLADE_ID,
  error: null,
  expandable: false,
  maximized: false,
  navigation: undefined,
  breadcrumbs: undefined,
  param: undefined,
  options: undefined,
}));
