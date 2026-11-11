import { computed, inject, type ComputedRef } from "vue";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { getExternalSearchFilters } from "@core/services/search-filters-service";

/** Other modules registered fields for this bar name (or, without one, the enclosing blade's name) */
export function useHasExternalSearchFields(name: () => string | undefined): ComputedRef<boolean> {
  const descriptor = inject(BladeDescriptorKey, undefined);
  return computed(() => {
    const target = name() ?? descriptor?.value?.name;
    return !!target && getExternalSearchFilters(target).some((r) => r.fields.length > 0);
  });
}
